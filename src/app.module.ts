import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtModule } from './jwt/jwt.module';
import { CryptoModule } from './crypto/crypto.module';
import { LanguageModule } from './language/language.module';
import { DivisionModule } from './division/division.module';
import { ModuleModule } from './module/module.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}),
    EmailModule,
    AuthModule,
    PrismaModule,
    JwtModule,
    CryptoModule,
    LanguageModule,
    DivisionModule,
    ModuleModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
