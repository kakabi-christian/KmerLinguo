import { Module } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { JwtModule } from 'src/jwt/jwt.module';
@Module({
  providers: [LessonService],
  controllers: [LessonController],
  imports:[JwtModule]
})
export class LessonModule {}
