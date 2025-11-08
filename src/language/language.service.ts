import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Language } from '@prisma/client';
import { CreateLanguageDto} from './dto/Create-language.dto';
import { UpdateLanguageDto } from './dto/Update-language.dto';

@Injectable()
export class LanguageService {
  constructor(private prisma: PrismaService) {}

  // 🟢 Create a new language
  async create(data: CreateLanguageDto): Promise<Language> {
    return this.prisma.language.create({ data });
  }

  // 🟡 Get all languages
  async findAll(): Promise<Language[]> {
    return this.prisma.language.findMany();
  }

  // 🔵 Get a single language by ID
  async findOne(id: string): Promise<Language> {
    const language = await this.prisma.language.findUnique({ where: { id } });
    if (!language) {
      throw new NotFoundException(`Language with ID ${id} not found`);
    }
    return language;
  }

  // 🟠 Update a language
  async update(id: string, data: UpdateLanguageDto): Promise<Language> {
    await this.findOne(id); // check existence first
    return this.prisma.language.update({
      where: { id },
      data,
    });
  }

  // 🔴 Delete a language
  async remove(id: string): Promise<void> {
    await this.findOne(id); // check existence first
    await this.prisma.language.delete({ where: { id } });
  }
}
