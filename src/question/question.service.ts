import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto, QuestionType } from './dto/create-question.dto';

@Injectable()
export class QuestionService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------- CREATION DE QUESTION ----------------
  async createQuestion(data: CreateQuestionDto) {
    const { answers, type, correctAnswer, lessonId, languageId, text, order, audioPath, imagePath } = data;

    // Vérifier si la question existe déjà pour cette leçon et langue
    const existingQuestion = await this.prisma.question.findFirst({
      where: { lessonId, languageId, text },
    });
    if (existingQuestion) {
      throw new BadRequestException('Cette question existe déjà pour cette leçon et langue');
    }

    // Préparer les réponses pour MULTIPLE_CHOICE, AUDIO_TO_TEXT, AUDIO_TO_TRANSLATION
    const answersData =
      (type === QuestionType.MULTIPLE_CHOICE ||
        type === QuestionType.AUDIO_TO_TEXT ||
        type === QuestionType.AUDIO_TO_TRANSLATION) &&
      answers &&
      answers.length > 0
        ? { create: answers.map(a => ({ text: a.text, isCorrect: a.isCorrect ?? true })) }
        : undefined;

    // Pour les questions TEXT, on crée une réponse unique
    const textAnswerData =
      type === QuestionType.TEXT && correctAnswer
        ? { create: { text: correctAnswer, isCorrect: true } }
        : undefined;

    return this.prisma.question.create({
      data: {
        lessonId,
        languageId,
        text,
        order,
        audioPath,
        imagePath,
        type,
        answers: answersData || textAnswerData,
      },
      include: { answers: true },
    });
  }

  // ---------------- RECUPERER LES QUESTIONS D'UNE LEÇON EN FONCTION DE LA LANGUE ----------------
  async getQuestionsByLessonAndLanguage(lessonId: string, languageId: string) {
    const questions = await this.prisma.question.findMany({
      where: { lessonId, languageId },
      include: { answers: true },
      orderBy: { order: 'asc' },
    });

    if (!questions || questions.length === 0) {
      throw new NotFoundException('Aucune question disponible pour cette leçon et cette langue');
    }

    return questions;
  }

  // ---------------- RECUPERER UNE QUESTION PAR ID ----------------
  async getQuestionById(questionId: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: { answers: true },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  // ---------------- VERIFIER LA REPONSE DE L'UTILISATEUR ----------------
  async checkAnswer(questionId: string, userAnswer: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: { answers: true },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // On ne garde que les réponses correctes
    const correctAnswers = question.answers
      .filter(a => a.isCorrect)
      .map(a => a.text);

    // Comparaison simple (insensible à la casse et aux espaces)
    const isCorrect = correctAnswers.some(
      a => a.trim().toLowerCase() === userAnswer.trim().toLowerCase()
    );

    return { isCorrect, correctAnswers };
  }

  // ---------------- TROUVER LANGUE PAR CODE ----------------
  async findLanguageByCode(code: string) {
    if (!code) return null;
    const language = await this.prisma.language.findFirst({
      where: { languageCode: code },
    });
    return language || null;
  }

 async findUserPreference(userId: string) {
  return this.prisma.userPreference.findFirst({
    where: { userId },
  });
}

}


