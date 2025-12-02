import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto, QuestionType } from './dto/create-question.dto';
import { PointService } from '../point/point.service'; 
import { ProgressionQuestionService } from '../progression-question/progression-question.service';
import { LessonProgressService } from '../lesson-progress/lesson-progress.service';
import axios from 'axios';

@Injectable()
export class QuestionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pointService: PointService,
    private readonly progressionQuestionService: ProgressionQuestionService,
    private readonly lessonProgressService: LessonProgressService,
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

  // ---------------- CREATION DES REPONSES ----------------
  let answersData;

  if (type === QuestionType.MULTIPLE_CHOICE ||
      type === QuestionType.AUDIO_TO_TEXT ||
      type === QuestionType.AUDIO_TO_TRANSLATION) {
    if (answers && answers.length > 0) {
      answersData = {
        create: answers.map(a => ({
          text: a.text||"",
          audioPath: a.audioPath, // ajout pour VOICE_TO_TEXT
          isCorrect: a.isCorrect ?? true,
        }))
      };
    }
  } else if (type === QuestionType.TEXT && correctAnswer) {
    answersData = {
      create: { text: correctAnswer, isCorrect: true }
    };
  } else if (type === QuestionType.VOICE_TO_TEXT && answers && answers.length > 0) {
    // Pour VOICE_TO_TEXT, on envoie toujours audioPath
    answersData = {
      create: answers.map(a => ({
        text: a.text || '',        // transcription optionnelle
        audioPath: a.audioPath,    // audio de la bonne réponse
        isCorrect: a.isCorrect ?? true,
      }))
    };
  }

  // ---------------- CREATION DE LA QUESTION ----------------
  const question = await this.prisma.question.create({
    data: { 
      lessonId,
      languageId,
      text,
      order,
      audioPath,
      imagePath,
      type,
      answers: answersData,
    },
    include: { answers: true },
  });

  // ---------------- ENVOI DES REPONSES VERS DJANGO ----------------
  if (question.answers && question.answers.length > 0) {
    for (const a of question.answers) {
      try {
        await axios.post('http://127.0.0.1:8000/audio/answers/', {
          id: a.id,
          questionId: question.id,
          text: a.text,
          audioPath: a.audioPath, // envoi de l'audio
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
      include: { answers: true, lesson: { include: { questions: true } } },
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
    include: { answers: true, lesson: { include: { questions: true } } },
  });

  if (!question) {
    throw new NotFoundException('Question not found');
  }

  // ✅ Déterminer les réponses correctes
  const correctAnswers = question.answers
    .filter(a => a.isCorrect)
    .map(a => a.text);

  const isCorrect = correctAnswers
  .filter((a): a is string => !!a) // garde uniquement les strings définies
  .some(a => a.trim().toLowerCase() === userAnswer.trim().toLowerCase());

  // ---------------- AJOUT DE POINTS POUR CETTE QUESTION ----------------
  let pointsAdded = 0;
  const pointsPerCorrectAnswer = 2;
  if (isCorrect) {
    const pointRecord = await this.pointService.addPoints(userId, pointsPerCorrectAnswer);
    pointsAdded = pointRecord.value;
  }

  // ---------------- AJOUT DANS PROGRESSION QUESTION ----------------
  await this.progressionQuestionService.completeQuestion(userId, questionId, {
    lessonId: question.lessonId,
    languageId: question.languageId,
    isCorrect,
  });

  // ---------------- CALCUL DU TOTAL DES POINTS DE LA LEÇON ----------------
  const completedLessonQuestions = await this.prisma.progressionQuestion.findMany({
    where: {
      userId,
      lessonId: question.lessonId,
      completed: true,
    },
    select: { isCorrect: true },
  });

  const totalLessonPoints = completedLessonQuestions.reduce(
    (acc, q) => acc + (q.isCorrect ? pointsPerCorrectAnswer : 0),
    0
  );

  // ---------------- MARQUER LA LEÇON COMPLÈTE SI TOUS LES QUESTIONS TERMINÉES ----------------
  const totalQuestions = question.lesson.questions.length;
  if (completedLessonQuestions.length === totalQuestions) {
    await this.lessonProgressService.completeLesson(userId, question.lessonId, question.languageId);
  }

  return {
    isCorrect,
    correctAnswers,
    pointsAdded,        // points ajoutés pour cette réponse
    totalLessonPoints,  // total des points obtenus pour cette leçon
  };
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
