import { IsNotEmpty, IsString } from 'class-validator';
export class UpdateLanguageDto {
  @IsString()
  name?: string;

  @IsString()
  languageCode?: string;
}
