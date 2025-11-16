import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuestionService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------- CREATE ----------------
  async createQuestion(data: {
    lessonId: string;
    languageId: string;
    text: string;
    audioPath?: string;
    imagePath?: string;
    order: number;
    answers: { text: string; isCorrect: boolean }[];
  }) {
    return this.prisma.question.create({
      data: {
        lessonId: data.lessonId,
        languageId: data.languageId,
        text: data.text,
        audioPath: data.audioPath || null,
        imagePath: data.imagePath || null,
        order: data.order,
        answers: {
          create: data.answers,
        },
      },
      include: {
        answers: true, // renvoie les réponses créées
      },
    });
  }
  async findByLesson(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    // Récupère toutes les questions liées à cette leçon
    return this.prisma.question.findMany({
      where: { lessonId },
      orderBy: { order: 'asc' },
    });
  }

  // ---------------- READ ----------------
  async getAllQuestions() {
    return this.prisma.question.findMany({
      include: {
        answers: true,
      },
    });
  }

  async getQuestionById(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: { answers: true },
    });
    if (!question) throw new NotFoundException('Question non trouvée');
    return question;
  }

  // ---------------- UPDATE ----------------
  async updateQuestion(
    id: string,
    data: {
      text?: string;
      audioPath?: string;
      imagePath?: string;
      order?: number;
      answers?: { text: string; isCorrect: boolean }[];
    },
  ) {
    // Vérifier que la question existe
    const question = await this.prisma.question.findUnique({ where: { id } });
    if (!question) throw new NotFoundException('Question non trouvée');

    // Mettre à jour les réponses si nécessaire
    if (data.answers) {
      // Supprimer les anciennes réponses
      await this.prisma.answer.deleteMany({ where: { questionId: id } });
    }

    return this.prisma.question.update({
      where: { id },
      data: {
        text: data.text,
        audioPath: data.audioPath,
        imagePath: data.imagePath,
        order: data.order,
        answers: data.answers ? { create: data.answers } : undefined,
      },
      include: { answers: true },
    });
  }
  

  // ---------------- DELETE ----------------
  async deleteQuestion(id: string) {
    // Supprimer d’abord les réponses liées
    await this.prisma.answer.deleteMany({ where: { questionId: id } });

    // Supprimer la question
    return this.prisma.question.delete({ where: { id } });
  }
}
