import { Module } from '@nestjs/common';
import { MlService } from './ml.service';
import { MlController } from './ml.controller';

@Module({
  providers: [MlService],
  controllers: [MlController]
})
export class MlModule {}
