import { Controller, Get, Param } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  // GET /stats/:userId → retourne toutes les statistiques de l'utilisateur
  @Get(':userId')
  async getUserStats(@Param('userId') userId: string) {
    return this.statsService.getUserStats(userId);
  }
}