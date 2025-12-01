import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProgressionQuestionService } from './progression-question.service';

@Controller('progression-question')
export class ProgressionQuestionController {
  constructor(private readonly progressionService: ProgressionQuestionService) {}

  // ✅ Endpoint pour marquer une question comme complétée
  @Post('complete/:userId/:questionId')
  async completeQuestion(
    @Param('userId') userId: string,
    @Param('questionId') questionId: string,
    @Body() data: { lessonId: string; languageId: string; isCorrect: boolean }
  ) {
    return this.progressionService.completeQuestion(userId, questionId, data);
  }

  // ✅ Endpoint pour récupérer la progression d'une leçon pour un utilisateur
  @Get('lesson/:userId/:lessonId')
  async getProgressForLesson(
    @Param('userId') userId: string,
    @Param('lessonId') lessonId: string
  ) {
    return this.progressionService.getProgressForLesson(userId, lessonId);
  }
}
