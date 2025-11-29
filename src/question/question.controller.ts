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
import { AuthGuard } from '@nestjs/passport';

@Controller('question')
@UseGuards(RolesGuard, AuthGuard('jwt'))
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  // ---------------- CREATE QUESTION ----------------
  @Post('create')
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  async createQuestion(
    @Body() body: CreateQuestionDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      if (file.mimetype.startsWith('audio/')) {
        body.audioPath = file.path;
      } else if (file.mimetype.startsWith('image/')) {
        body.imagePath = file.path;
      } else {
        throw new BadRequestException('Unsupported file format');
      }
    }

    return this.questionService.createQuestion(body);
  }

  // ---------------- GET QUESTIONS BY LESSON & USER LANGUAGE ----------------
  @Get('lesson/:lessonId')
  @Roles('USER')
  async getQuestionsByLesson(
    @Param('lessonId') lessonId: string,
    @Req() req: any,
  ) {
    console.log('🌐 JWT payload user:', req.user);

    // 🔥 Récupération correcte de la langue depuis le JWT
    let userLanguage = req.user?.languageId;

    // 🔹 fallback header
    if (!userLanguage) {
      const langHeader = req.headers['accept-language'];
      console.log('🌐 Accept-Language header:', langHeader);
      if (langHeader) {
        const language = await this.questionService.findLanguageByCode(langHeader);
        userLanguage = language?.id;
        console.log('🌐 Langue trouvée via header:', language);
      }
    } else {
      console.log('🌐 Langue récupérée depuis JWT:', userLanguage);
    }

    if (!userLanguage) {
      throw new BadRequestException('La langue de l’utilisateur est introuvable');
    }

    const questions = await this.questionService.getQuestionsByLessonAndLanguage(
      lessonId,
      userLanguage,
    );

    console.log(`💎 Questions récupérées pour la langue ${userLanguage}:`, questions.length);
    return questions;
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
  @Body('answer') userAnswer: string,
  @Req() req: any
) {
  if (!userAnswer) {
    throw new BadRequestException("User's answer is required");
  }

  const userId = req.user.id; // 🔹 récupère l'id depuis JWT

  return this.questionService.checkAnswer(questionId, userAnswer, userId);
}

}
