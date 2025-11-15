import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getUserStats(userId: string) {
    // Récupération des infos de l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        points: true,
        rankings: {
          include: {
            division: true,
          },
          orderBy: { periodEnd: 'desc' },
          take: 1,
        },
        progressions: true,
        rewards: true,
        feedbacks: true,
        notifications: true,
        subscriptionsFollowed: true,
        subscriptionsFollowing: true,
        series: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) return { message: 'User not found' };

    // CALCUL DES STATS
    const totalPoints = user.points.reduce((acc, p) => acc + p.value, 0);

    const ranking = user.rankings[0];

    const progressionStats = {
      totalAnswered: user.progressions.length,
      correct: user.progressions.filter((p) => p.isCorrect).length,
      wrong: user.progressions.filter((p) => !p.isCorrect).length,
      lessonsCompleted: new Set(
        user.progressions.filter((p) => p.completed).map((p) => p.lessonId),
      ).size,
    };

    const rewardStats = {
      totalRewards: user.rewards.length,
      rewardPoints: user.rewards.reduce((acc, r) => acc + r.points, 0),
    };

    const feedbackStats = {
      count: user.feedbacks.length,
      averageRating:
        user.feedbacks.length > 0
          ? user.feedbacks.reduce((acc, f) => acc + f.rating, 0) /
            user.feedbacks.length
          : 0,
    };

    const notificationStats = {
      total: user.notifications.length,
      unread: user.notifications.filter((n) => !n.isRead).length,
    };

    const subscriptionStats = {
      followers: user.subscriptionsFollowed.length,
      following: user.subscriptionsFollowing.length,
    };

    const series = user.series[0];

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      points: {
        totalPoints,
      },
      ranking: ranking
        ? {
            rank: ranking.rank,
            division: ranking.division.name,
            pointThreshold: ranking.division.pointThreshold,
            periodStart: ranking.periodStart,
            periodEnd: ranking.periodEnd,
          }
        : null,
      series,
      progression: progressionStats,
      rewards: rewardStats,
      feedback: feedbackStats,
      notifications: notificationStats,
      subscriptions: subscriptionStats,
    };
  }
}
