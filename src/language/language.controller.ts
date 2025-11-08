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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('languages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LanguageController {
   constructor(private readonly languageService: LanguageService) {}

  // POST /languages/create
  @Post('create')
  @Roles('admin')
  create(@Body() dto: CreateLanguageDto) {
    return this.languageService.create(dto);
  }

  // GET /languages/search
  @Get('search')
  @Roles('admin')
  findAll() {
    return this.languageService.findAll();
  }

  // GET /languages/search/:id
  @Get('search/:id')
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.languageService.findOne(id);
  }

  // PATCH /languages/update/:id
  @Patch('update/:id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateLanguageDto) {
    return this.languageService.update(id, dto);
  }

  // DELETE /languages/delete/:id
  @Delete('delete/:id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.languageService.remove(id);
}
}
