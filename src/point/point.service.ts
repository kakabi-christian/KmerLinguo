// point/point.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PointService {
  constructor(private prisma: PrismaService) {}

  // Ajouter ou créer les points
  async addPoints(userId: string, pointsToAdd: number) {
    let pointRecord = await this.prisma.point.findUnique({
      where: { userId },
    });

    if (pointRecord) {
      pointRecord = await this.prisma.point.update({
        where: { userId },
        data: {
          value: pointRecord.value + pointsToAdd,
          updatedAt: new Date(),
        },
      });
    } else {
      pointRecord = await this.prisma.point.create({
        data: {
          userId,
          value: pointsToAdd,
        },
      });
    }

    return pointRecord;
  }

  // Récupérer les points d'un utilisateur
  async getUserPoints(userId: string) {
    const pointRecord = await this.prisma.point.findUnique({
      where: { userId },
    });

    if (!pointRecord) {
      throw new NotFoundException('Points for this user not found');
    }

    return pointRecord;
  }

  // Optionnel : récupérer tous les points pour classement
  async getAllPoints() {
    return this.prisma.point.findMany({
      orderBy: { value: 'desc' },
      include: { user: true },
    });
  }
}
