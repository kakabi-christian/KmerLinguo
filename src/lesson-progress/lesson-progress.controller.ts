import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LessonProgressService } from './lesson-progress.service';

@Controller('lesson-progress')
export class LessonProgressController {
  constructor(private readonly lessonProgressService: LessonProgressService) {}

  // ✅ Endpoint pour marquer une leçon comme complétée
  @Post('complete/:userId/:lessonId')
  async completeLesson(
    @Param('userId') userId: string,
    @Param('lessonId') lessonId: string,
    @Body() data: { languageId: string }
  ) {
    return this.lessonProgressService.completeLesson(userId, lessonId, data.languageId);
  }

  // ✅ Endpoint pour récupérer la progression d'une leçon
  @Get(':userId/:lessonId')
  async getLessonProgress(
    @Param('userId') userId: string,
    @Param('lessonId') lessonId: string
  ) {
    return this.lessonProgressService.getLessonProgress(userId, lessonId);
  }
}
