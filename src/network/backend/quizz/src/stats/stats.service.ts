import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async createUserKpi(
    userId: number,
    questionId: number,
    reponseId: number,
    dureeSecondes: number,
  ): Promise<UserKpiRow> {
    if (
      !Number.isFinite(dureeSecondes) ||
      dureeSecondes < 0 ||
      dureeSecondes > 86_400
    ) {
      throw new BadRequestException(
        'dureeSecondes doit être un nombre entre 0 et 86400',
      );
    }

    const user = await this.prisma.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`Utilisateur ${userId} introuvable`);
    }

    const question = await this.prisma.prisma.quizz_question.findUnique({
      where: { id: questionId },
    });
    if (!question) {
      throw new NotFoundException(`Question ${questionId} introuvable`);
    }

    const reponse = await this.prisma.prisma.quizz_reponse.findUnique({
      where: { id: reponseId },
    });
    if (!reponse) {
      throw new NotFoundException(`Réponse ${reponseId} introuvable`);
    }

    const link = await this.prisma.prisma.quizz_question_reponse.findFirst({
      where: { question_id: questionId, reponse_id: reponseId },
    });
    if (!link) {
      throw new BadRequestException(
        'Cette réponse ne correspond pas à la question indiquée',
      );
    }

    const duree_session = String(Math.round(dureeSecondes * 1000) / 1000);
    const row = await this.prisma.prisma.user_kpi.create({
      data: {
        user_id: userId,
        create_at: new Date().toISOString(),
        question_id: questionId,
        reponse_id: reponseId,
        duree_session,
      },
      include: { quizz_reponse: true },
    });

    return {
      id: row.id,
      user_id: row.user_id,
      create_at: row.create_at,
      question_id: row.question_id,
      reponse_id: row.reponse_id,
      duree_session: row.duree_session,
      correct: row.quizz_reponse.bonne_reponse === 1,
    };
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

  async getSessionDetailOrThrow(sessionId: string, userId: number) {
    const detail = await this.getSessionDetail(sessionId, userId);
    if (!detail) {
      throw new NotFoundException('Session introuvable');
    }
    return detail;
  }

  private async getSessionDetail(sessionId: string, userId: number) {
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
