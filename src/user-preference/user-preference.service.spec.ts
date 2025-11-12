import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserPreferenceDto } from './Dto/create-user-preference.dto';
import { UpdateUserPreferenceDto } from './Dto/update-user-preference.dto';

@Injectable()
export class UserPreferenceService {
  constructor(private prisma: PrismaService) {}

  // Étape 1 : création initiale avec la langue
  async createStep1(data: CreateUserPreferenceDto) {
    return this.prisma.userPreference.create({ data });
  }

  // Étapes 2 et 3 : update objectif et source
  async updateStep(userId: string, data: UpdateUserPreferenceDto) {
    const pref = await this.prisma.userPreference.findFirst({ where: { userId } });
    if (!pref) throw new NotFoundException('UserPreference not found');

    return this.prisma.userPreference.update({
      where: { id: pref.id },
      data,
    });
  }

  // Récupérer la préférence d’un utilisateur
  async getByUserId(userId: string) {
    return this.prisma.userPreference.findFirst({ where: { userId } });
  }
}
