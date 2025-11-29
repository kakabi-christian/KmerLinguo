import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

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
import { GoalModule } from './goal/goal.module';
import { ReferalSourceModule } from './referal-source/referal-source.module';
import { UserPreferenceModule } from './user-preference/user-preference.module';
import { MlModule } from './ml/ml.module';

// 🔹 Multer pour upload audio
import { MulterModule } from '@nestjs/platform-express';

// 🔹 Tes guards globaux
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { QuestionModule } from './question/question.module';
import { RankingModule } from './ranking/ranking.module';
import { StatsModule } from './stats/stats.module';
import { ProfileModule } from './profile/profile.module';
import { FeedbackModule } from './feedback/feedback.module';
import { NotificationModule } from './notification/notification.module';
import { ProgressionModule } from './progression/progression.module';
import { PointModule } from './point/point.module';

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
    MlModule,

    // 🔸 Multer global pour upload fichiers
    MulterModule.register({
      dest: './uploads', // dossier temporaire pour stocker les fichiers audio
    }),

    // 🔸 Servir le dossier uploads en statique pour accès depuis Flutter
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads', // accessible via http://localhost:3000/uploads/xxx.mp3
    }),

    QuestionModule,
    RankingModule,
    StatsModule,
    ProfileModule,
    FeedbackModule,
    NotificationModule,
    ProgressionModule,
    PointModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // ✅ Application globale des guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
