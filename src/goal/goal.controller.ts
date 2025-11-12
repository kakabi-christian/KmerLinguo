import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { GoalService } from './goal.service';
import { CreateGoalDto } from './dto/create-dto';
import { UpdateGoalDto } from './dto/update-dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('goals')
@UseGuards(RolesGuard)
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  // ➕ Ajouter un objectif
  @Post('create')
  @Roles('ADMIN')

  create(@Body() data: CreateGoalDto) {
    return this.goalService.create(data);
  }

  // 📜 Lister tous les objectifs
  @Get()
  findAll() {
    return this.goalService.findAll();
  }

  // 🔍 Récupérer un objectif spécifique
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.goalService.findOne(id);
  }

  // ✏️ Mettre à jour un objectif
  @Patch(':id')
  @Roles('ADMIN')

  update(@Param('id') id: string, @Body() data: UpdateGoalDto) {
    return this.goalService.update(id, data);
  }

  // ❌ Supprimer un objectif
  @Delete('delete/:id')
  @Roles('ADMIN')

  remove(@Param('id') id: string) {
    return this.goalService.remove(id);
  }
}
