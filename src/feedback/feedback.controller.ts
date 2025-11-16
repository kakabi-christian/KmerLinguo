import { Controller, Post, Body } from '@nestjs/common';
import { FeedbackService } from './feedback.service';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  /**
   * POST /feedback
   * Crée ou met à jour le feedback d'un utilisateur
   * Le frontend envoie : { userId, rating, comment }
   */
  @Post()
  async upsertFeedback(
    @Body('userId') userId: string,
    @Body('rating') rating: number,
    @Body('comment') comment?: string,
  ) {
    return this.feedbackService.upsertFeedback(userId, rating, comment);
  }
}
