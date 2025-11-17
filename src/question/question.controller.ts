import { Controller, Get, Post, Param, Body, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QuestionService } from './question.service';
import { CreateQuestionDto, QuestionType } from './dto/create-question.dto';
import type { Express } from 'express';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  // ---------------- CREATE QUESTION ----------------
  @Post('create')
  // @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  async createQuestion(
    @Body() body: CreateQuestionDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    // Si un fichier est uploadé, on ajoute le chemin dans body
    if (file) {
      if (file.mimetype.startsWith('audio/')) {
        body.audioPath = file.path;
      } else if (file.mimetype.startsWith('image/')) {
        body.imagePath = file.path;
      } else {
        throw new BadRequestException('Fichier non supporté');
      }
    }

    return this.questionService.createQuestion(body);
  }

  // ---------------- GET QUESTIONS BY LESSON ----------------
  @Get('lesson/:lessonId')
  @Roles('USER')
  async getQuestionsByLesson(@Param('lessonId') lessonId: string) {
    return this.questionService.getQuestionsByLesson(lessonId);
  }

  // ---------------- GET QUESTION BY ID ----------------
  @Get(':id')
  async getQuestionById(@Param('id') id: string) {
    return this.questionService.getQuestionById(id);
  }

  // ---------------- CHECK USER ANSWER ----------------
  @Post(':id/check')
  async checkAnswer(
    @Param('id') questionId: string,
    @Body('answer') userAnswer: string
  ) {
    if (!userAnswer) {
      throw new BadRequestException('La réponse de l’utilisateur est requise');
    }

    return this.questionService.checkAnswer(questionId, userAnswer);
  }
}
