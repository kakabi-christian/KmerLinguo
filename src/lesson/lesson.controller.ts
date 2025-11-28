import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto  } from './Dto/create-lesson-dto';
import { UpdateLessonDto } from './Dto/update-lesson-dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('lessons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post('create')
  @Roles('ADMIN')
  create(@Body() data: CreateLessonDto) {
    return this.lessonService.create(data);
  }

  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.lessonService.findAll();
  }

  @Get('chapter/:chapterId')
  @Roles('ADMIN', 'USER')
  findByChapter(
    @Param('chapterId') chapterId: string,
    @Req() req: any
  ) {
    // 🔥 Récupération de la langue dans le token JWT
    const userLanguage = req.user.language || 'fr';

    return this.lessonService.findByChapter(chapterId, userLanguage);
  }

  @Get(':id')
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.lessonService.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() data: UpdateLessonDto) {
    return this.lessonService.update(id, data);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.lessonService.remove(id);
  }
}
