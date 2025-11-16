import { Module } from '@nestjs/common';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';
import { JwtModule } from 'src/jwt/jwt.module';

@Module({
  controllers: [RankingController],
  providers: [RankingService],
  imports:[JwtModule],
})
export class RankingModule {}
