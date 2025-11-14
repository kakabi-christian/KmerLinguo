#testapi
import requests
import base64

# Chemin de ton fichier audio WAV
file_path = "audio/test.wav"

# Lire le fichier audio et encoder en base64
with open(file_path, "rb") as f:
    audio_base64 = base64.b64encode(f.read()).decode("utf-8")

# Préparer le JSON à envoyer
data = {
    "audio": audio_base64
}

# URL de ton API Flask
url = "http://127.0.0.1:5000/analyser"

# Envoyer la requête POST
response = requests.post(url, json=data)

# Afficher la réponse
if response.ok:
    print("✅ Réponse de l'API :", response.json())
else:
    print("❌ Erreur :", response.status_code, response.text)
