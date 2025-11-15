import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class RankingService {
  constructor(private prisma: PrismaService) {}

  // 🔹 Récupère le ranking de l'utilisateur avec division et points
  async getUserRankingInDivision(userId: string) {
    const ranking = await this.prisma.ranking.findFirst({
      where: { userId },
      include: { point: true, division: true },
      orderBy: { periodStart: 'desc' },
    });

    if (!ranking) {
      throw new NotFoundException(`Ranking for user ${userId} not found`);
    }

    return ranking;
  }

  // 🔹 Classement complet dans une division
  async getAllRankingsInDivision(divisionId: string) {
    return this.prisma.ranking.findMany({
      where: { divisionId },
      include: { user: true, point: true },
      orderBy: [
        { point: { value: 'desc' } },
        { user: { firstName: 'asc' } }, // égalité sur points -> nom
      ],
    });
  }

  // 🔹 Classement de la division pour un utilisateur spécifique
    async getDivisionRankingByUser(userId: string) {
        const userRanking = await this.prisma.ranking.findFirst({
        where: { userId },
        });

        if (!userRanking) {
        throw new NotFoundException(`Ranking for user ${userId} not found`);
        }

        const divisionId = userRanking.divisionId;

        return this.prisma.ranking.findMany({
        where: { divisionId },
        include: { user: true, point: true },
        orderBy: [
            { point: { value: 'desc' } },
            { user: { firstName: 'asc' } },
        ],
        });
    }

  // 🔹 Met à jour les points d'un utilisateur et éventuellement sa division
  async updateUserPoints(userId: string, addedPoints: number) {
    // 1️⃣ Récupère le ranking actuel
    const ranking = await this.prisma.ranking.findFirst({
      where: { userId },
      include: { point: true, division: true },
    });
    if (!ranking) throw new NotFoundException(`Ranking for user ${userId} not found`);

    // 2️⃣ Met à jour les points
    const newPoints = ranking.point.value + addedPoints;
    await this.prisma.point.update({
      where: { id: ranking.pointId },
      data: { value: newPoints },
    });

    // 3️⃣ Vérifie si l'utilisateur doit monter de division
    const nextDivision = await this.prisma.division.findFirst({
      where: { order: ranking.division.order + 1 },
    });

    if (nextDivision && newPoints >= nextDivision.pointThreshold) {
      await this.prisma.ranking.update({
        where: { id: ranking.id },
        data: { divisionId: nextDivision.id },
      });

      // 4️⃣ Recalcule le classement de la division précédente et nouvelle division
      await this.recalculateDivisionRanking(ranking.divisionId);
      await this.recalculateDivisionRanking(nextDivision.id);
    } else {
      // Recalcule uniquement la division actuelle
      await this.recalculateDivisionRanking(ranking.divisionId);
    }
  }

  // 🔹 Recalcule le rang de tous les utilisateurs dans une division
  private async recalculateDivisionRanking(divisionId: string) {
    const rankings = await this.prisma.ranking.findMany({
      where: { divisionId },
      include: { point: true },
      orderBy: [
        { point: { value: 'desc' } },
        { user: { firstName: 'asc' } },
      ],
    });

    for (let i = 0; i < rankings.length; i++) {
      await this.prisma.ranking.update({
        where: { id: rankings[i].id },
        data: { rank: i + 1 },
      });
    }
  }
}
