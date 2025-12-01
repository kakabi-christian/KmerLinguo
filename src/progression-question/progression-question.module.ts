import { Module } from '@nestjs/common';
import { ProgressionQuestionService } from './progression-question.service';
import { ProgressionQuestionController } from './progression-question.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ProgressionQuestionController],
  providers: [ProgressionQuestionService, PrismaService],
  exports: [ProgressionQuestionService] // important si d'autres services doivent l'utiliser
})
export class ProgressionQuestionModule {}
