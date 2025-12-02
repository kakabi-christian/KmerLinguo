import { IsString, IsOptional, IsInt, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum QuestionType {
  TEXT = 'TEXT',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  AUDIO_TO_TEXT = 'AUDIO_TO_TEXT',
  AUDIO_TO_TRANSLATION = 'AUDIO_TO_TRANSLATION',
  VOICE_PRONUNCIATION = 'VOICE_PRONUNCIATION',
  VOICE_TO_TEXT = 'VOICE_TO_TEXT',
  WORD_BUILDER = 'WORD_BUILDER', // ✅ Déjà présent
}

// DTO pour les réponses (pour les questions à choix multiple)
export class AnswerDto {
  @IsOptional() // 👈 Rendre optionnel pour WORD_BUILDER
  @IsString()
  text?: string; // 👈 Ajout du "?" pour le rendre optionnel

  @IsOptional()
  @IsString()
  audioPath?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true }) // 👈 NOUVEAU : tableau de strings
  wordOptions?: string[]; // 👈 NOUVEAU : les mots pour WORD_BUILDER

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

  // Réponses pour MULTIPLE_CHOICE, WORD_BUILDER, etc.
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