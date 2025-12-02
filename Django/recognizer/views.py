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
from rapidfuzz import fuzz


# -------------------- ANALYSE AUDIO --------------------
@csrf_exempt
def analyze_audio(request):
    print("✅ Requête reçue:", request.method)

    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)

    if "audio" not in request.FILES:
        return JsonResponse({"error": "No audio file provided"}, status=400)

    audio_file = request.FILES["audio"]
    file_path = default_storage.save("temp_audio.wav", ContentFile(audio_file.read()))
    full_path = default_storage.path(file_path)

    recognizer = sr.Recognizer()

    try:
        with sr.AudioFile(full_path) as source:
            audio_data = recognizer.record(source)

        text = recognizer.recognize_google(audio_data, language="fr-FR")

        if os.path.exists(full_path):
            os.remove(full_path)

        return JsonResponse({"success": True, "transcription": text})

    except sr.UnknownValueError:
        return JsonResponse({"success": False, "error": "Could not understand audio"}, status=400)
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)



# -------------------- RECEVOIR LES RÉPONSES DE NESTJS --------------------
@csrf_exempt
def receive_answer(request):
    print("📩 Réception d’une réponse NestJS")

    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)

    try:
        data = json.loads(request.body)

        answer_id = data.get("id")
        question_id = data.get("questionId")
        text = data.get("text")
        is_correct = data.get("isCorrect", False)

        if not answer_id or not question_id or text is None:
            return JsonResponse({"success": False, "error": "Missing required fields"}, status=400)

        # On sauvegarde ou met à jour
        Answer.objects.update_or_create(
            id=answer_id,
            defaults={
                "questionId": question_id,
                "text": text,
                "isCorrect": is_correct
            }
        )

        return JsonResponse({"success": True})

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)



# -------------------- VERIFICATION TEXTE (FUZZY MATCHING) --------------------
@csrf_exempt
def check_user_answer(request):
    print("🔍 Vérification réponse texte")

    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)

    try:
        data = json.loads(request.body)

        question_id = data.get("questionId")
        user_answer = data.get("answer")

        if not question_id or user_answer is None:
            return JsonResponse({"success": False, "error": "Missing questionId or answer"}, status=400)

        # Normaliser
        user_text = user_answer.strip().lower()

        correct_answers = Answer.objects.filter(questionId=question_id, isCorrect=True)
        correct_texts = [a.text.strip().lower() for a in correct_answers]

        print("Réponses correctes:", correct_texts)

        best_score = 0
        for correct in correct_texts:
            score = fuzz.ratio(user_text, correct)  # 0-100
            best_score = max(best_score, score)

        is_correct = best_score >= 60  # seuil de validation

        return JsonResponse({
            "success": True,
            "isCorrect": is_correct,
            "similarityScore": best_score,
            "correctAnswers": correct_texts
        })

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)



# -------------------- VERIFICATION AUDIO (VOICE-TO-TEXT) --------------------
@csrf_exempt
def check_user_answer_audio(request):
    print("🎧 Vérification audio")

    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)

    try:
        if "audio" not in request.FILES or "questionId" not in request.POST:
            return JsonResponse({"success": False, "error": "Missing audio or questionId"}, status=400)

        question_id = request.POST["questionId"]
        user_audio_file = request.FILES["audio"]

        # Sauvegarde fichier utilisateur
        user_path = default_storage.save("temp_user.wav", ContentFile(user_audio_file.read()))
        user_full_path = default_storage.path(user_path)

        # Charger audio
        y_user, sr_user = librosa.load(user_full_path, sr=None)

        correct_answers = Answer.objects.filter(questionId=question_id, isCorrect=True)

        best_similarity = 0

        for answer in correct_answers:
            if not answer.audioPath:
                continue

            y_correct, sr_correct = librosa.load(answer.audioPath, sr=None)

            mfcc_user = librosa.feature.mfcc(y=y_user, sr=sr_user)
            mfcc_correct = librosa.feature.mfcc(y=y_correct, sr=sr_correct)

            dist, _ = librosa.sequence.dtw(X=mfcc_user, Y=mfcc_correct, metric='euclidean')
            raw_score = dist[-1, -1]

            # Normaliser en score 0–100
            similarity = max(0, 100 - (raw_score / 10))

            if similarity > best_similarity:
                best_similarity = similarity

        # Nettoyage
        if os.path.exists(user_full_path):
            os.remove(user_full_path)

        is_correct = best_similarity >= 50  # seuil audio

        return JsonResponse({
            "success": True,
            "isCorrect": is_correct,
            "audioScore": round(best_similarity, 2)
        })

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)
