import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateProgressionDto {
  @IsString()
  userId: string;

  @IsString()
  lessonId: string;

  @IsString()
  questionId: string;

  @IsString()
  languageId: string;

  @IsOptional()
  @IsString()
  userAnswer?: string; // Pour TEXT, MULTIPLE_CHOICE ou AUDIO_TO_TRANSLATION

  @IsOptional()
  @IsString()
  userVoicePath?: string; // Pour VOICE_PRONUNCIATION ou AUDIO_TO_TEXT

  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean; // calculé après validation
}
