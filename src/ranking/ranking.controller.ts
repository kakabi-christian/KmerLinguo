import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { Roles } from "src/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { RankingService } from "./ranking.service";

@Controller('rankings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  // 🔹 Classement de la division pour un utilisateur spécifique
  // GET /rankings/division/user/:userId
  @Get('division/user/:userId')
  @Roles('USER', 'ADMIN')
  async getDivisionRankingByUser(@Param('userId') userId: string) {
    return this.rankingService.getDivisionRankingByUser(userId);
  }

  // 🔹 Classement complet d'une division (admin)
  // GET /rankings/division/:divisionId
  @Get('division/:divisionId')
  @Roles('ADMIN')
  async getAllRankingsInDivision(@Param('divisionId') divisionId: string) {
    return this.rankingService.getAllRankingsInDivision(divisionId);
  }

  // 🔹 Récupère le ranking de l'utilisateur courant
  // GET /rankings/user/:userId
  @Get('user/:userId')
  @Roles('USER', 'ADMIN')
  async getUserRanking(@Param('userId') userId: string) {
    return this.rankingService.getUserRankingInDivision(userId);
  }
}
