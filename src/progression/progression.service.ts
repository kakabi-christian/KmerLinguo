import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProgressionDto } from './dto/create-progression.dto';

@Injectable()
export class ProgressionService {
  constructor(private readonly prisma: PrismaService) {}

  async createProgression(data: CreateProgressionDto) {
    // Ici on pourrait appeler Python pour vérifier audio ou traduction
    // Exemple : const isCorrect = await this.validateWithPython(data.userVoicePath);

    const progression = await this.prisma.progression.create({
      data: {
        userId: data.userId,
        lessonId: data.lessonId,
        questionId: data.questionId,
        languageId: data.languageId,
        userAnswer: data.userAnswer,
        userVoicePath: data.userVoicePath,
        isCorrect: data.isCorrect ?? false, // par défaut false
        completed: true,
      },
    });

    return progression;
  }

  async getProgressionByLesson(userId: string, lessonId: string) {
    return this.prisma.progression.findMany({
      where: { userId, lessonId },
      include: { question: { include: { answers: true } } },
    });
  }
}
