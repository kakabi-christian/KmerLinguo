import { PartialType } from '@nestjs/mapped-types';
import { CreateReferralSourceDto } from './create-referal-source.dto';

export class UpdateReferralSourceDto extends PartialType(CreateReferralSourceDto) {}
