// point/point.module.ts
import { Module } from '@nestjs/common';
import { PointService } from './point.service';
import { PointController } from './point.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PointController],
  providers: [PointService, PrismaService],
  exports: [PointService],
})
export class PointModule {}
