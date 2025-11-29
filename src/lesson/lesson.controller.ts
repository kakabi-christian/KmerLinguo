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
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './Dto/create-lesson-dto';
import { UpdateLessonDto } from './Dto/update-lesson-dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';

@Controller('lessons')
@UseGuards(AuthGuard('jwt'), RolesGuard)
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

  // 🔹 Endpoint pour récupérer les leçons d’un chapitre pour un utilisateur
  @Get('chapter/:chapterId')
  @Roles('ADMIN', 'USER')
  async findByChapter(
    @Param('chapterId') chapterId: string,
    @Req() req: any,
  ) {
    // 🔹 Récupérer l'ID de la langue depuis le token
    const userLanguageId = req.user.language?.id;
    if (!userLanguageId) {
      throw new BadRequestException('User language not found');
    }

    const lessons = await this.lessonService.findByChapter(
      chapterId,
      userLanguageId,
    );

    // 🔹 Retourner un tableau vide si aucune question n’est trouvée
    if (!lessons || lessons.length === 0) {
      return [];
    }

    return lessons;
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
