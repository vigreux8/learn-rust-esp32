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
    verifier: boolean;
    categorie_id: number;
    ref_categorie: { type: string };
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
      verifier: q.verifier,
      categorie_id: q.categorie_id,
      categorie_type: q.ref_categorie.type,
      reponses: ordered.map((j) => ({
        id: j.quizz_reponse.id,
        reponse: j.quizz_reponse.reponse,
        bonne_reponse: j.quizz_reponse.bonne_reponse === 1,
      })),
    };
  }

  async buildCollectionUi(
    collectionId: number,
    qtype: 'histoire' | 'pratique' | 'melanger' = 'melanger',
  ): Promise<CollectionUi | null> {
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
            ref_categorie: true,
            quizz_question_reponse: {
              include: { quizz_reponse: true },
            },
          },
        },
      },
    });

    const question_counts_by_type = { histoire: 0, pratique: 0 };
    for (const qc of qcs) {
      const t = qc.quizz_question.ref_categorie.type;
      if (t === 'histoire') question_counts_by_type.histoire += 1;
      else if (t === 'pratique') question_counts_by_type.pratique += 1;
    }

    const filtered =
      qtype === 'melanger'
        ? qcs
        : qcs.filter((qc) => qc.quizz_question.ref_categorie.type === qtype);

    const questions = filtered.map((qc) => this.mapQuestionToUi(qc.quizz_question));

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
      question_counts_by_type,
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

  async getCollection(
    collectionId: number,
    qtype: 'histoire' | 'pratique' | 'melanger' = 'melanger',
  ): Promise<CollectionUi> {
    const ui = await this.buildCollectionUi(collectionId, qtype);
    if (!ui || ui.questions.length === 0) {
      throw new NotFoundException(
        qtype !== 'melanger'
          ? `Aucune question de type « ${qtype} » dans la collection ${collectionId}.`
          : `Collection ${collectionId} introuvable ou vide`,
      );
    }
    return ui;
  }

  async randomQuizQuestions(
    order: 'random' | 'linear' = 'random',
    qtype: 'histoire' | 'pratique' | 'melanger' = 'melanger',
  ): Promise<QuestionUi[]> {
    const where =
      qtype === 'melanger'
        ? {}
        : { ref_categorie: { type: qtype } };
    const rows = await this.prisma.prisma.quizz_question.findMany({
      where: {
        ...where,
        quizz_question_reponse: { some: {} },
      },
      orderBy: { id: 'asc' },
      include: {
        ref_categorie: true,
        quizz_question_reponse: {
          include: { quizz_reponse: true },
        },
      },
    });
    const mapped = rows.map((q) => this.mapQuestionToUi(q));
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
      verifier: r.verifier,
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
      verifier: r.verifier,
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
