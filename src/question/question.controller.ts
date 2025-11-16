import { Controller, Get, Post, Put, Delete, Param, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QuestionService } from './question.service';
import type { Express } from 'express';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  // ---------------- CREATE (texte seulement) ----------------
  @Post('create')
  async createQuestion(
    @Body() body: {
      lessonId: string;
      languageId: string;
      text: string;
      audioPath?: string;
      imagePath?: string;
      order: number;
      answers: { text: string; isCorrect: boolean }[];
    },
  ) {
    return this.questionService.createQuestion(body);
  }
  @Get('lesson/:lessonId')
  @Roles('ADMIN', 'USER')
  findByLesson(@Param('lessonId') lessonId: string) {
    return this.questionService.findByLesson(lessonId);
  }

  // ---------------- CREATE AVEC AUDIO ----------------
  @Post('create-audio')
  @UseInterceptors(FileInterceptor('audio'))
  async createQuestionAudio(
    @UploadedFile() file: Express.Multer.File,
    @Body('lessonId') lessonId: string,
    @Body('languageId') languageId: string,
    @Body('text') text: string,
    @Body('order') order: number,
    @Body('answers') answers: string, // JSON string
  ) {
    const parsedAnswers = JSON.parse(answers); // convertir en objet
    const audioPath = file.path; // Multer stocke le fichier temporairement

    return this.questionService.createQuestion({
      lessonId,
      languageId,
      text,
      audioPath,
      imagePath:"",
      order: Number(order),
      answers: parsedAnswers,
    });
  }

  // ---------------- READ ----------------
  @Get()
  async getAllQuestions() {
    return this.questionService.getAllQuestions();
  }

  @Get(':id')
  async getQuestionById(@Param('id') id: string) {
    return this.questionService.getQuestionById(id);
  }

  // ---------------- UPDATE ----------------
  @Put(':id')
  async updateQuestion(
    @Param('id') id: string,
    @Body() body: {
      text?: string;
      audioPath?: string;
      imagePath?: string;
      order?: number;
      answers?: { text: string; isCorrect: boolean }[];
    },
  ) {
    return this.questionService.updateQuestion(id, body);
  }

  // ---------------- DELETE ----------------
  @Delete(':id')
  async deleteQuestion(@Param('id') id: string) {
    return this.questionService.deleteQuestion(id);
  }
}
