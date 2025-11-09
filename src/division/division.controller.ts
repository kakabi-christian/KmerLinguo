import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  UseGuards 
} from '@nestjs/common';
import { DivisionService } from './division.service';
import { CreateDivisionDto } from './dto/create-diision.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UpdateDivisionDto } from './dto/update-division.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('divisions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DivisionController {
  constructor(private readonly divisionService: DivisionService) {}

  // POST /divisions/create
  @Post('create')
  @Roles('ADMIN')
  async create(@Body() createDivisionDto: CreateDivisionDto) {
    return this.divisionService.create(createDivisionDto);
  }

  // GET /divisions/search (optionnellement publique)
  @Get('search')
  @Roles('ADMIN')
  async findAll() {
    return this.divisionService.findAll();
  }

  // GET /divisions/search/:id
  @Get('search/:id')
  @Roles('ADMIN')
  async findOne(@Param('id') id: string) {
    return this.divisionService.findOne(id);
  }

  // PUT /divisions/update/:id
  @Put('update/:id')
  @Roles('ADMIN')
  async update(
    @Param('id') id: string, 
    @Body() updateDivisionDto: UpdateDivisionDto
  ) {
    return this.divisionService.update(id, updateDivisionDto);
  }

  // DELETE /divisions/delete/:id
  @Delete('delete/:id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    await this.divisionService.remove(id);
    return { message: 'Division deleted successfully' };
  }
}
