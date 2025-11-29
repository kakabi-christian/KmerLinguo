import speech_recognition as sr
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .models import Answer
import os
import json
import librosa
import numpy as np
from scipy.spatial.distance import cdist

# ----------------- ANALYSE AUDIO -----------------
@csrf_exempt
def analyze_audio(request):
    print("✅ Requête reçue:", request.method)

    if request.method != "POST":
        print("❌ Méthode non autorisée")
        return JsonResponse({"error": "POST only"}, status=405)

    if "audio" not in request.FILES:
        print("❌ Aucun fichier audio fourni")
        return JsonResponse({"error": "No audio file provided"}, status=400)

    audio_file = request.FILES["audio"]
    print("📁 Fichier audio reçu:", audio_file.name)

    file_path = default_storage.save("temp_audio.wav", ContentFile(audio_file.read()))
    full_path = default_storage.path(file_path)
    print("💾 Fichier temporaire sauvegardé:", full_path)

    recognizer = sr.Recognizer()

    try:
        with sr.AudioFile(full_path) as source:
            print("🎧 Lecture du fichier audio")
            audio_data = recognizer.record(source)

        print("📝 Transcription en cours...")
        text = recognizer.recognize_google(audio_data, language="fr-FR")
        print("✅ Transcription réussie:", text)

        if os.path.exists(full_path):
            os.remove(full_path)
            print("🗑️ Fichier temporaire supprimé")

        return JsonResponse({"success": True, "transcription": text})

    except sr.UnknownValueError:
        print("❌ Audio incompréhensible")
        return JsonResponse({"success": False, "error": "Could not understand audio"}, status=400)
    except sr.RequestError as e:
        print("❌ Erreur Google Speech API:", str(e))
        return JsonResponse({"success": False, "error": str(e)}, status=500)
    except Exception as e:
        print("❌ Erreur inattendue:", str(e))
        return JsonResponse({"success": False, "error": str(e)}, status=500)


# ----------------- RECEPTION REPONSES DE NESTJS -----------------
@csrf_exempt
def receive_answer(request):
    print("✅ Requête reçue pour receive_answer:", request.method)

    if request.method != "POST":
        print("❌ Méthode non autorisée")
        return JsonResponse({"error": "POST only"}, status=405)

    try:
        data = json.loads(request.body)
        print("📦 Données reçues:", data)

        answer_id = data.get("id")
        question_id = data.get("questionId")
        text = data.get("text")
        is_correct = data.get("isCorrect", False)
        print(f"ℹ️ answer_id={answer_id}, question_id={question_id}, text={text}, is_correct={is_correct}")

        if not answer_id or not question_id or text is None:
            print("❌ Champs obligatoires manquants")
            return JsonResponse({"success": False, "error": "Missing required fields"}, status=400)

        answer, created = Answer.objects.update_or_create(
            id=answer_id,
            defaults={
                "questionId": question_id,
                "text": text,
                "isCorrect": is_correct
            }
        )
        print(f"✅ Réponse {'créée' if created else 'mise à jour'} avec succès:", answer.id)

        return JsonResponse({"success": True, "created": created})

    except json.JSONDecodeError:
        print("❌ JSON invalide")
        return JsonResponse({"success": False, "error": "Invalid JSON"}, status=400)
    except Exception as e:
        print("❌ Erreur inattendue:", str(e))
        return JsonResponse({"success": False, "error": str(e)}, status=500)


# ----------------- VERIFICATION REPONSE UTILISATEUR -----------------
@csrf_exempt
def check_user_answer(request):
    print("✅ Requête reçue pour check_user_answer:", request.method)

    if request.method != "POST":
        print("❌ Méthode non autorisée")
        return JsonResponse({"error": "POST only"}, status=405)

    try:
        data = json.loads(request.body)
        print("📦 Données reçues:", data)

        question_id = data.get("questionId")
        user_answer = data.get("answer")
        print(f"ℹ️ question_id={question_id}, user_answer={user_answer}")

        if not question_id or user_answer is None:
            print("❌ questionId ou answer manquant")
            return JsonResponse({"success": False, "error": "Missing questionId or answer"}, status=400)

        correct_answers = Answer.objects.filter(questionId=question_id, isCorrect=True)
        correct_texts = [a.text.strip().lower() for a in correct_answers]
        print("✅ Réponses correctes trouvées:", correct_texts)

        is_correct = user_answer.strip().lower() in correct_texts
        print("🔍 Vérification de la réponse utilisateur:", is_correct)

        return JsonResponse({
            "success": True,
            "isCorrect": is_correct,
            "correctAnswers": correct_texts
        })

    except json.JSONDecodeError:
        print("❌ JSON invalide")
        return JsonResponse({"success": False, "error": "Invalid JSON"}, status=400)
    except Exception as e:
        print("❌ Erreur inattendue:", str(e))
        return JsonResponse({"success": False, "error": str(e)}, status=500)

@csrf_exempt
def check_user_answer_audio(request):
    """
    Vérifie la réponse de l'utilisateur en comparant l'audio envoyé
    avec les fichiers audio des réponses correctes.
    """
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)

    try:
        if "audio" not in request.FILES or "questionId" not in request.POST:
            return JsonResponse({"success": False, "error": "Missing audio file or questionId"}, status=400)

        question_id = request.POST["questionId"]
        user_audio_file = request.FILES["audio"]

        # Sauvegarde temporaire de l'audio utilisateur
        user_path = default_storage.save("temp_user.wav", ContentFile(user_audio_file.read()))
        user_full_path = default_storage.path(user_path)

        # Charger l'audio utilisateur
        y_user, sr_user = librosa.load(user_full_path, sr=None)

        # Récupérer tous les audios corrects pour la question
        correct_answers = Answer.objects.filter(questionId=question_id, isCorrect=True)
        is_correct = False

        for answer in correct_answers:
            if not answer.audioPath:
                continue  # Ignore si pas d'audio associé

            correct_audio_path = answer.audioPath  # chemin relatif ou absolu
            y_correct, sr_correct = librosa.load(correct_audio_path, sr=None)

            # Calcul de MFCC pour comparaison
            mfcc_user = librosa.feature.mfcc(y=y_user, sr=sr_user)
            mfcc_correct = librosa.feature.mfcc(y=y_correct, sr=sr_correct)

            # Distance DTW (Dynamic Time Warping)
            dist, _ = librosa.sequence.dtw(X=mfcc_user, Y=mfcc_correct, metric='euclidean')
            score = dist[-1, -1]

            # Plus le score est petit, plus l'audio est similaire
            if score < 500:  # seuil à ajuster selon tes tests
                is_correct = True
                break

        # Supprimer le fichier temporaire
        if os.path.exists(user_full_path):
            os.remove(user_full_path)

        return JsonResponse({
            "success": True,
            "isCorrect": is_correct
        })

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)
