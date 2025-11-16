from flask import Flask, request, jsonify
import speech_recognition as sr
import base64
import librosa
import tempfile
import os

app = Flask(__name__)

# ---------- Utilitaires ----------
def decode_audio_base64(audio_base64: str) -> str:
    """Décoder l'audio base64 en fichier temporaire WAV."""
    audio_bytes = base64.b64decode(audio_base64)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_wav:
        temp_wav.write(audio_bytes)
        temp_wav_path = temp_wav.name
    return temp_wav_path

def cleanup_file(file_path: str):
    """Supprimer un fichier temporaire."""
    if os.path.exists(file_path):
        os.remove(file_path)

def transcrire_audio(wav_path: str) -> str:
    """Transcrire un fichier audio WAV en texte français."""
    recognizer = sr.Recognizer()
    with sr.AudioFile(wav_path) as source:
        audio_data = recognizer.record(source)
        texte = recognizer.recognize_google(audio_data, language="fr-FR")
    return texte

def get_audio_info(wav_path: str):
    """Retourne les informations audio : sample rate et durée en secondes."""
    audio_data, sr_rate = librosa.load(wav_path, sr=None)
    duration = librosa.get_duration(y=audio_data, sr=sr_rate)
    return sr_rate, duration

# ---------- Routes ----------
@app.get("/")
def home():
    return jsonify({"message": "Service Python ML opérationnel !"})

@app.post("/analyser")
def analyser():
    try:
        audio_base64 = request.json.get("audio")
        if not audio_base64:
            return jsonify({"error": "Aucun audio reçu"}), 400

        # Décoder l'audio en fichier temporaire WAV
        temp_wav_path = decode_audio_base64(audio_base64)

        # Transcription audio
        texte = transcrire_audio(temp_wav_path)

        # Infos audio
        sr_rate, duration = get_audio_info(temp_wav_path)

        # Supprimer le fichier temporaire
        cleanup_file(temp_wav_path)

        return jsonify({
            "texte": texte,
            "sample_rate": sr_rate,
            "duration_seconds": duration
        })

    except sr.UnknownValueError:
        cleanup_file(temp_wav_path)
        return jsonify({"error": "Impossible de reconnaître le discours"}), 400
    except sr.RequestError as e:
        cleanup_file(temp_wav_path)
        return jsonify({"error": f"Erreur service Google Speech: {str(e)}"}), 500
    except Exception as e:
        cleanup_file(temp_wav_path)
        return jsonify({"error": str(e)}), 500

# ---------- Lancement ----------
if __name__ == "__main__":
    app.run(port=5000, debug=True)
