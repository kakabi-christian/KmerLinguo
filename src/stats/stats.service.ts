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
        progressQuestion: {
          include: { language: true, lesson: true, question: true },
        },
        lessonProgress: {
          include: { lesson: true, language: true },
        },
        rewards: true,
        feedbacks: true,
        notifications: true,
        
        // 👇 MODIFIÉ : Nouveaux noms des relations
        followers: {
          include: {
            follower: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          where: { isActive: true },
        },
        following: {
          include: {
            following: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          where: { isActive: true },
        },
        
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
    const progressions = user.progressQuestion;

    const totalAnswered = progressions.length;
    const correct = progressions.filter((p) => p.isCorrect).length;
    const wrong = totalAnswered - correct;
    const accuracy = totalAnswered > 0 ? (correct / totalAnswered) * 100 : 0;

    // Leçons complétées
    const completedLessons = user.lessonProgress.filter((lp) => lp.isCompleted).length;

    // Questions par langue
    const questionsByLanguage = {};
    for (const p of progressions) {
      const langName = p.language?.name || 'Unknown';
      if (!questionsByLanguage[langName]) {
        questionsByLanguage[langName] = { total: 0, correct: 0, wrong: 0 };
      }
      questionsByLanguage[langName].total++;
      if (p.isCorrect) questionsByLanguage[langName].correct++;
      else questionsByLanguage[langName].wrong++;
    }

    // ---------------------------------------------
    // 4️⃣ SERIES / STREAKS
    // ---------------------------------------------
    const series = user.series[0] ?? null;
    const streakStats = {
      currentStreak: user.currentStreak,
      maxStreak: user.maxStreak,
      lastActivityAt: user.lastActivityAt,
    };

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
          ? user.feedbacks.reduce((acc, f) => acc + f.rating, 0) / user.feedbacks.length
          : 0,
      lastFeedback:
        user.feedbacks.length > 0
          ? user.feedbacks.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
              (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
            )[0]
          : null,
    };

    // ---------------------------------------------
    // 8️⃣ RELATIONS SOCIALES (FOLLOW/FOLLOWERS)
    // ---------------------------------------------
    // 👇 MODIFIÉ : Nouveau système de suivi
    const followStats = {
      // Nombre de personnes qui ME suivent (mes abonnés)
      followersCount: user.followers.length,
      
      // Nombre de personnes que JE suis (mes abonnements)
      followingCount: user.following.length,
      
      // Liste des followers avec leurs infos
      followersList: user.followers.map((f) => ({
        id: f.follower.id,
        name: `${f.follower.firstName} ${f.follower.lastName}`,
        followedAt: f.followedAt,
      })),
      
      // Liste des personnes que je suis
      followingList: user.following.map((f) => ({
        id: f.following.id,
        name: `${f.following.firstName} ${f.following.lastName}`,
        followedAt: f.followedAt,
      })),
    };

    // ---------------------------------------------
    // 🔥 RÉPONSE FINALE STRUCTURÉE
    // ---------------------------------------------
    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },

      points: { totalPoints },

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
      
      // 👇 AJOUTÉ : Stats de streak
      streak: streakStats,

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
      
      // 👇 MODIFIÉ : Nouveau nom et structure enrichie
      social: followStats,
    };
  }
}