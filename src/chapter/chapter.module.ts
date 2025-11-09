import { Module } from '@nestjs/common';
import { ChapterController } from './chapter.controller';
import { ChapterService } from './chapter.service';
import { JwtModule } from 'src/jwt/jwt.module';

@Module({
  controllers: [ChapterController],
  providers: [ChapterService],
  imports:[JwtModule]
})
export class ChapterModule {}
