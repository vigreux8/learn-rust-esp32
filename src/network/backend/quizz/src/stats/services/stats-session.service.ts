import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SessionSummary } from '../stats.type';

/**
 * Agrégations « session » : regroupement des KPI par jour et par collection, détail d’une session.
 */
@Injectable()
export class StatsSessionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Résout la première collection associée à une question (ordre stable par `question_collection.id`).
   *
   * @param questionId - Identifiant question.
   * @returns Identifiant et nom de collection, ou `null` si aucune liaison.
   */
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

  /**
   * Regroupe les KPI d’un utilisateur par date (YYYY-MM-DD) et par collection : score cumulé.
   *
   * @param userId - Utilisateur cible.
   * @returns Résumés triés par date décroissante ; les KPI sans collection résolue sont ignorés.
   */
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

  /**
   * Détail d’une session identifiée par `sessionId` ; lève une erreur HTTP si introuvable.
   *
   * @param sessionId - Format `{date}_{collectionId}` (ex. `2026-04-08_3`).
   * @param userId - Utilisateur cible.
   * @returns Score, totaux et aperçu des questions du jour pour cette collection.
   * @throws {NotFoundException} Session inexistante ou sans KPI ce jour-là.
   */
  async getSessionDetailOrThrow(sessionId: string, userId: number) {
    const detail = await this.getSessionDetail(sessionId, userId);
    if (!detail) {
      throw new NotFoundException('Session introuvable');
    }
    return detail;
  }

  /**
   * Construit le détail à partir des KPI du jour filtrés sur les questions de la collection.
   *
   * @param sessionId - Format `{date}_{collectionId}`.
   * @param userId - Utilisateur cible.
   * @returns Objet détail ou `null` si format invalide ou aucun KPI ce jour.
   */
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
