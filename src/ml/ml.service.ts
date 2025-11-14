import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';

@Injectable()
export class MlService {
  private pythonUrl = 'http://localhost:5000/analyser';

  constructor(private readonly prisma: PrismaService) {}

  async analyserEtEnregistrer(
    userId: string,
    questionId: string,
    lessonId: string,
    languageId: string,
    options: { audioFilePath?: string; userText?: string }, // audio ou texte
  ) {
    let userAnswer = '';

    // 🔹 Si audio est fourni → transcription via Python
    if (options.audioFilePath) {
      const audioBase64 = fs.readFileSync(options.audioFilePath, { encoding: 'base64' });
      const pythonResponse = await axios.post(this.pythonUrl, { audio: audioBase64 });
      userAnswer = pythonResponse.data.texte;
    } 
    // 🔹 Si texte est fourni directement
    else if (options.userText) {
      userAnswer = options.userText;
    } 
    else {
      throw new Error('Aucun audio ou texte fourni pour la réponse');
    }

    // 🔹 Récupérer les réponses correctes
    const correctAnswers = await this.prisma.answer.findMany({
      where: { questionId, isCorrect: true },
      select: { text: true },
    });

    // 🔹 Comparer et déterminer si la réponse est correcte
    const isCorrect = correctAnswers.some(ans =>
      ans.text.trim().toLowerCase() === userAnswer.trim().toLowerCase(),
    );

    // 🔹 Enregistrer la progression
    const progression = await this.prisma.progression.create({
      data: {
        userId,
        questionId,
        lessonId,
        languageId,
        userAnswer,
        userVoicePath: options.audioFilePath || null,
        isCorrect,
      },
    });

    return {
      progression,
      transcription: userAnswer,
      isCorrect,
    };
  }
}
