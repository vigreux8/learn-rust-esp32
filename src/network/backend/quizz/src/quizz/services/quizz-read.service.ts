import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CollectionUi,
  QuestionUi,
  QuizzQuestionDetail,
  QuizzQuestionRow,
  RefCategorieRow,
} from '../quizz.type';

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

@Injectable()
export class QuizzReadService {
  constructor(private readonly prisma: PrismaService) {}

  private mapQuestionToUi(q: {
    id: number;
    user_id: number;
    create_at: string;
    question: string;
    commentaire: string;
    quizz_question_reponse: {
      id: number;
      quizz_reponse: { id: number; reponse: string; bonne_reponse: number };
    }[];
  }): QuestionUi {
    const ordered = [...q.quizz_question_reponse].sort((a, b) => a.id - b.id);
    return {
      id: q.id,
      user_id: q.user_id,
      create_at: q.create_at,
      question: q.question,
      commentaire: q.commentaire ?? '',
      reponses: ordered.map((j) => ({
        id: j.quizz_reponse.id,
        reponse: j.quizz_reponse.reponse,
        bonne_reponse: j.quizz_reponse.bonne_reponse === 1,
      })),
    };
  }

  async buildCollectionUi(collectionId: number): Promise<CollectionUi | null> {
    const col = await this.prisma.prisma.quizz_collection.findUnique({
      where: { id: collectionId },
      include: {
        user: true,
        quizz_module_collection: {
          orderBy: { id: 'asc' },
          include: { quizz_module: true },
        },
      },
    });
    if (!col) return null;

    const qcs = await this.prisma.prisma.question_collection.findMany({
      where: { collection_id: collectionId },
      orderBy: { id: 'asc' },
      include: {
        quizz_question: {
          include: {
            quizz_question_reponse: {
              include: { quizz_reponse: true },
            },
          },
        },
      },
    });

    const questions = qcs.map((qc) => this.mapQuestionToUi(qc.quizz_question));

    const modules = col.quizz_module_collection.map((mc) => ({
      id: mc.quizz_module.id,
      nom: mc.quizz_module.nom,
    }));

    return {
      id: col.id,
      user_id: col.user_id,
      create_at: col.create_at,
      update_at: col.update_at,
      nom: col.nom,
      questions,
      createur_pseudot: col.user.pseudot,
      modules,
    };
  }

  async listCollections(): Promise<CollectionUi[]> {
    const cols = await this.prisma.prisma.quizz_collection.findMany({
      orderBy: { id: 'asc' },
    });
    const out: CollectionUi[] = [];
    for (const c of cols) {
      const ui = await this.buildCollectionUi(c.id);
      if (ui) out.push(ui);
    }
    return out;
  }

  async getCollection(collectionId: number): Promise<CollectionUi> {
    const ui = await this.buildCollectionUi(collectionId);
    if (!ui || ui.questions.length === 0) {
      throw new NotFoundException(`Collection ${collectionId} introuvable ou vide`);
    }
    return ui;
  }

  async randomQuizQuestions(
    order: 'random' | 'linear' = 'random',
  ): Promise<QuestionUi[]> {
    const rows = await this.prisma.prisma.quizz_question.findMany({
      orderBy: { id: 'asc' },
      include: {
        quizz_question_reponse: {
          include: { quizz_reponse: true },
        },
      },
    });
    const withAnswers = rows.filter((q) => q.quizz_question_reponse.length > 0);
    const mapped = withAnswers.map((q) => this.mapQuestionToUi(q));
    return order === 'linear' ? mapped : shuffle(mapped);
  }

  async listRefCategories(): Promise<RefCategorieRow[]> {
    return this.prisma.prisma.ref_categorie.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, type: true },
    });
  }

  async getQuestionDetail(id: number): Promise<QuizzQuestionDetail> {
    const r = await this.prisma.prisma.quizz_question.findUnique({
      where: { id },
      include: {
        ref_categorie: true,
        quizz_question_reponse: {
          include: { quizz_reponse: true },
          orderBy: { id: 'asc' },
        },
        question_collection: {
          include: { quizz_collection: true },
          orderBy: { id: 'asc' },
        },
      },
    });
    if (!r) {
      throw new NotFoundException(`Question ${id} introuvable`);
    }
    const ordered = [...r.quizz_question_reponse].sort((a, b) => a.id - b.id);
    const reponses = ordered.map((j) => ({
      id: j.quizz_reponse.id,
      reponse: j.quizz_reponse.reponse,
      bonne_reponse: j.quizz_reponse.bonne_reponse === 1,
    }));
    return {
      id: r.id,
      user_id: r.user_id,
      create_at: r.create_at,
      question: r.question,
      commentaire: r.commentaire ?? '',
      categorie_id: r.categorie_id,
      categorie_type: r.ref_categorie.type,
      collections: r.question_collection.map((qc) => ({
        id: qc.quizz_collection.id,
        nom: qc.quizz_collection.nom,
      })),
      reponses,
    };
  }

  async listQuestions(
    collectionFilter?: number | 'none',
  ): Promise<QuizzQuestionRow[]> {
    const where =
      collectionFilter === 'none'
        ? { question_collection: { none: {} } }
        : collectionFilter !== undefined
          ? {
              question_collection: {
                some: { collection_id: collectionFilter },
              },
            }
          : {};

    const rows = await this.prisma.prisma.quizz_question.findMany({
      where,
      orderBy: { id: 'asc' },
      include: {
        ref_categorie: true,
        question_collection: {
          include: { quizz_collection: true },
          orderBy: { id: 'asc' },
        },
      },
    });

    return rows.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      create_at: r.create_at,
      question: r.question,
      commentaire: r.commentaire ?? '',
      categorie_id: r.categorie_id,
      categorie_type: r.ref_categorie.type,
      collections: r.question_collection.map((qc) => ({
        id: qc.quizz_collection.id,
        nom: qc.quizz_collection.nom,
      })),
    }));
  }

  listQuestionsFromQuery(collectionId?: string): Promise<QuizzQuestionRow[]> {
    if (collectionId === undefined || collectionId === '') {
      return this.listQuestions();
    }
    if (collectionId === 'none') {
      return this.listQuestions('none');
    }
    const n = Number(collectionId);
    if (!Number.isFinite(n) || !Number.isInteger(n)) {
      throw new BadRequestException(
        'Query collectionId : nombre entier ou la valeur "none"',
      );
    }
    return this.listQuestions(n);
  }
}
