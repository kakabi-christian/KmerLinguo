import { Controller, Get, Param, Patch } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // GET /notifications/:userId → récupérer toutes les notifications d'un utilisateur
  @Get(':userId')
  async getUserNotifications(@Param('userId') userId: string) {
    return this.notificationService.getUserNotifications(userId);
  }

  // PATCH /notifications/read/:notificationId → marquer une notification comme lue
  @Patch('read/:notificationId')
  async markAsRead(@Param('notificationId') notificationId: string) {
    return this.notificationService.markAsRead(notificationId);
  }

  // GET /notifications/unread/:userId → récupérer seulement les notifications non lues
  @Get('unread/:userId')
  async getUnreadNotifications(@Param('userId') userId: string) {
    return this.notificationService.getUnreadNotifications(userId);
  }
}
