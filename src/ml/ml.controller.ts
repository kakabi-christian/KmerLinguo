import { Controller, Post, UploadedFile, UseInterceptors, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MlService } from './ml.service';
import type { Express } from 'express';

@Controller('ml')
export class MlController {
  constructor(private readonly mlService: MlService) {}

  @Post('submit') // nouvelle route unique pour audio ou texte
  @UseInterceptors(FileInterceptor('audio'))
  async submitAnswer(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string,
    @Body('questionId') questionId: string,
    @Body('lessonId') lessonId: string,
    @Body('languageId') languageId: string,
    @Body('userText') userText?: string, // pour les réponses texte
  ) {
    const result = await this.mlService.analyserEtEnregistrer(
      userId,
      questionId,
      lessonId,
      languageId,
      {
        audioFilePath: file?.path, // si audio présent
        userText,                  // si texte présent
      },
    );

    return result;
  }
}
