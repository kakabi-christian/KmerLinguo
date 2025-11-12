import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { LanguageService } from './language.service';
import { CreateLanguageDto } from './dto/Create-language.dto';
import { UpdateLanguageDto } from './dto/Update-language.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '@prisma/client/runtime/binary';

@Controller('languages')
@UseGuards(RolesGuard)
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  // POST /languages/create - ADMIN SEULEMENT
  @Post('create')
  @Roles('ADMIN')
  create(@Body() dto: CreateLanguageDto) {
    return this.languageService.create(dto);
  }

  // GET /languages/search - UTILISATEURS CONNECTÉS (onboarding)
  @Get('search')
  @Roles('USER', 'ADMIN')  // ✅ Nécessite connexion, supprimé @Public()
  findAll() {
    return this.languageService.findAll();
  }

  // GET /languages/search/:id - ADMIN SEULEMENT
  @Get('search/:id')
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.languageService.findOne(id);
  }

  // PATCH /languages/update/:id - ADMIN SEULEMENT
  @Patch('update/:id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateLanguageDto) {
    return this.languageService.update(id, dto);
  }

  // DELETE /languages/delete/:id - ADMIN SEULEMENT
  @Delete('delete/:id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.languageService.remove(id);
  }
}