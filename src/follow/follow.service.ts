import { Injectable, NotFoundException, BadRequestException, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()

export class FollowService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // 1️⃣ SUIVRE UN UTILISATEUR
  // ============================================
  async followUser(followerId: string, followingId: string) {
    // Vérifier qu'on ne se suit pas soi-même
    if (followerId === followingId) {
      throw new BadRequestException('Vous ne pouvez pas vous suivre vous-même');
    }

    // Vérifier que l'utilisateur à suivre existe
    const userToFollow = await this.prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!userToFollow) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // Vérifier si le suivi existe déjà
    const existingFollow = await this.prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      // Si le suivi existe mais était inactif, on le réactive
      if (!existingFollow.isActive) {
        return await this.prisma.userFollow.update({
          where: { id: existingFollow.id },
          data: { isActive: true, followedAt: new Date() },
        });
      }
      throw new BadRequestException('Vous suivez déjà cet utilisateur');
    }

    // Créer le suivi
    return await this.prisma.userFollow.create({
      data: {
        followerId,
        followingId,
      },
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
    });
  }

  // ============================================
  // 2️⃣ NE PLUS SUIVRE UN UTILISATEUR (UNFOLLOW)
  // ============================================
  async unfollowUser(followerId: string, followingId: string) {
    const follow = await this.prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!follow) {
      throw new NotFoundException('Vous ne suivez pas cet utilisateur');
    }

    // Option 1 : Supprimer complètement
    // return await this.prisma.userFollow.delete({
    //   where: { id: follow.id },
    // });

    // Option 2 : Marquer comme inactif (recommandé pour garder l'historique)
    return await this.prisma.userFollow.update({
      where: { id: follow.id },
      data: { isActive: false },
    });
  }

  // ============================================
  // 3️⃣ LISTE DE TOUS LES UTILISATEURS
  // ============================================
  async getAllUsers(currentUserId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    // Récupérer tous les utilisateurs sauf l'utilisateur actuel
    const users = await this.prisma.user.findMany({
      where: {
        id: { not: currentUserId },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        currentStreak: true,
        _count: {
          select: {
            followers: { where: { isActive: true } },
            following: { where: { isActive: true } },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Vérifier si l'utilisateur actuel suit déjà ces users
    const followingIds = await this.prisma.userFollow.findMany({
      where: {
        followerId: currentUserId,
        isActive: true,
      },
      select: { followingId: true },
    });

    const followingIdsSet = new Set(followingIds.map((f) => f.followingId));

    // Enrichir les données avec le statut de suivi
    const usersWithFollowStatus = users.map((user) => ({
      ...user,
      isFollowing: followingIdsSet.has(user.id),
      followersCount: user._count.followers,
      followingCount: user._count.following,
    }));

    const total = await this.prisma.user.count({
      where: { id: { not: currentUserId } },
    });

    return {
      users: usersWithFollowStatus,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============================================
  // 4️⃣ RECHERCHER DES UTILISATEURS PAR EMAIL
  // ============================================
  async searchUsers(currentUserId: string, searchQuery: string) {
    if (!searchQuery || searchQuery.trim().length < 2) {
      throw new BadRequestException('La recherche doit contenir au moins 2 caractères');
    }

    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUserId } },
          {
            OR: [
              { email: { contains: searchQuery, mode: 'insensitive' } },
              { firstName: { contains: searchQuery, mode: 'insensitive' } },
              { lastName: { contains: searchQuery, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        currentStreak: true,
        _count: {
          select: {
            followers: { where: { isActive: true } },
            following: { where: { isActive: true } },
          },
        },
      },
      take: 20,
    });

    // Vérifier si l'utilisateur actuel suit déjà ces users
    const followingIds = await this.prisma.userFollow.findMany({
      where: {
        followerId: currentUserId,
        isActive: true,
      },
      select: { followingId: true },
    });

    const followingIdsSet = new Set(followingIds.map((f) => f.followingId));

    return users.map((user) => ({
      ...user,
      isFollowing: followingIdsSet.has(user.id),
      followersCount: user._count.followers,
      followingCount: user._count.following,
    }));
  }

  // ============================================
  // 5️⃣ LISTE DES FOLLOWERS D'UN UTILISATEUR
  // ============================================
  async getFollowers(userId: string) {
    const followers = await this.prisma.userFollow.findMany({
      where: {
        followingId: userId,
        isActive: true,
      },
      include: {
        follower: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            currentStreak: true,
          },
        },
      },
      orderBy: { followedAt: 'desc' },
    });

    return followers.map((f) => ({
      ...f.follower,
      followedAt: f.followedAt,
    }));
  }

  // ============================================
  // 6️⃣ LISTE DES UTILISATEURS SUIVIS
  // ============================================
  async getFollowing(userId: string) {
    const following = await this.prisma.userFollow.findMany({
      where: {
        followerId: userId,
        isActive: true,
      },
      include: {
        following: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            currentStreak: true,
          },
        },
      },
      orderBy: { followedAt: 'desc' },
    });

    return following.map((f) => ({
      ...f.following,
      followedAt: f.followedAt,
    }));
  }
}