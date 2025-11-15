import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistique.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';


@Controller('statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  // 👥 UTILISATEURS
  @Get('users')
  async getUserStatistics() {
    return this.statisticsService.getUserStatistics();
  }

  // 🌍 PRÉFÉRENCES
  @Get('preferences')
  async getPreferenceStatistics() {
    return this.statisticsService.getPreferenceStatistics();
  }

  // 📚 MODULES / CHAPITRES / LEÇONS
  @Get('content')
  async getContentStatistics() {
    return this.statisticsService.getContentStatistics();
  }

  // 🧠 QUESTIONS / RÉPONSES
  @Get('questions')
  async getQuestionStatistics() {
    return this.statisticsService.getQuestionStatistics();
  }

  // 📈 SÉRIES / POINTS / CLASSEMENT
  @Get('ranking')
  async getRankingStatistics() {
    return this.statisticsService.getRankingStatistics();
  }

  // 🔔 NOTIFICATIONS
  @Get('notifications')
  async getNotificationStatistics() {
    return this.statisticsService.getNotificationStatistics();
  }

  // 🤝 ABONNEMENTS
  @Get('subscriptions')
  async getSubscriptionStatistics() {
    return this.statisticsService.getSubscriptionStatistics();
  }



  // 💬 FEEDBACKS
  @Get('feedbacks')
  async getFeedbackStatistics() {
    return this.statisticsService.getFeedbackStatistics();
  }
}
