import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

@Injectable()
export class ModuleService {
  constructor(private prisma: PrismaService) {}

  // 🔹 CREATE - Ajouter un module
  async createModule(data: CreateModuleDto) {
    return this.prisma.module.create({ data });
  }

  // 🔹 READ - Rechercher tous les modules
  async searchModules() {
    return this.prisma.module.findMany({
      orderBy: { order: 'asc' },
      include: { chapters: true }, // Inclut les chapitres liés
    });
  }

  // 🔹 READ - Rechercher un module par ID
  async searchModuleById(id: string) {
    const module = await this.prisma.module.findUnique({
      where: { id },
      include: { chapters: true },
    });
    if (!module) throw new NotFoundException('Module not found');
    return module;
  }

  // 🔹 UPDATE - Modifier un module
  async updateModule(id: string, data: UpdateModuleDto) {
    const existing = await this.prisma.module.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Module not found');
    return this.prisma.module.update({ where: { id }, data });
  }

  // 🔹 DELETE - Supprimer un module
  async deleteModule(id: string) {
    const existing = await this.prisma.module.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Module not found');
    await this.prisma.module.delete({ where: { id } });
    return { message: 'Module deleted successfully' };
  }
}
