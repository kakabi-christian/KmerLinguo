import { ReferralSourceController } from './referal-source.controller';
import { Module } from '@nestjs/common';
import { ReferralSourceService } from './referal-source.service';
@Module({
  providers: [ReferralSourceService],
  controllers: [ReferralSourceController]
})
export class ReferalSourceModule {}
