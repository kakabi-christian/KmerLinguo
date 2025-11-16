import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  UseGuards 
} from '@nestjs/common';
import { ModuleService } from './module.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateModuleDto } from './dto/create-module.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateModuleDto } from './dto/update-module.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('modules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post('create')
  @Roles('ADMIN')
  create(@Body() data: CreateModuleDto) {
    return this.moduleService.createModule(data);
  }

  // 🔹 READ - Récupérer tous les modules
  @Get()
  @Roles('ADMIN','USER')
  findAll() {
    return this.moduleService.findAll(); // Utilise la nouvelle méthode findAll
  }

  // 🔹 READ - Récupérer un module par ID
  @Get(':id')
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.moduleService.searchModuleById(id);
  }

  // 🔹 UPDATE - Modifier un module
  @Put(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() data: UpdateModuleDto) {
    return this.moduleService.updateModule(id, data);
  }

  // 🔹 DELETE - Supprimer un module
  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.moduleService.deleteModule(id);
  }
}
