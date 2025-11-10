import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateReferralSourceDto } from './Dto/update-referal-source.dto';
import { CreateReferralSourceDto } from './Dto/create-referal-source.dto';
@Injectable()
export class ReferralSourceService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateReferralSourceDto) {
    return this.prisma.referralSource.create({ data: dto });
  }

  async findAll() {
    return this.prisma.referralSource.findMany();
  }

  async findOne(id: string) {
    const referral = await this.prisma.referralSource.findUnique({ where: { id } });
    if (!referral) throw new NotFoundException('Source de référence non trouvée');
    return referral;
  }

  async update(id: string, dto: UpdateReferralSourceDto) {
    const exists = await this.prisma.referralSource.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Source de référence non trouvée');
    return this.prisma.referralSource.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const exists = await this.prisma.referralSource.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Source de référence non trouvée');
    return this.prisma.referralSource.delete({ where: { id } });
  }
}
