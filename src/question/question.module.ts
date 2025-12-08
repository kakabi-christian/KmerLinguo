import { Module } from '@nestjs/common';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { PointModule } from 'src/point/point.module';
import { ProgressionQuestionModule } from 'src/progression-question/progression-question.module';
import { LessonProgressModule } from 'src/lesson-progress/lesson-progress.module';

@Module({
  controllers: [QuestionController],
  providers: [QuestionService],
  imports:[PointModule, ProgressionQuestionModule, LessonProgressModule],
})
export class QuestionModule {}
