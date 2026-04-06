import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type ReponseUi = {
  id: number;
  reponse: string;
  bonne_reponse: boolean;
};

export type QuestionUi = {
  id: number;
  user_id: number;
  create_at: string;
  question: string;
  reponses: ReponseUi[];
};

export type CollectionUi = {
  id: number;
  user_id: number;
  create_at: string;
  update_at: string;
  nom: string;
  questions: QuestionUi[];
  createur_pseudot: string;
};

export type QuizzQuestionRow = {
  id: number;
  user_id: number;
  create_at: string;
  question: string;
};

export type UserKpiRow = {
  id: number;
  user_id: number;
  create_at: string;
  question_id: number;
  reponse_id: number;
  duree_session: string;
  correct: boolean;
};

export type SessionSummary = {
  id: string;
  date: string;
  collectionName: string;
  scoreLabel: string;
  good: number;
  total: number;
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
export class QuizzService {
  constructor(private readonly prisma: PrismaService) {}

  private mapQuestionToUi(q: {
    id: number;
    user_id: number;
    create_at: string;
    question: string;
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
      reponses: ordered.map((j) => ({
        id: j.quizz_reponse.id,
        reponse: j.quizz_reponse.reponse,
        bonne_reponse: j.quizz_reponse.bonne_reponse === 1,
      })),
    };
  }

  async buildCollectionUi(collectionId: number): Promise<CollectionUi | null> {
    const col = await this.prisma.prisma.ref_collection.findUnique({
      where: { id: collectionId },
      include: { user: true },
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

    return {
      id: col.id,
      user_id: col.user_id,
      create_at: col.create_at,
      update_at: col.update_at,
      nom: col.nom,
      questions,
      createur_pseudot: col.user.pseudot,
    };
  }

  async listCollections(): Promise<CollectionUi[]> {
    const cols = await this.prisma.prisma.ref_collection.findMany({
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

  async randomQuizQuestions(): Promise<QuestionUi[]> {
    const rows = await this.prisma.prisma.quizz_question.findMany({
      include: {
        quizz_question_reponse: {
          include: { quizz_reponse: true },
        },
      },
    });
    const withAnswers = rows.filter((q) => q.quizz_question_reponse.length > 0);
    return shuffle(withAnswers.map((q) => this.mapQuestionToUi(q)));
  }

  async listQuestions(): Promise<QuizzQuestionRow[]> {
    const rows = await this.prisma.prisma.quizz_question.findMany({
      orderBy: { id: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      create_at: r.create_at,
      question: r.question,
    }));
  }

  async updateQuestion(id: number, question: string): Promise<QuizzQuestionRow> {
    try {
      const row = await this.prisma.prisma.quizz_question.update({
        where: { id },
        data: { question },
      });
      return {
        id: row.id,
        user_id: row.user_id,
        create_at: row.create_at,
        question: row.question,
      };
    } catch {
      throw new NotFoundException(`Question ${id} introuvable`);
    }
  }

  async deleteQuestion(id: number): Promise<void> {
    const exists = await this.prisma.prisma.quizz_question.findUnique({
      where: { id },
    });
    if (!exists) throw new NotFoundException(`Question ${id} introuvable`);

    await this.prisma.prisma.$transaction([
      this.prisma.prisma.user_kpi.deleteMany({ where: { question_id: id } }),
      this.prisma.prisma.quizz_question_reponse.deleteMany({ where: { question_id: id } }),
      this.prisma.prisma.question_collection.deleteMany({ where: { question_id: id } }),
      this.prisma.prisma.quizz_question.delete({ where: { id } }),
    ]);
  }

  async listKpis(userId: number): Promise<UserKpiRow[]> {
    const rows = await this.prisma.prisma.user_kpi.findMany({
      where: { user_id: userId },
      include: { quizz_reponse: true },
      orderBy: { create_at: 'desc' },
    });
    return rows.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      create_at: r.create_at,
      question_id: r.question_id,
      reponse_id: r.reponse_id,
      duree_session: r.duree_session,
      correct: r.quizz_reponse.bonne_reponse === 1,
    }));
  }

  private async resolveCollectionForQuestion(
    questionId: number,
  ): Promise<{ collectionId: number; collectionName: string } | null> {
    const qc = await this.prisma.prisma.question_collection.findFirst({
      where: { question_id: questionId },
      orderBy: { id: 'asc' },
      include: { ref_collection: true },
    });
    if (!qc) return null;
    return { collectionId: qc.collection_id, collectionName: qc.ref_collection.nom };
  }

  async listSessionSummaries(userId: number): Promise<SessionSummary[]> {
    const kpis = await this.prisma.prisma.user_kpi.findMany({
      where: { user_id: userId },
      include: { quizz_reponse: true },
      orderBy: { create_at: 'desc' },
    });

    type Agg = { date: string; collectionName: string; good: number; total: number };
    const map = new Map<string, Agg>();

    for (const k of kpis) {
      const resolved = await this.resolveCollectionForQuestion(k.question_id);
      if (!resolved) continue;
      const day = k.create_at.slice(0, 10);
      const key = `${day}_${resolved.collectionId}`;
      const good = k.quizz_reponse.bonne_reponse === 1 ? 1 : 0;
      const cur = map.get(key);
      if (cur) {
        cur.good += good;
        cur.total += 1;
      } else {
        map.set(key, {
          date: day,
          collectionName: resolved.collectionName,
          good,
          total: 1,
        });
      }
    }

    return [...map.entries()]
      .map(([key, v]) => ({
        id: key,
        date: v.date,
        collectionName: v.collectionName,
        good: v.good,
        total: v.total,
        scoreLabel: `${v.good} / ${v.total}`,
      }))
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }

  async getSessionDetail(sessionId: string, userId: number) {
    const m = /^(\d{4}-\d{2}-\d{2})_(\d+)$/.exec(sessionId);
    if (!m) return null;
    const day = m[1];
    const collectionId = Number(m[2]);
    if (!Number.isFinite(collectionId)) return null;

    const qids = (
      await this.prisma.prisma.question_collection.findMany({
        where: { collection_id: collectionId },
        select: { question_id: true },
      })
    ).map((x) => x.question_id);

    const kpis = await this.prisma.prisma.user_kpi.findMany({
      where: {
        user_id: userId,
        question_id: { in: qids },
      },
      include: { quizz_reponse: true, quizz_question: true },
      orderBy: { create_at: 'asc' },
    });

    const dayKpis = kpis.filter((k) => k.create_at.startsWith(day));
    if (dayKpis.length === 0) return null;

    const good = dayKpis.filter((k) => k.quizz_reponse.bonne_reponse === 1).length;
    const col = await this.prisma.prisma.ref_collection.findUnique({
      where: { id: collectionId },
    });
    const collectionName = col?.nom ?? `Collection #${collectionId}`;

    const questionsPreview = dayKpis.map((k) => ({
      id: k.quizz_question.id,
      question: k.quizz_question.question,
    }));

    return {
      id: sessionId,
      date: day,
      collectionName,
      scoreLabel: `${good} / ${dayKpis.length}`,
      good,
      total: dayKpis.length,
      questionsPreview,
    };
  }
}
