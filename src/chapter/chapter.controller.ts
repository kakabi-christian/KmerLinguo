import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { CreateChapterDto } from './dto/CreateChapterDto';
import { UpdateChapterDto } from './dto/update-chapter-dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
@Controller('chapters')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @Post('create')
  @Roles('ADMIN')
  create(@Body() data: CreateChapterDto) {
    return this.chapterService.create(data);
  }

  @Get('search')
  @Roles('ADMIN')
  findAll() {
    return this.chapterService.findAll();
  }

  @Get('search/:id')
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.chapterService.findOne(id);
  }

  @Put('update/:id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() data: UpdateChapterDto) {
    return this.chapterService.update(id, data);
  }

  @Delete('delete/:id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.chapterService.remove(id);
  }
}
