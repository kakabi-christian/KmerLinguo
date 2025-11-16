#app.py
from flask import Flask, request, jsonify
import speech_recognition as sr
import base64
import io

app = Flask(__name__)

@app.get("/")
def home():
    return jsonify({"message": "Service Python ML opérationnel !"})

@app.post("/analyser")
def analyser():
    
    try:
        # Récupérer l'audio encodé en base64
        audio_base64 = request.json.get("audio")

        if not audio_base64:
            return jsonify({"error": "Aucun audio reçu"}), 400

        # Convertir le base64 en bytes
        audio_bytes = io.BytesIO(base64.b64decode(audio_base64))

        # Init du recognizer
        recognizer = sr.Recognizer()

        # Charger le fichier audio
        with sr.AudioFile(audio_bytes) as source:
            audio = recognizer.record(source)

            # Reconnaissance vocale Google (français)
            texte = recognizer.recognize_google(audio, language="fr-FR")

        return jsonify({"texte": texte})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000)
