import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserPreferenceDto } from './Dto/create-user-preference.dto';
import { UpdateUserPreferenceDto } from './Dto/update-user-preference.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserPreferenceService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService, // Injection du service JWT
  ) {}

  // -------------------------------------------------
  // STEP 1 : Création initiale des préférences avec la langue
  // -------------------------------------------------
  async createStep1(data: CreateUserPreferenceDto) {
    return this.prisma.userPreference.create({
      data,
    });
  }

  // -------------------------------------------------
  // STEP 2 & 3 : Mise à jour de l'objectif et de la source
  // + Génération d'un NOUVEAU TOKEN incluant la langue
  // -------------------------------------------------
async updateStep(userId: string, data: UpdateUserPreferenceDto) {
  // 1️⃣ Récupérer les préférences existantes
  const pref = await this.prisma.userPreference.findFirst({
    where: { userId },
    include: { targetLanguage: true },
  });

  if (!pref) throw new NotFoundException('Préférences utilisateur introuvables');

  // 2️⃣ Mettre à jour les préférences
  const updatedPref = await this.prisma.userPreference.update({
    where: { id: pref.id },
    data,
    include: { targetLanguage: true }, // pour inclure la langue dans le token
  });

  // 3️⃣ Récupérer l'utilisateur
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new NotFoundException("Utilisateur introuvable");

  // 4️⃣ Créer le payload du token avec la langue
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    languageId: updatedPref.targetLanguage?.id ?? null,
    languageCode: updatedPref.targetLanguage?.languageCode ?? null,
  };

  // 5️⃣ Générer le nouveau token
  const newToken = await this.jwtService.signAsync(payload);

  // 6️⃣ Retourner le nouveau token + langue
  return {
    message: 'Préférences mises à jour avec succès.',
    access_token: newToken,
    language: updatedPref.targetLanguage
      ? {
          id: updatedPref.targetLanguage.id,
          code: updatedPref.targetLanguage.languageCode,
          name: updatedPref.targetLanguage.name,
        }
      : null,
  };
}


  // -------------------------------------------------
  // Récupérer les préférences d’un utilisateur
  // -------------------------------------------------
  async getByUserId(userId: string) {
    return this.prisma.userPreference.findFirst({
      where: { userId },
      include: { targetLanguage: true },
    });
  }
}
    