import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { JwtModule } from 'src/jwt/jwt.module';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService],
  imports:[JwtModule],
})
export class ProfileModule {}
