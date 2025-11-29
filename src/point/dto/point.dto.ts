// point/dto/point.dto.ts
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class AddPointDto {
  @IsString()
  userId: string;

  @IsNumber()
  points: number;
}

export class GetUserPointsDto {
  @IsString()
  userId: string;
}
