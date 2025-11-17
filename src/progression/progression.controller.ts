import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ProgressionService } from './progression.service';
import { CreateProgressionDto } from './dto/create-progression.dto';

@Controller('progression')
export class ProgressionController {
  constructor(private readonly progressionService: ProgressionService) {}

  @Post('create')
  async createProgression(@Body() body: CreateProgressionDto) {
    return this.progressionService.createProgression(body);
  }

  @Get('lesson/:userId/:lessonId')
  async getProgressionByLesson(
    @Param('userId') userId: string,
    @Param('lessonId') lessonId: string
  ) {
    return this.progressionService.getProgressionByLesson(userId, lessonId);
  }
}
