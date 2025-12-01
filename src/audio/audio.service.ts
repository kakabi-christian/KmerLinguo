import { Injectable } from '@nestjs/common';
import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class AudioService {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  /**
   * Convertit un fichier audio existant en une voix unique
   * Étapes :
   * 1️⃣ Transcrire l'audio en texte avec Whisper
   * 2️⃣ Générer un nouveau MP3 avec GPT TTS
   */
  async convertToVoice(fileName: string, voice: "alloy" | "verse" | "coral" = "alloy") {
    try {
      const inputPath = path.join(process.cwd(), "dist/uploads", fileName);
      const outputPath = path.join(process.cwd(), "dist/uploads", "converted_" + fileName);

      // Vérifier si le fichier existe
      if (!fs.existsSync(inputPath)) {
        throw new Error(`Le fichier ${fileName} n'existe pas dans dist/uploads`);
      }

      console.log(`📌 Transcription du fichier audio : ${fileName}`);

      // 🔹 Étape 1 : Transcription avec Whisper
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(inputPath),
        model: "whisper-1",
      });

      console.log(`✅ Texte transcrit : ${transcription.text}`);

      // 🔹 Étape 2 : Génération de la nouvelle voix avec TTS
      const speech = await this.openai.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: voice,
        input: transcription.text,
      });

      // 🔹 Sauvegarde du nouveau MP3
      const buffer = Buffer.from(await speech.arrayBuffer());
      fs.writeFileSync(outputPath, buffer);

      console.log(`🎉 Audio converti avec succès : ${outputPath}`);

      return {
        message: "Audio converted successfully",
        file: "converted_" + fileName,
      };

    } catch (error) {
      console.error("❌ Erreur lors de la conversion audio :", error);
      throw error;
    }
  }
}
