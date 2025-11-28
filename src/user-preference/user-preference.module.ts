import { Module } from '@nestjs/common';
import { UserPreferenceService } from './user-preference.service';
import { UserPreferenceController } from './user-preference.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module'; // ✅ importer le module Auth

@Module({
  controllers: [UserPreferenceController],
  providers: [UserPreferenceService, PrismaService],
  imports: [AuthModule], // ✅ ici
})
export class UserPreferenceModule {}
