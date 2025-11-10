// src/goal/goal.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-dto';
import { UpdateGoalDto } from './dto/update-dto';
@Injectable()
export class GoalService {
  constructor(private readonly prisma: PrismaService) {}

  // ➕ Créer un Goal
  async create(data: CreateGoalDto) {
    return this.prisma.goal.create({ data });
  }

  // 📜 Récupérer tous les Goals
  async findAll() {
    return this.prisma.goal.findMany({
      orderBy: { label: 'asc' },
    });
  }

  // 🔍 Récupérer un Goal par ID
  async findOne(id: string) {
    const goal = await this.prisma.goal.findUnique({ where: { id } });
    if (!goal) throw new NotFoundException('Goal not found');
    return goal;
  }

  // ✏️ Mettre à jour un Goal
  async update(id: string, data: UpdateGoalDto) {
    const goal = await this.prisma.goal.findUnique({ where: { id } });
    if (!goal) throw new NotFoundException('Goal not found');

    return this.prisma.goal.update({
      where: { id },
      data,
    });
  }

  // ❌ Supprimer un Goal
  async remove(id: string) {
    const goal = await this.prisma.goal.findUnique({ where: { id } });
    if (!goal) throw new NotFoundException('Goal not found');

    await this.prisma.goal.delete({ where: { id } });
    return { message: 'Goal deleted successfully' };
  }
}
