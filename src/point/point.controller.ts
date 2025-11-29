// point/point.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PointService } from './point.service';
import { AddPointDto } from './dto/point.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('point')
export class PointController {
  constructor(private readonly pointService: PointService) {}

  // Ajouter des points à un utilisateur
  @Post('add')
  async addPoints(@Body() data: AddPointDto) {
    return this.pointService.addPoints(data.userId, data.points);
  }

  // Récupérer les points d'un utilisateur
  @Get('user/:userId')
  async getUserPoints(@Param('userId') userId: string) {
    return this.pointService.getUserPoints(userId);
  }

  // Récupérer tous les points pour un classement
  @Get('all')
  async getAllPoints() {
    return this.pointService.getAllPoints();
  }
}
