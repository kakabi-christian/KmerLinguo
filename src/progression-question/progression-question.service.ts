import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ProgressionQuestionService {
  constructor(private prisma: PrismaService) {}

  async completeQuestion(userId: string, questionId: string, data: any) {
    return this.prisma.progressionQuestion.upsert({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
      create: {
        userId,
        questionId,
        lessonId: data.lessonId,
        languageId: data.languageId,
        isCorrect: data.isCorrect,
        completed: true,
      },
      update: {
        isCorrect: data.isCorrect,
        completed: true,
      },
    });
  }

  async getProgressForLesson(userId: string, lessonId: string) {
    return this.prisma.progressionQuestion.findMany({
      where: { userId, lessonId },
    });
  }
}
