import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  // Récupérer toutes les notifications d'un utilisateur
  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { sentAt: 'desc' }, // les plus récentes d'abord
    });
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId: string) {
    const notification = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }

  // Optionnel : récupérer uniquement les notifications non lues
  async getUnreadNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { sentAt: 'desc' },
    });
  }
}
