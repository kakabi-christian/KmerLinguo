import { IsString, IsOptional, IsInt, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum QuestionType {
  TEXT = 'TEXT',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  AUDIO_TO_TEXT = 'AUDIO_TO_TEXT',
  AUDIO_TO_TRANSLATION = 'AUDIO_TO_TRANSLATION',
  VOICE_PRONUNCIATION = 'VOICE_PRONUNCIATION',
  VOICE_TO_TEXT = 'VOICE_TO_TEXT',
}

// DTO pour les réponses (pour les questions à choix multiple)
export class AnswerDto {
  @IsString()
  text: string;
  audioPath?: string;  // <-- ajouté
  @IsOptional()
  isCorrect?: boolean;
}

// DTO principal pour créer une question
export class CreateQuestionDto {
  @IsString()
  lessonId: string;

  @IsString()
  languageId: string;

  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  audioPath?: string;

  @IsOptional()
  @IsString()
  imagePath?: string;

  @IsInt()
  order: number;

  @IsEnum(QuestionType)
  type: QuestionType;

  // Réponses pour MULTIPLE_CHOICE
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers?: AnswerDto[];

  // Réponse correcte pour TEXT
  @IsOptional()
  @IsString()
  correctAnswer?: string;
}
