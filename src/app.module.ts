import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// 🔹 Tes modules internes
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtModule } from './jwt/jwt.module';
import { CryptoModule } from './crypto/crypto.module';
import { LanguageModule } from './language/language.module';
import { DivisionModule } from './division/division.module';
import { ModuleModule } from './module/module.module';
import { ChapterModule } from './chapter/chapter.module';
import { LessonModule } from './lesson/lesson.module';
import { StatistiqueModule } from './statistique/statistique.module';

// 🔹 Tes guards globaux
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { GoalModule } from './goal/goal.module';
import { ReferalSourceModule } from './referal-source/referal-source.module';
import { UserPreferenceModule } from './user-preference/user-preference.module';

@Module({
  imports: [
    // 🔸 Configuration globale de l’environnement
    ConfigModule.forRoot({ isGlobal: true }),

    // 🔸 Modules de ton application
    EmailModule,
    AuthModule,
    PrismaModule,
    JwtModule,
    CryptoModule,
    LanguageModule,
    DivisionModule,
    ModuleModule,
    ChapterModule,
    LessonModule,
    StatistiqueModule,
    GoalModule,
    ReferalSourceModule,
    UserPreferenceModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // ✅ Application globale des guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Protège toutes les routes par JWT sauf celles avec @Public()
    },
    
  ],
})
export class AppModule {}
