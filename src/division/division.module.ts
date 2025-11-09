import { Module } from '@nestjs/common';
import { DivisionService } from './division.service';
import { DivisionController } from './division.controller';
import { JwtModule } from 'src/jwt/jwt.module';

@Module({
  providers: [DivisionService],
  controllers: [DivisionController],
  imports:[JwtModule],
})
export class DivisionModule {}
