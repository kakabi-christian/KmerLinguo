import { Module } from '@nestjs/common';
import { LanguageController } from './language.controller';
import { LanguageService } from './language.service';
import { JwtModule } from '../jwt/jwt.module';
@Module({
  imports:[JwtModule
  ],
  controllers: [LanguageController],
  providers: [LanguageService],
})
export class LanguageModule {}
