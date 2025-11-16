import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crée ou met à jour le feedback d'un utilisateur.
   * Si un feedback existe déjà pour ce userId, il sera mis à jour.
   */
  async upsertFeedback(userId: string, rating: number, comment?: string) {
    return this.prisma.feedback.upsert({
      where: { userId },
      update: {
        rating,
        comment,
        createdAt: new Date(), // mettre à jour la date
      },
      create: {
        userId,
        rating,
        comment,
      },
    });
  }

  /**
   * Récupérer le feedback d'un utilisateur
   * (optionnel si tu ne veux pas afficher l'ancien feedback)
   */
  async getUserFeedback(userId: string) {
    return this.prisma.feedback.findUnique({
      where: { userId },
    });
  }

  /**
   * Récupérer tous les feedbacks
   */
  async getAllFeedbacks() {
    return this.prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
