import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../crypto/crypto.service';

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(
    private prisma: PrismaService,
    private cryptoService: CryptoService, // 🔐 pour déchiffrer les soldes
  ) {}

  // 👥 UTILISATEURS
async getUserStatistics(filters?: { year?: number; month?: number; week?: number }) {
    const where: any = {};
    if (filters?.year) {
      where.createdAt = {
        gte: new Date(filters.year, 0, 1),
        lte: new Date(filters.year, 11, 31, 23, 59, 59),
      };
    }
    if (filters?.month && filters.year) {
      where.createdAt = {
        gte: new Date(filters.year, filters.month - 1, 1),
        lte: new Date(filters.year, filters.month, 0, 23, 59, 59),
      };
    }
    if (filters?.week) {
      const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1);
      const weekStart = new Date(firstDayOfYear.setDate((filters.week - 1) * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      where.createdAt = { gte: weekStart, lte: weekEnd };
    }

    const totalUsers = Number(await this.prisma.user.count({ where }));
    const verifiedUsers = Number(await this.prisma.user.count({ where: { ...where, isVerified: true } }));
    const unverifiedUsers = totalUsers - verifiedUsers;

    const byRoleRaw = await this.prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
      where,
    });
    const byRole = byRoleRaw.map(r => ({ role: r.role, count: Number(r._count.role) }));

    const usersByMonth = await this.prisma.$queryRaw<
      { month: string; count: string }[]
    >`SELECT TO_CHAR("createdAt", 'YYYY-MM') as month, COUNT(*) as count 
       FROM "User"
       WHERE "createdAt" BETWEEN ${where.createdAt?.gte ?? new Date('1970-01-01')} AND ${where.createdAt?.lte ?? new Date()}
       GROUP BY month ORDER BY month`;

    const usersByMonthSafe = usersByMonth.map(u => ({ month: u.month, count: Number(u.count) }));

    const inactiveUsers = Number(
      await this.prisma.user.count({
        where: { lastLogin: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),
    );

    return {
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      inactiveUsers,
      usersByMonth: usersByMonthSafe,
      byRole,
    };
  }


  // 🌍 PREFERENCES
  async getPreferenceStatistics() {
    const totalPreferences = await this.prisma.userPreference.count();

    const mostPopularLanguages = await this.prisma.userPreference.groupBy({
      by: ['targetLanguageId'],
      _count: { targetLanguageId: true },
      orderBy: { _count: { targetLanguageId: 'desc' } },
      take: 5,
    });

    const avgMinutes = await this.prisma.userPreference.aggregate({
      _avg: { minutesPerDay: true },
    });

    const avgGoals = await this.prisma.userPreference.groupBy({
      by: ['userId'],
      _count: { id: true },
    });

    const avgGoalPerUser =
      avgGoals.reduce((acc, g) => acc + g._count.id, 0) / avgGoals.length || 0;

    return {
      totalPreferences,
      mostPopularLanguages,
      avgMinutesPerDay: avgMinutes._avg.minutesPerDay || 0,
      avgGoalPerUser,
    };
  }

  // 📚 MODULES / CHAPITRES / LEÇONS
  async getContentStatistics() {
    const moduleCount = await this.prisma.module.count();
    const chapterCount = await this.prisma.chapter.count();
    const lessonCount = await this.prisma.lesson.count();

    const avgChaptersPerModule =
      (await this.prisma.chapter.groupBy({
        by: ['moduleId'],
        _count: { id: true },
      })).reduce((acc, c) => acc + c._count.id, 0) / moduleCount || 0;

    const avgLessonsPerChapter =
      (await this.prisma.lesson.groupBy({
        by: ['chapterId'],
        _count: { id: true },
      })).reduce((acc, c) => acc + c._count.id, 0) / chapterCount || 0;

    const moduleWithMostLessons = await this.prisma.module.findMany({
      include: { chapters: { include: { lessons: true } } },
    });

    const moduleStats = moduleWithMostLessons.map((m) => ({
      moduleId: m.id,
      totalLessons: m.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0),
    }));

    const mostLessonsModule = moduleStats.sort(
      (a, b) => b.totalLessons - a.totalLessons,
    )[0];

    return {
      moduleCount,
      chapterCount,
      lessonCount,
      avgChaptersPerModule,
      avgLessonsPerChapter,
      mostLessonsModule,
    };
  }

  // 🧠 QUESTIONS / RÉPONSES
  async getQuestionStatistics() {
    const totalQuestions = await this.prisma.question.count();
    const totalAnswers = await this.prisma.answer.count();

    const totalProgressions = await this.prisma.progression.count();
    const correctAnswers = await this.prisma.progression.count({
      where: { isCorrect: true },
    });

    const globalSuccessRate =
      totalProgressions > 0 ? (correctAnswers / totalProgressions) * 100 : 0;

    const mostMissedQuestions = await this.prisma.progression.groupBy({
      by: ['questionId'],
      _count: { questionId: true },
      where: { isCorrect: false },
      orderBy: { _count: { questionId: 'desc' } },
      take: 5,
    });

    return {
      totalQuestions,
      totalAnswers,
      globalSuccessRate: `${globalSuccessRate.toFixed(2)}%`,
      mostMissedQuestions,
    };
  }

  // 📈 SERIES / POINTS / CLASSEMENT
  async getRankingStatistics() {
    const totalSeries = await this.prisma.series.count();

    const avgLessonsPerSeries = await this.prisma.series.aggregate({
      _avg: { lessonsCompleted: true },
    });

    const avgLearningTime = await this.prisma.series.aggregate({
      _avg: { learningTime: true },
    });

    const divisions = await this.prisma.division.count();
    const rankings = await this.prisma.ranking.count();

    const avgPointsPerDivision = await this.prisma.ranking.groupBy({
      by: ['divisionId'],
      _avg: { rank: true },
    });

    return {
      totalSeries,
      divisions,
      rankings,
      avgLessonsPerSeries: avgLessonsPerSeries._avg.lessonsCompleted,
      avgLearningTime: avgLearningTime._avg.learningTime,
      avgPointsPerDivision,
    };
  }

  // 🔔 NOTIFICATIONS
  async getNotificationStatistics() {
    const totalNotifications = await this.prisma.notification.count();
    const read = await this.prisma.notification.count({ where: { isRead: true } });
    const unread = totalNotifications - read;

    const broadcast = await this.prisma.notification.count({
      where: { isBroadcast: true },
    });
    const individual = totalNotifications - broadcast;

    const avgPerUser =
      (await this.prisma.notification.groupBy({
        by: ['userId'],
        _count: { id: true },
      })).reduce((acc, u) => acc + u._count.id, 0) /
        (await this.prisma.user.count()) || 0;

    return {
      totalNotifications,
      read,
      unread,
      broadcast,
      individual,
      avgPerUser,
    };
  }

  // 🤝 ABONNEMENTS
  async getSubscriptionStatistics() {
    const totalSubscriptions = await this.prisma.subscription.count();
    const active = await this.prisma.subscription.count({ where: { isActive: true } });
    const inactive = totalSubscriptions - active;

    const mostFollowed = await this.prisma.subscription.groupBy({
      by: ['followedUserId'],
      _count: { followedUserId: true },
      orderBy: { _count: { followedUserId: 'desc' } },
      take: 5,
    });

    const mutualFollowers = await this.prisma.$queryRaw<
      { pair: string }[]
    >`SELECT CONCAT(LEAST(a."userId", a."followedUserId"), '-', GREATEST(a."userId", a."followedUserId")) AS pair 
        FROM "Subscription" a
        JOIN "Subscription" b 
        ON a."userId" = b."followedUserId" AND a."followedUserId" = b."userId"
        GROUP BY pair`;

    return {
      totalSubscriptions,
      active,
      inactive,
      mostFollowed,
      mutualFollowersCount: mutualFollowers.length,
    };
  }

  // 💰 PORTEFEUILLES / TRANSACTIONS / RECOMPENSES
  async getWalletStatistics() {
    const totalWallets = await this.prisma.wallet.count();

    // 🔐 Récupération et déchiffrement des soldes
    const wallets = await this.prisma.wallet.findMany({
      select: { id: true, balance: true, userId: true },
    });

    const decryptedNumbers = await Promise.all(
      wallets.map(async (w) => {
        try {
          if (!w.balance) return 0;
          const decrypted = this.cryptoService.decrypt(w.balance);
          const normalized = decrypted.replace(',', '.').trim();
          const num = Number(normalized);
          if (Number.isFinite(num)) return num;
          this.logger.warn(`Portefeuille ${w.id} : valeur invalide "${decrypted}"`);
          return 0;
        } catch (err) {
          this.logger.error(`Erreur déchiffrement ${w.id}`, err as any);
          return 0;
        }
      }),
    );

    const totalBalance = decryptedNumbers.reduce((a, b) => a + b, 0);
    const avgBalance = totalWallets > 0 ? totalBalance / totalWallets : 0;

    const totalTransactions = await this.prisma.transaction.count();
    const totalAmountAgg = await this.prisma.transaction.aggregate({ _sum: { amount: true } });
    const totalAmount = totalAmountAgg._sum.amount ?? 0;

    const statusBreakdown = await this.prisma.transaction.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const totalRewards = await this.prisma.reward.count();
    const avgRewardPointsAgg = await this.prisma.reward.aggregate({ _avg: { points: true } });
    const avgRewardPoints = avgRewardPointsAgg._avg.points ?? 0;

    const topRewardUsers = await this.prisma.reward.groupBy({
      by: ['userId'],
      _sum: { points: true },
      orderBy: { _sum: { points: 'desc' } },
      take: 5,
    });

    return {
      totalWallets,
      totalBalance,
      avgBalance,
      totalTransactions,
      totalAmount,
      statusBreakdown,
      totalRewards,
      avgRewardPoints,
      topRewardUsers,
    };
  }

  // 💬 FEEDBACKS
  async getFeedbackStatistics() {
    const totalFeedbacks = await this.prisma.feedback.count();
    const avgRating = await this.prisma.feedback.aggregate({ _avg: { rating: true } });

    const ratingDistribution = await this.prisma.feedback.groupBy({
      by: ['rating'],
      _count: { rating: true },
    });

    const recentFeedbacks = await this.prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { user: true },
    });

    return {
      totalFeedbacks,
      avgRating: avgRating._avg.rating,
      ratingDistribution,
      recentFeedbacks,
    };
  }
}
