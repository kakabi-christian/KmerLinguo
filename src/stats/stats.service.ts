import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

 async getUserStats(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: {
      points: true,
      rankings: {
        include: { division: true },
        orderBy: { periodEnd: 'desc' },
        take: 1,
      },
      progressions: {
        include: { language: true },
      },
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

  // ---------------------------------------------
  // 1️⃣ POINTS / GAMIFICATION
  // ---------------------------------------------
  const totalPoints = user.points.reduce((acc, p) => acc + p.value, 0);

  // ---------------------------------------------
  // 2️⃣ CLASSEMENT / DIVISION
  // ---------------------------------------------
  const ranking = user.rankings[0] ?? null;

  // ---------------------------------------------
  // 3️⃣ PROGRESSION / QUESTIONS
  // ---------------------------------------------
  const progressions = user.progressions;

  const totalAnswered = progressions.length;
  const correct = progressions.filter((p) => p.isCorrect).length;
  const wrong = totalAnswered - correct;

  const accuracy = totalAnswered > 0 ? (correct / totalAnswered) * 100 : 0;

  const completedLessons = new Set(
    progressions.filter((p) => p.completed).map((p) => p.lessonId),
  ).size;

  // Questions par langue
  const questionsByLanguage = {};
  for (const p of progressions) {
    if (!questionsByLanguage[p.language.name]) {
      questionsByLanguage[p.language.name] = {
        total: 0,
        correct: 0,
        wrong: 0,
      };
    }
    questionsByLanguage[p.language.name].total++;
    if (p.isCorrect) questionsByLanguage[p.language.name].correct++;
    else questionsByLanguage[p.language.name].wrong++;
  }

  // ---------------------------------------------
  // 4️⃣ SERIES / STREAKS
  // ---------------------------------------------
  const series = user.series[0] ?? null;

  // ---------------------------------------------
  // 5️⃣ REWARDS
  // ---------------------------------------------
  const rewardStats = {
    totalRewards: user.rewards.length,
    rewardPoints: user.rewards.reduce((acc, r) => acc + r.points, 0),
  };

  // ---------------------------------------------
  // 6️⃣ FEEDBACK
  // ---------------------------------------------
  const feedbackStats = {
    count: user.feedbacks.length,
    averageRating:
      user.feedbacks.length > 0
        ? user.feedbacks.reduce((acc, f) => acc + f.rating, 0) /
          user.feedbacks.length
        : 0,
    lastFeedback:
      user.feedbacks.length > 0
        ? user.feedbacks.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime(),
          )[0]
        : null,
  };

  // ---------------------------------------------
  // 7️⃣ NOTIFICATIONS
  // ---------------------------------------------
  const notificationStats = {
    total: user.notifications.length,
    unread: user.notifications.filter((n) => !n.isRead).length,
    lastNotification:
      user.notifications.length > 0
        ? user.notifications.sort(
            (a, b) =>
              new Date(b.sentAt).getTime() -
              new Date(a.sentAt).getTime(),
          )[0]
        : null,
  };

  // ---------------------------------------------
  // 8️⃣ RELATIONS SOCIALES
  // ---------------------------------------------
  const subscriptionStats = {
    followers: user.subscriptionsFollowed.length,
    following: user.subscriptionsFollowing.length,
    activeFollowings: user.subscriptionsFollowing.filter((s) => s.isActive)
      .length,
  };

  // ---------------------------------------------
  // 🔥 RÉPONSE FINALE STRUCTURÉE
  // ---------------------------------------------
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

    progression: {
      totalAnswered,
      correct,
      wrong,
      accuracy: Number(accuracy.toFixed(2)),
      lessonsCompleted: completedLessons,
      byLanguage: questionsByLanguage,
    },

    rewards: rewardStats,

    feedback: feedbackStats,

    notifications: notificationStats,

    subscriptions: subscriptionStats,
  };
}

}
