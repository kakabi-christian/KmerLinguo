import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import type { Express } from 'express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('question')
@UseGuards(RolesGuard)
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  // ---------------- CREATE QUESTION ----------------
  @Post('create')
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  async createQuestion(
    @Body() body: CreateQuestionDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    // Ajouter le chemin du fichier si uploadé
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

  // ---------------- GET QUESTIONS BY LESSON AND USER LANGUAGE ----------------
  @Get('lesson/:lessonId')
  @Roles('USER')
  async getQuestionsByLesson(
    @Param('lessonId') lessonId: string,
    @Req() req: any
  ) {
    // 🔥 Récupérer la langue de l’utilisateur depuis le token JWT
    let userLanguage = req.user?.language?.id;

    // 🔹 Si aucune langue dans le token, fallback sur le header Accept-Language
    if (!userLanguage) {
      const langHeader = req.headers['accept-language'];
      if (langHeader) {
        const language = await this.questionService.findLanguageByCode(langHeader);
        userLanguage = language?.id;
      }
    }

    if (!userLanguage) {
      throw new BadRequestException('La langue de l’utilisateur est introuvable');
    }

    return this.questionService.getQuestionsByLessonAndLanguage(
      lessonId,
      userLanguage
    );
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
