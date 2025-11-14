#encode_audo.py
import base64

with open("audio/test.wav", "rb") as audio_file:
    encoded = base64.b64encode(audio_file.read()).decode("utf-8")
    print(encoded)
