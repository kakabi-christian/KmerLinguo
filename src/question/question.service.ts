// question.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto, QuestionType } from './dto/create-question.dto';
import { PointService } from '../point/point.service'; 
import axios from 'axios';

@Injectable()
export class QuestionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pointService: PointService,
  ) {}

  // ---------------- CREATION DE QUESTION ----------------
  async createQuestion(data: CreateQuestionDto) {
    const { answers, type, correctAnswer, lessonId, languageId, text, order, audioPath, imagePath } = data;

    const existingQuestion = await this.prisma.question.findFirst({
      where: { lessonId, languageId, text },
    });
    if (existingQuestion) {
      throw new BadRequestException('Cette question existe déjà pour cette leçon et langue');
    }

    const answersData =
      (type === QuestionType.MULTIPLE_CHOICE ||
        type === QuestionType.AUDIO_TO_TEXT ||
        type === QuestionType.AUDIO_TO_TRANSLATION) &&
      answers &&
      answers.length > 0
        ? { create: answers.map(a => ({ text: a.text, isCorrect: a.isCorrect ?? true })) }
        : undefined;

    const textAnswerData =
      type === QuestionType.TEXT && correctAnswer
        ? { create: { text: correctAnswer, isCorrect: true } }
        : undefined;

    const question = await this.prisma.question.create({
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

    // ---------------- ENVOI DES REPONSES VERS DJANGO ----------------
    if (question.answers && question.answers.length > 0) {
      for (const a of question.answers) {
        try {
          await axios.post('http://127.0.0.1:8000/audio/answers/', {
            id: a.id,           // UUID généré par Prisma
            questionId: question.id,
            text: a.text,
            isCorrect: a.isCorrect,
          });
          console.log('✅ Réponse envoyée à Django:', a.text);
        } catch (error) {
          console.error('❌ Erreur lors de l\'envoi à Django:', error.response?.data || error.message);
        }
      }
    }

    return question;
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

  // ---------------- VERIFIER LA REPONSE DE L'UTILISATEUR ET AJOUTER DES POINTS ----------------
  async checkAnswer(questionId: string, userAnswer: string, userId: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: { answers: true },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const correctAnswers = question.answers
      .filter(a => a.isCorrect)
      .map(a => a.text);

    const isCorrect = correctAnswers.some(
      a => a.trim().toLowerCase() === userAnswer.trim().toLowerCase()
    );

    let pointsAdded = 0;
    if (isCorrect) {
      const pointsPerCorrectAnswer = 2; 
      const pointRecord = await this.pointService.addPoints(userId, pointsPerCorrectAnswer);
      pointsAdded = pointRecord.value;
    }

    return { isCorrect, correctAnswers, pointsAdded };
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
