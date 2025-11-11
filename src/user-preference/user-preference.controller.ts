import { Controller, Get, Post, Patch, Body, Param, NotFoundException } from '@nestjs/common';
import { UserPreferenceService } from './user-preference.service';
import { CreateUserPreferenceDto } from './Dto/create-user-preference.dto';
import { UpdateUserPreferenceDto } from './Dto/update-user-preference.dto';

@Controller('user-preferences')
export class UserPreferenceController {
  constructor(private readonly service: UserPreferenceService) {}

  /**
   * 🟢 Étape 1 : Création initiale de la préférence utilisateur
   * L'utilisateur choisit la langue (targetLanguage)
   * Exemple URL : POST http://localhost:3000/user-preferences/create
   */
  @Post('create')
  async createStep1(@Body() data: CreateUserPreferenceDto) {
    return this.service.createStep1(data);
  }

  /**
   * 🟡 Étapes suivantes : mise à jour du goal et de la referral source
   * Exemple URL : PATCH http://localhost:3000/user-preferences/update/eaa1b34b-0c91-45c4-b9a8-3c17e5cc39e2
   */
  @Patch('update/:userId')
  async updateStep(
    @Param('userId') userId: string,
    @Body() data: UpdateUserPreferenceDto,
  ) {
    const result = await this.service.updateStep(userId, data);
    if (!result) throw new NotFoundException('User preference not found');
    return result;
  }

  /**
   * 🔵 Récupérer les préférences d’un utilisateur
   * Exemple URL : GET http://localhost:3000/user-preferences/eaa1b34b-0c91-45c4-b9a8-3c17e5cc39e2
   */
  @Get(':userId')
  async getByUser(@Param('userId') userId: string) {
    return this.service.getByUserId(userId);
  }
}
