import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChapterDto } from './dto/CreateChapterDto';
import { UpdateChapterDto } from './dto/update-chapter-dto';
@Injectable()
export class ChapterService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateChapterDto) {
    // Vérifie si le module existe avant de créer le chapitre
    const module = await this.prisma.module.findUnique({ where: { id: data.moduleId } });
    if (!module) throw new NotFoundException('Module not found');

    return this.prisma.chapter.create({ data });
  }
  async findByModule(moduleId: string) {
  const module = await this.prisma.module.findUnique({
    where: { id: moduleId },
  });

  if (!module) {
    throw new NotFoundException('Module not found');
  }

  return this.prisma.chapter.findMany({
    where: { moduleId },
    orderBy: { order: 'asc' },
    include: {
      lessons: true,
    },
  });
}

  async findAll() {
    return this.prisma.chapter.findMany({
      orderBy: { order: 'asc' },
      include: { lessons: true, module: true },
    });
  }

  async findOne(id: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id },
      include: { lessons: true, module: true },
    });
    if (!chapter) throw new NotFoundException('Chapter not found');
    return chapter;
  }

  async update(id: string, data: UpdateChapterDto) {
    const chapter = await this.prisma.chapter.findUnique({ where: { id } });
    if (!chapter) throw new NotFoundException('Chapter not found');

    return this.prisma.chapter.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const chapter = await this.prisma.chapter.findUnique({ where: { id } });
    if (!chapter) throw new NotFoundException('Chapter not found');

    return this.prisma.chapter.delete({ where: { id } });
  }
}
