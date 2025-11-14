import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto } from './Dto/create-lesson-dto';
import { UpdateLessonDto } from './Dto/update-lesson-dto';

@Injectable()
export class LessonService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateLessonDto) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: data.chapterId },
    });
    if (!chapter) throw new NotFoundException('Chapter not found');

    return this.prisma.lesson.create({ data });
  }

  async findAll() {
    return this.prisma.lesson.findMany({
      orderBy: { order: 'asc' },
      include: { chapter: true },
    });
  }

  async findByChapter(chapterId: string) {
  const chapter = await this.prisma.chapter.findUnique({
    where: { id: chapterId },
  });

  if (!chapter) throw new NotFoundException('Chapter not found');

  return this.prisma.lesson.findMany({
    where: { chapterId },
    orderBy: { order: 'asc' },
  });
}

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: { chapter: true },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  async update(id: string, data: UpdateLessonDto) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) throw new NotFoundException('Lesson not found');

    return this.prisma.lesson.update({ where: { id }, data });
  }

  async remove(id: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) throw new NotFoundException('Lesson not found');

    return this.prisma.lesson.delete({ where: { id } });
  }
}
