import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Division } from '@prisma/client';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';

@Injectable()
export class DivisionService {
  constructor(private prisma: PrismaService) {}

  // 🟢 Create a new division
  async create(data: CreateDivisionDto): Promise<Division> {
    return this.prisma.division.create({ data });
  }

  // 🟡 Get all divisions
  async findAll(): Promise<Division[]> {
    return this.prisma.division.findMany({
      orderBy: { order: 'asc' },
    });
  }

  // 🔵 Get a single division by ID
  async findOne(id: string): Promise<Division> {
    const division = await this.prisma.division.findUnique({ where: { id } });
    if (!division) {
      throw new NotFoundException(`Division with ID ${id} not found`);
    }
    return division;
  }

  // 🟠 Update a division
  async update(id: string, data: UpdateDivisionDto): Promise<Division> {
    await this.findOne(id); // check existence first
    return this.prisma.division.update({
      where: { id },
      data,
    });
  }

  // 🔴 Delete a division
  async remove(id: string): Promise<void> {
    await this.findOne(id); // check existence first
    await this.prisma.division.delete({ where: { id } });
  }
}
