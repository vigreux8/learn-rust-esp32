import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
  commentaire: string;
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

export type QuizzCollectionRef = {
  id: number;
  nom: string;
};

export type QuizzQuestionRow = {
  id: number;
  user_id: number;
  create_at: string;
  question: string;
  commentaire: string;
  collections: QuizzCollectionRef[];
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

function nowIso(): string {
  return new Date().toISOString();
}

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
        question_collection: {
          include: { ref_collection: true },
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
      collections: r.question_collection.map((qc) => ({
        id: qc.ref_collection.id,
        nom: qc.ref_collection.nom,
      })),
    }));
  }

  async updateQuestion(
    id: number,
    data: { question?: string; commentaire?: string },
  ): Promise<QuizzQuestionRow> {
    const patch: { question?: string; commentaire?: string } = {};
    if (typeof data.question === 'string') patch.question = data.question;
    if (typeof data.commentaire === 'string') patch.commentaire = data.commentaire;
    if (Object.keys(patch).length === 0) {
      throw new BadRequestException(
        'Au moins un champ "question" ou "commentaire" (string) requis',
      );
    }
    try {
      const row = await this.prisma.prisma.quizz_question.update({
        where: { id },
        data: patch,
        include: {
          question_collection: {
            include: { ref_collection: true },
            orderBy: { id: 'asc' },
          },
        },
      });
      return {
        id: row.id,
        user_id: row.user_id,
        create_at: row.create_at,
        question: row.question,
        commentaire: row.commentaire ?? '',
        collections: row.question_collection.map((qc) => ({
          id: qc.ref_collection.id,
          nom: qc.ref_collection.nom,
        })),
      };
    } catch {
      throw new NotFoundException(`Question ${id} introuvable`);
    }
  }

  private async resolveImportUserId(userIdRaw: unknown): Promise<number> {
    if (userIdRaw === undefined || userIdRaw === null) {
      const first = await this.prisma.prisma.user.findFirst({
        orderBy: { id: 'asc' },
      });
      if (!first) {
        throw new BadRequestException(
          'Aucun utilisateur en base : indique "user_id" dans le JSON d’import.',
        );
      }
      return first.id;
    }
    let uid: number;
    if (typeof userIdRaw === 'number' && Number.isInteger(userIdRaw)) {
      uid = userIdRaw;
    } else if (
      typeof userIdRaw === 'string' &&
      /^\d+$/.test(userIdRaw.trim())
    ) {
      uid = Number(userIdRaw.trim());
    } else {
      throw new BadRequestException('user_id doit être un entier si fourni');
    }
    const u = await this.prisma.prisma.user.findUnique({
      where: { id: uid },
    });
    if (!u) throw new BadRequestException(`Utilisateur ${uid} introuvable`);
    return u.id;
  }

  private assertImportReponses(
    reponses: unknown,
  ): { texte: string; correcte: boolean }[] {
    if (!Array.isArray(reponses) || reponses.length !== 4) {
      throw new BadRequestException(
        'Chaque question doit avoir exactement 4 réponses dans "reponses".',
      );
    }
    const out: { texte: string; correcte: boolean }[] = [];
    let correctCount = 0;
    for (const r of reponses) {
      if (!r || typeof r !== 'object') {
        throw new BadRequestException('Réponse invalide dans le tableau.');
      }
      const o = r as Record<string, unknown>;
      const texte = o.texte ?? o.reponse;
      if (typeof texte !== 'string' || !texte.trim()) {
        throw new BadRequestException('Chaque réponse doit avoir "texte" (string non vide).');
      }
      const correcte = o.correcte === true || o.bonne_reponse === 1;
      if (correcte) correctCount += 1;
      out.push({ texte: texte.trim(), correcte: Boolean(correcte) });
    }
    if (correctCount !== 1) {
      throw new BadRequestException(
        'Chaque question doit avoir exactement une réponse correcte (correcte: true).',
      );
    }
    return out;
  }

  async importQuestionsFromLlmJson(body: unknown): Promise<{
    createdQuestions: number;
    createdCollections: number;
  }> {
    if (!body || typeof body !== 'object') {
      throw new BadRequestException('Corps JSON attendu (objet).');
    }
    const b = body as Record<string, unknown>;
    const userId = await this.resolveImportUserId(b.user_id);

    type QIn = {
      question: string;
      commentaire: string;
      reponses: { texte: string; correcte: boolean }[];
    };

    const parseQuestion = (raw: unknown, ctx: string): QIn => {
      if (!raw || typeof raw !== 'object') {
        throw new BadRequestException(`${ctx} : objet question attendu.`);
      }
      const q = raw as Record<string, unknown>;
      if (typeof q.question !== 'string' || !q.question.trim()) {
        throw new BadRequestException(`${ctx} : champ "question" (string) requis.`);
      }
      const commentaire =
        typeof q.commentaire === 'string' ? q.commentaire.trim() : '';
      const reponses = this.assertImportReponses(q.reponses);
      return {
        question: q.question.trim(),
        commentaire,
        reponses,
      };
    };

    const collectionsRaw = b.collections;
    const sansRaw = b.questions_sans_collection;

    if (
      (!collectionsRaw || !Array.isArray(collectionsRaw)) &&
      (!sansRaw || !Array.isArray(sansRaw))
    ) {
      throw new BadRequestException(
        'Fournis "collections" (tableau) et/ou "questions_sans_collection" (tableau).',
      );
    }

    let createdQuestions = 0;
    let createdCollections = 0;
    const t = nowIso();

    await this.prisma.prisma.$transaction(async (tx) => {
      const addQuestion = async (
        qin: QIn,
        collectionId: number | null,
      ): Promise<void> => {
        const qRow = await tx.quizz_question.create({
          data: {
            user_id: userId,
            create_at: t,
            question: qin.question,
            commentaire: qin.commentaire,
          },
        });
        for (const r of qin.reponses) {
          const rep = await tx.quizz_reponse.create({
            data: {
              reponse: r.texte,
              bonne_reponse: r.correcte ? 1 : 0,
            },
          });
          await tx.quizz_question_reponse.create({
            data: {
              question_id: qRow.id,
              reponse_id: rep.id,
            },
          });
        }
        if (collectionId != null) {
          await tx.question_collection.create({
            data: {
              collection_id: collectionId,
              question_id: qRow.id,
            },
          });
        }
        createdQuestions += 1;
      };

      if (Array.isArray(collectionsRaw)) {
        for (let i = 0; i < collectionsRaw.length; i++) {
          const block = collectionsRaw[i];
          if (!block || typeof block !== 'object') {
            throw new BadRequestException(`collections[${i}] : objet attendu.`);
          }
          const bl = block as Record<string, unknown>;
          if (typeof bl.nom !== 'string' || !bl.nom.trim()) {
            throw new BadRequestException(
              `collections[${i}] : "nom" (string) requis.`,
            );
          }
          const nom = bl.nom.trim();
          const questions = bl.questions;
          if (!Array.isArray(questions) || questions.length === 0) {
            throw new BadRequestException(
              `collections[${i}] : "questions" doit être un tableau non vide.`,
            );
          }

          let col = await tx.ref_collection.findFirst({
            where: { user_id: userId, nom },
          });
          if (!col) {
            col = await tx.ref_collection.create({
              data: {
                user_id: userId,
                create_at: t,
                update_at: t,
                nom,
              },
            });
            createdCollections += 1;
          }

          for (let j = 0; j < questions.length; j++) {
            const qin = parseQuestion(
              questions[j],
              `collections[${i}].questions[${j}]`,
            );
            await addQuestion(qin, col.id);
          }
        }
      }

      if (Array.isArray(sansRaw)) {
        for (let k = 0; k < sansRaw.length; k++) {
          const qin = parseQuestion(
            sansRaw[k],
            `questions_sans_collection[${k}]`,
          );
          await addQuestion(qin, null);
        }
      }
    });

    if (createdQuestions === 0) {
      throw new BadRequestException(
        'Aucune question importée : vérifie que tes tableaux ne sont pas vides.',
      );
    }

    return { createdQuestions, createdCollections };
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

  async lookupDevice(adresse_mac: string) {
    const mac = adresse_mac.trim();
    if (!mac) {
      throw new BadRequestException('Query "adresse_mac" (string) requise');
    }
    const device = await this.prisma.prisma.device.findFirst({
      where: { adresse_mac: mac },
    });
    if (!device) {
      return { known: false as const };
    }
    const link = await this.prisma.prisma.user_device.findFirst({
      where: { device_id: device.id },
      include: { user: true },
    });
    if (!link?.user) {
      return { known: false as const };
    }
    return {
      known: true as const,
      user: { id: link.user.id, pseudot: link.user.pseudot },
    };
  }

  async registerDevice(
    adresse_mac: string,
    pseudot: string,
  ): Promise<{ userId: number; pseudot: string }> {
    const mac = adresse_mac.trim();
    const pseudo = pseudot.trim();
    if (!mac) {
      throw new BadRequestException('Champ "adresse_mac" (string) requis');
    }
    if (!pseudo || pseudo.length > 120) {
      throw new BadRequestException(
        'Champ "pseudot" : string non vide, 120 caractères max',
      );
    }
    const existingDev = await this.prisma.prisma.device.findFirst({
      where: { adresse_mac: mac },
    });
    if (existingDev) {
      const link = await this.prisma.prisma.user_device.findFirst({
        where: { device_id: existingDev.id },
      });
      if (link) {
        throw new ConflictException(
          'Cet appareil est déjà associé à un compte.',
        );
      }
    }

    const row = await this.prisma.prisma.$transaction(async (tx) => {
      let deviceId: number;
      if (existingDev) {
        deviceId = existingDev.id;
      } else {
        const d = await tx.device.create({ data: { adresse_mac: mac } });
        deviceId = d.id;
      }
      const user = await tx.user.create({ data: { pseudot: pseudo } });
      await tx.user_device.create({
        data: { user_id: user.id, device_id: deviceId },
      });
      return { userId: user.id, pseudot: user.pseudot };
    });

    return row;
  }
}
