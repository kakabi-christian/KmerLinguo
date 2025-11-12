// src/goal/dto/goal.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateGoalDto {
  @IsString()
  @IsNotEmpty()
  label: string;
}
