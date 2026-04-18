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
  SousCollectionUi,
} from '../quizz.type';

export type QuizPlayOrder =
  | 'random'
  | 'linear'
  | 'jamais_repondu'
  | 'recent'
  | 'ancien'
  | 'mal_repondu';

export type QuizPlaySessionOpts = {
  /** Modes appliqués dans l’ordre (ex. `ancien` puis `mal_repondu`). */
  orders: QuizPlayOrder[];
  /** Présent pour le tirage « toutes collections » (`GET /quizz/random`). */
  qtype?: 'histoire' | 'pratique' | 'melanger';
  userId?: number;
  limit?: number;
  excludeIds: number[];
};

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
    play?: QuizPlaySessionOpts,
  ): Promise<CollectionUi> {
    const ui = await this.buildCollectionUi(collectionId, qtype);
    if (!ui || ui.questions.length === 0) {
      throw new NotFoundException(
        qtype !== 'melanger'
          ? `Aucune question de type « ${qtype} » dans la collection ${collectionId}.`
          : `Collection ${collectionId} introuvable ou vide`,
      );
    }
    if (play == null) {
      return ui;
    }
    const exclude = new Set(play.excludeIds);
    let questions = ui.questions.filter((q) => !exclude.has(q.id));
    questions = await this.applyPlayOrders(questions, play.orders, play.userId);
    if (play.limit != null && questions.length > play.limit) {
      questions = questions.slice(0, play.limit);
    }
    if (questions.length === 0) {
      throw new NotFoundException(
        play.orders.includes('jamais_repondu')
          ? `Aucune question « jamais répondue » disponible pour cet utilisateur dans la collection ${collectionId} (avec ce filtre).`
          : `Aucune question disponible dans la collection ${collectionId} avec ces critères.`,
      );
    }
    return { ...ui, questions };
  }

  private compareCreateAtIso(a: string, b: string): number {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }

  private async distinctAttemptedQuestionIds(
    userId: number,
    questionIds: number[],
  ): Promise<Set<number>> {
    if (questionIds.length === 0) return new Set();
    const rows = await this.prisma.prisma.user_kpi.findMany({
      where: { user_id: userId, question_id: { in: questionIds } },
      select: { question_id: true },
      distinct: ['question_id'],
    });
    return new Set(rows.map((r) => r.question_id));
  }

  private async kpiGoodBadCounts(
    userId: number,
    questionIds: number[],
  ): Promise<Map<number, { good: number; bad: number }>> {
    const map = new Map<number, { good: number; bad: number }>();
    if (questionIds.length === 0) return map;
    const kpis = await this.prisma.prisma.user_kpi.findMany({
      where: { user_id: userId, question_id: { in: questionIds } },
      select: {
        question_id: true,
        quizz_reponse: { select: { bonne_reponse: true } },
      },
    });
    for (const k of kpis) {
      const ok = k.quizz_reponse.bonne_reponse === 1;
      const cur = map.get(k.question_id) ?? { good: 0, bad: 0 };
      if (ok) cur.good += 1;
      else cur.bad += 1;
      map.set(k.question_id, cur);
    }
    return map;
  }

  private async applySinglePlayOrder(
    questions: QuestionUi[],
    order: QuizPlayOrder,
    userId?: number,
  ): Promise<QuestionUi[]> {
    const copy = [...questions];
    switch (order) {
      case 'linear':
        /** Ordre de liaison collection (ou id croissant côté `findMany` global) — on ne réordonne pas. */
        return copy;
      case 'random':
        return shuffle(copy);
      case 'recent':
        return copy.sort((a, b) => this.compareCreateAtIso(b.create_at, a.create_at));
      case 'ancien':
        return copy.sort((a, b) => this.compareCreateAtIso(a.create_at, b.create_at));
      case 'jamais_repondu': {
        if (userId === undefined) {
          throw new BadRequestException('userId requis pour jamais_repondu');
        }
        const ids = copy.map((q) => q.id);
        const attempted = await this.distinctAttemptedQuestionIds(userId, ids);
        return copy.filter((q) => !attempted.has(q.id));
      }
      case 'mal_repondu': {
        if (userId === undefined) {
          throw new BadRequestException('userId requis pour mal_repondu');
        }
        const ids = copy.map((q) => q.id);
        const stats = await this.kpiGoodBadCounts(userId, ids);
        const scored = copy.map((q) => {
          const s = stats.get(q.id);
          const good = s?.good ?? 0;
          const bad = s?.bad ?? 0;
          const w = 1 + Math.max(0, bad - good);
          const key = -Math.log(Math.max(1e-12, Math.random())) / w;
          return { q, key };
        });
        scored.sort((a, b) => a.key - b.key);
        return scored.map((x) => x.q);
      }
      default:
        return shuffle(copy);
    }
  }

  private async applyPlayOrders(
    questions: QuestionUi[],
    orders: QuizPlayOrder[],
    userId?: number,
  ): Promise<QuestionUi[]> {
    let pool = [...questions];
    for (const step of orders) {
      pool = await this.applySinglePlayOrder(pool, step, userId);
    }
    return pool;
  }

  async randomQuizQuestions(opts: QuizPlaySessionOpts): Promise<QuestionUi[]> {
    const { orders, userId, limit, excludeIds } = opts;
    const qtype = opts.qtype ?? 'melanger';
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
    const exclude = new Set(excludeIds);
    let mapped = rows.map((q) => this.mapQuestionToUi(q)).filter((q) => !exclude.has(q.id));
    mapped = await this.applyPlayOrders(mapped, orders, userId);
    if (limit != null && mapped.length > limit) {
      mapped = mapped.slice(0, limit);
    }
    return mapped;
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

  async listSousCollectionsByCollection(
    collectionId: number,
  ): Promise<SousCollectionUi[]> {
    const col = await this.prisma.prisma.quizz_collection.findUnique({
      where: { id: collectionId },
    });
    if (!col) {
      throw new NotFoundException(`Collection ${collectionId} introuvable`);
    }

    const rows = await this.prisma.prisma.sous_collections.findMany({
      where: { collection_id: collectionId },
      orderBy: { id: 'asc' },
      include: {
        relation_sous_collections: {
          orderBy: { id: 'asc' },
          include: {
            quizz_question: {
              include: { ref_categorie: true },
            },
          },
        },
      },
    });

    return rows.map((r) => ({
      id: r.id,
      collection_id: r.collection_id,
      nom: r.nom,
      description: r.description ?? '',
      questions: r.relation_sous_collections.map((rel) => ({
        relation_id: rel.id,
        question_id: rel.quizz_question.id,
        question: rel.quizz_question.question,
        categorie_type: rel.quizz_question.ref_categorie.type,
      })),
    }));
  }
}
