import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ReferralSourceService } from './referal-source.service';
import { UpdateReferralSourceDto } from './Dto/update-referal-source.dto';
import { CreateReferralSourceDto } from './Dto/create-referal-source.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('referralsources')
@UseGuards(RolesGuard)
@Roles('ADMIN')
export class ReferralSourceController {
  constructor(private readonly referralSourceService: ReferralSourceService) {}

  @Post('create')
  create(@Body() dto: CreateReferralSourceDto) {
    return this.referralSourceService.create(dto);
  }

  @Get()
  findAll() {
    return this.referralSourceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.referralSourceService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateReferralSourceDto) {
    return this.referralSourceService.update(id, dto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.referralSourceService.remove(id);
  }
}
