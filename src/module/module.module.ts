import { Module } from '@nestjs/common';
import { ModuleService } from './module.service';
import { ModuleController } from './module.controller';
import { JwtModule } from 'src/jwt/jwt.module';
@Module({
  providers: [ModuleService],
  controllers: [ModuleController],
  imports:[JwtModule]

})
export class ModuleModule {}
