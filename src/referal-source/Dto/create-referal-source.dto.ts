import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReferralSourceDto {
  @IsNotEmpty()
  @IsString()
  label: string;
}
