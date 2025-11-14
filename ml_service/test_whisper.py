import requests
import base64

# Chemin vers ton fichier WAV
audio_path = "audio/christ.wav"

# Lire et encoder en Base64
with open(audio_path, "rb") as f:
    audio_base64 = base64.b64encode(f.read()).decode("utf-8")

# Préparer le JSON à envoyer à l'API Flask
data = {
    "audio": audio_base64,
    "lang": None  # None pour que Whisper détecte automatiquement la langue
}

# Appeler l'API
response = requests.post("http://127.0.0.1:5000/analyser", json=data)

# Afficher le résultat
print(response.json())
