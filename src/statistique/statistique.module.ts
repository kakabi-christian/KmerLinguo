import { Module } from '@nestjs/common';
import { StatisticsService } from './statistique.service';
import { StatisticsController } from './statistique.controller';
import { JwtModule } from 'src/jwt/jwt.module';
import { CryptoModule } from 'src/crypto/crypto.module';
@Module({
  providers: [StatisticsService],
  controllers: [StatisticsController],
  imports:[JwtModule,CryptoModule]
})
export class StatistiqueModule {}
