import { Module } from '@nestjs/common';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { PointModule } from 'src/point/point.module';

@Module({
  controllers: [QuestionController],
  providers: [QuestionService],
  imports:[PointModule],
})
export class QuestionModule {}
