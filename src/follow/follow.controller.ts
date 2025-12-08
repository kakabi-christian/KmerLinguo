import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('follow')
@UseGuards( RolesGuard)
@Roles('USER')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  // ============================================
  // 1️⃣ SUIVRE UN UTILISATEUR
  // POST /follow/:userId
  // ============================================
  @Post(':userId')
  async followUser(@Request() req, @Param('userId') userId: string) {
    const currentUserId = req.user?.id || 'temp-user-id'; // À remplacer par req.user.id
    return this.followService.followUser(currentUserId, userId);
  }

  // ============================================
  // 2️⃣ NE PLUS SUIVRE UN UTILISATEUR
  // DELETE /follow/:userId
  // ============================================
  @Delete(':userId')
  async unfollowUser(@Request() req, @Param('userId') userId: string) {
    const currentUserId = req.user?.id || 'temp-user-id';
    return this.followService.unfollowUser(currentUserId, userId);
  }

  // ============================================
  // 3️⃣ LISTE DE TOUS LES UTILISATEURS
  // GET /follow/users/all?page=1&limit=20
  // ============================================
  @Get('users/all')
  async getAllUsers(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const currentUserId = req.user?.id || 'temp-user-id';
    return this.followService.getAllUsers(
      currentUserId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  // ============================================
  // 4️⃣ RECHERCHER DES UTILISATEURS
  // GET /follow/users/search?q=alice@example.com
  // ============================================
  @Get('users/search')
  async searchUsers(@Request() req, @Query('q') query: string) {
    const currentUserId = req.user?.id || 'temp-user-id';
    return this.followService.searchUsers(currentUserId, query);
  }

  // ============================================
  // 5️⃣ MES FOLLOWERS (qui me suit)
  // GET /follow/followers
  // ============================================
  @Get('followers')
  async getMyFollowers(@Request() req) {
    const currentUserId = req.user?.id || 'temp-user-id';
    return this.followService.getFollowers(currentUserId);
  }

  // ============================================
  // 6️⃣ MES ABONNEMENTS (que je suis)
  // GET /follow/following
  // ============================================
  @Get('following')
  async getMyFollowing(@Request() req) {
    const currentUserId = req.user?.id || 'temp-user-id';
    return this.followService.getFollowing(currentUserId);
  }

  // ============================================
  // 7️⃣ FOLLOWERS D'UN UTILISATEUR SPÉCIFIQUE
  // GET /follow/:userId/followers
  // ============================================
  @Get(':userId/followers')
  async getUserFollowers(@Param('userId') userId: string) {
    return this.followService.getFollowers(userId);
  }

  // ============================================
  // 8️⃣ ABONNEMENTS D'UN UTILISATEUR SPÉCIFIQUE
  // GET /follow/:userId/following
  // ============================================
  @Get(':userId/following')
  async getUserFollowing(@Param('userId') userId: string) {
    return this.followService.getFollowing(userId);
  }
}