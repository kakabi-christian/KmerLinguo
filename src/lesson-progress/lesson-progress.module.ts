import { Module } from '@nestjs/common';
import { LessonProgressService } from './lesson-progress.service';
import { LessonProgressController } from './lesson-progress.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [LessonProgressService, PrismaService],
  controllers: [LessonProgressController],
  exports: [LessonProgressService],
})
export class LessonProgressModule {}
