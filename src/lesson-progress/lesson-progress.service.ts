import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LessonProgressService {
  constructor(private prisma: PrismaService) {}

  // ✅ Marquer une leçon comme complétée pour un utilisateur
  async completeLesson(userId: string, lessonId: string, languageId: string) {
    return this.prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        languageId,
        isCompleted: true,
        completedAt: new Date(),
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
      },
    });
  }

  // ✅ Récupérer la progression d'une leçon pour un utilisateur
  async getLessonProgress(userId: string, lessonId: string) {
    return this.prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });
  }
  async getLessonPoints(userId: string, lessonId: string) {
  // Récupérer toutes les questions de la leçon complétées par l'utilisateur
  const completedQuestions = await this.prisma.progressionQuestion.findMany({
    where: {
      userId,
      lessonId,
      completed: true,
    },
    select: {
      isCorrect: true, // on suppose que points sont ajoutés seulement si isCorrect
    },
  });

  // Calculer le total des points (ex: 2 points par réponse correcte)
  const pointsPerQuestion = 2;
  const totalPoints = completedQuestions.reduce((acc, q) => acc + (q.isCorrect ? pointsPerQuestion : 0), 0);

  return totalPoints;
}

}
