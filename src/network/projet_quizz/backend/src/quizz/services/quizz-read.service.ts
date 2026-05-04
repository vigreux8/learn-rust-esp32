import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CollectionPersonnaliteRef,
  CollectionUi,
  PersonalitePickerRowDto,
  QuestionUi,
  QuizzQuestionDetail,
  QuizzQuestionRow,
  RefCategorieHierarchyRow,
  RefCategorieRow,
  RefImportancePersonaliteDto,
  RefQuestionScaleRow,
  SousCollectionUi,
} from '../quizz.type';

export type QuizPlayOrder =
  | 'random'
  | 'linear'
  | 'jamais_repondu'
  | 'mal_repondu_filtre'
  | 'recent'
  | 'ancien'
  | 'mal_repondu';

export type QuizPlaySessionOpts = {
  /** Modes appliqués dans l’ordre (ex. `ancien` puis `mal_repondu`). */
  orders: QuizPlayOrder[];
  /** Présent pour le tirage « toutes collections » (`GET /quizz/random`). */
  qtype?: 'histoire' | 'pratique' | 'connaissance' | 'melanger';
  userId?: number;
  limit?: number;
  excludeIds: number[];
  /** Collection enfant : ne retourne que les questions aussi liées à cette enfant (`question_collection`). */
  sousCollectionId?: number;
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

  private async buildCollectionHierarchyExtras(
    collectionId: number,
  ): Promise<{
    parent_collection_id: number | null;
    personnalites: CollectionPersonnaliteRef[];
  }> {
    const [parentLink, directPersos, pcRows] = await Promise.all([
      this.prisma.prisma.relation_collection.findFirst({
        where: { e_collection: collectionId },
        select: { p_collection: true },
      }),
      this.prisma.prisma.personalite.findMany({
        where: { collection_id: collectionId },
        select: { id: true, nom: true, prenom: true },
      }),
      this.prisma.prisma.personnalite_collection.findMany({
        where: { collection_id: collectionId },
        include: {
          personalite: { select: { id: true, nom: true, prenom: true, collection_id: true } },
          ref_importance_personalite: { select: { type: true } },
        },
      }),
    ]);
    const byPersoId = new Map<number, CollectionPersonnaliteRef>();
    for (const p of directPersos) {
      byPersoId.set(p.id, {
        id: p.id,
        nom: p.nom,
        prenom: p.prenom,
        importance_type: null,
        detachable: false,
        fiche_collection_id: collectionId,
      });
    }
    for (const row of pcRows) {
      const imp = row.ref_importance_personalite?.type ?? null;
      const prev = byPersoId.get(row.personalite.id);
      const ficheId = row.personalite.collection_id;
      if (prev) {
        prev.importance_type = prev.importance_type ?? imp;
        prev.detachable = true;
      } else {
        byPersoId.set(row.personalite.id, {
          id: row.personalite.id,
          nom: row.personalite.nom,
          prenom: row.personalite.prenom,
          importance_type: imp,
          detachable: true,
          fiche_collection_id: ficheId,
        });
      }
    }
    return {
      parent_collection_id: parentLink?.p_collection ?? null,
      personnalites: [...byPersoId.values()].sort((a, b) => a.id - b.id),
    };
  }

  private scaleFieldsFromQuestion(q: {
    importance_id: number | null;
    difficulter_id: number | null;
    ref_importance: { lvl: string } | null;
    ref_difficulter: { lvl: string } | null;
  }): Pick<
    QuestionUi,
    'importance_id' | 'importance_lvl' | 'difficulter_id' | 'difficulter_lvl'
  > {
    return {
      importance_id: q.importance_id,
      importance_lvl: q.importance_id != null && q.ref_importance ? q.ref_importance.lvl : null,
      difficulter_id: q.difficulter_id,
      difficulter_lvl: q.difficulter_id != null && q.ref_difficulter ? q.ref_difficulter.lvl : null,
    };
  }

  private mapQuestionToUi(q: {
    id: number;
    user_id: number;
    create_at: string;
    question: string;
    commentaire: string;
    verifier: boolean;
    categorie_p_id: number;
    categorie_e_id: number | null;
    importance_id: number | null;
    difficulter_id: number | null;
    ref_p_categorie: { type: string };
    ref_e_categorie: { type: string } | null;
    ref_importance: { lvl: string } | null;
    ref_difficulter: { lvl: string } | null;
    quizz_question_reponse: {
      id: number;
      quizz_reponse: { id: number; reponse: string; bonne_reponse: number };
    }[];
  }): QuestionUi {
    const ordered = [...q.quizz_question_reponse].sort((a, b) => a.id - b.id);
    const eid = q.categorie_e_id;
    return {
      id: q.id,
      user_id: q.user_id,
      create_at: q.create_at,
      question: q.question,
      commentaire: q.commentaire ?? '',
      verifier: q.verifier,
      categorie_id: q.categorie_p_id,
      categorie_type: q.ref_p_categorie.type,
      categorie_e_id: eid,
      categorie_e_type: eid != null && q.ref_e_categorie ? q.ref_e_categorie.type : null,
      ...this.scaleFieldsFromQuestion(q),
      reponses: ordered.map((j) => ({
        id: j.quizz_reponse.id,
        reponse: j.quizz_reponse.reponse,
        bonne_reponse: j.quizz_reponse.bonne_reponse === 1,
      })),
    };
  }

  async buildCollectionUi(
    collectionId: number,
    qtype: 'histoire' | 'pratique' | 'connaissance' | 'melanger' = 'melanger',
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
            ref_p_categorie: true,
            ref_e_categorie: true,
            ref_importance: true,
            ref_difficulter: true,
            quizz_question_reponse: {
              include: { quizz_reponse: true },
            },
          },
        },
      },
    });

    const question_counts_by_type = { histoire: 0, pratique: 0, connaissance: 0 };
    for (const qc of qcs) {
      const t = qc.quizz_question.ref_p_categorie.type;
      if (t === 'histoire') question_counts_by_type.histoire += 1;
      else if (t === 'pratique') question_counts_by_type.pratique += 1;
      else if (t === 'connaissance') question_counts_by_type.connaissance += 1;
    }

    const filtered =
      qtype === 'melanger'
        ? qcs
        : qcs.filter((qc) => qc.quizz_question.ref_p_categorie.type === qtype);

    const questions = filtered.map((qc) => this.mapQuestionToUi(qc.quizz_question));

    const modules = col.quizz_module_collection.map((mc) => ({
      id: mc.quizz_module.id,
      nom: mc.quizz_module.nom,
    }));

    const childLinks = await this.prisma.prisma.relation_collection.findMany({
      where: { p_collection: collectionId },
      orderBy: { id: 'asc' },
      include: { child_quizz: { select: { id: true, nom: true } } },
    });
    const sous_collections = childLinks.map((r) => ({
      id: r.e_collection,
      nom: r.child_quizz.nom,
    }));

    const { parent_collection_id, personnalites } =
      await this.buildCollectionHierarchyExtras(collectionId);

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
      sous_collections,
      parent_collection_id,
      personnalites,
    };
  }

  async listCollections(): Promise<CollectionUi[]> {
    const [cols, fichesPerso] = await Promise.all([
      this.prisma.prisma.quizz_collection.findMany({
        orderBy: { id: 'asc' },
      }),
      this.prisma.prisma.personalite.findMany({
        select: { collection_id: true },
      }),
    ]);
    /** Collections « hébergeant » une fiche personnalité : pas de carte dans la grille (elles restent joignables par URL et picker). */
    const sansCarteListe = new Set(fichesPerso.map((p) => p.collection_id));

    const out: CollectionUi[] = [];
    for (const c of cols) {
      if (sansCarteListe.has(c.id)) continue;
      const ui = await this.buildCollectionUi(c.id);
      if (ui) out.push(ui);
    }
    return out;
  }

  async getCollection(
    collectionId: number,
    qtype: 'histoire' | 'pratique' | 'connaissance' | 'melanger' = 'melanger',
    play?: QuizPlaySessionOpts,
  ): Promise<CollectionUi> {
    let ui = await this.buildCollectionUi(collectionId, qtype);
    if (!ui) {
      throw new NotFoundException(`Collection ${collectionId} introuvable`);
    }
    if (play?.sousCollectionId != null) {
      const link = await this.prisma.prisma.relation_collection.findFirst({
        where: {
          p_collection: collectionId,
          e_collection: play.sousCollectionId,
        },
      });
      if (!link) {
        throw new NotFoundException(
          `La collection enfant ${play.sousCollectionId} n’est pas liée au parent ${collectionId}.`,
        );
      }
      const childQcs = await this.prisma.prisma.question_collection.findMany({
        where: { collection_id: play.sousCollectionId },
        select: { question_id: true },
      });
      const inChild = new Set(childQcs.map((r) => r.question_id));
      ui = { ...ui, questions: ui.questions.filter((q) => inChild.has(q.id)) };
    }
    /** Hors session de jeu : l’UI (sous-collections, édition) doit pouvoir charger une collection vide. */
    if (play == null) {
      return ui;
    }
    if (ui.questions.length === 0) {
      throw new NotFoundException(
        qtype !== 'melanger'
          ? `Aucune question de type « ${qtype} » dans la collection ${collectionId}.`
          : `Collection ${collectionId} introuvable ou vide`,
      );
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
      case 'mal_repondu_filtre': {
        if (userId === undefined) {
          throw new BadRequestException('userId requis pour mal_repondu_filtre');
        }
        const ids = copy.map((q) => q.id);
        const stats = await this.kpiGoodBadCounts(userId, ids);
        return copy.filter((q) => (stats.get(q.id)?.bad ?? 0) > 0);
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
        : { ref_p_categorie: { type: qtype } };
    const rows = await this.prisma.prisma.quizz_question.findMany({
      where: {
        ...where,
        quizz_question_reponse: { some: {} },
      },
      orderBy: { id: 'asc' },
      include: {
        ref_p_categorie: true,
        ref_e_categorie: true,
        ref_importance: true,
        ref_difficulter: true,
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
    return this.prisma.prisma.ref_p_categorie.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, type: true },
    });
  }

  async listRefImportanceQuestions(): Promise<RefQuestionScaleRow[]> {
    return this.prisma.prisma.ref_importance.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, lvl: true },
    });
  }

  async listRefDifficulteQuestions(): Promise<RefQuestionScaleRow[]> {
    return this.prisma.prisma.ref_difficulter.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, lvl: true },
    });
  }

  async listRefCategoriesHierarchy(): Promise<RefCategorieHierarchyRow[]> {
    const parents = await this.prisma.prisma.ref_p_categorie.findMany({
      orderBy: { id: 'asc' },
      include: {
        relation_categorie_parent: {
          include: { enfant: true },
          orderBy: { e_categorie: 'asc' },
        },
      },
    });
    return parents.map((p) => ({
      id: p.id,
      type: p.type,
      enfants: p.relation_categorie_parent.map((rel) => ({
        id: rel.enfant.id,
        type: rel.enfant.type,
      })),
    }));
  }

  async getQuestionDetail(id: number): Promise<QuizzQuestionDetail> {
    const r = await this.prisma.prisma.quizz_question.findUnique({
      where: { id },
      include: {
        ref_p_categorie: true,
        ref_e_categorie: true,
        ref_importance: true,
        ref_difficulter: true,
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
    const eid = r.categorie_e_id;
    return {
      id: r.id,
      user_id: r.user_id,
      create_at: r.create_at,
      question: r.question,
      commentaire: r.commentaire ?? '',
      verifier: r.verifier,
      categorie_id: r.categorie_p_id,
      categorie_type: r.ref_p_categorie.type,
      categorie_e_id: eid,
      categorie_e_type: eid != null && r.ref_e_categorie ? r.ref_e_categorie.type : null,
      ...this.scaleFieldsFromQuestion(r),
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
        ref_p_categorie: true,
        ref_e_categorie: true,
        ref_importance: true,
        ref_difficulter: true,
        question_collection: {
          include: { quizz_collection: true },
          orderBy: { id: 'asc' },
        },
      },
    });

    return rows.map((r) => {
      const eid = r.categorie_e_id;
      return {
      id: r.id,
      user_id: r.user_id,
      create_at: r.create_at,
      question: r.question,
      commentaire: r.commentaire ?? '',
      verifier: r.verifier,
      categorie_id: r.categorie_p_id,
      categorie_type: r.ref_p_categorie.type,
      categorie_e_id: eid,
      categorie_e_type: eid != null && r.ref_e_categorie ? r.ref_e_categorie.type : null,
      ...this.scaleFieldsFromQuestion(r),
      collections: r.question_collection.map((qc) => ({
        id: qc.quizz_collection.id,
        nom: qc.quizz_collection.nom,
      })),
      };
    });
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

  /** Détail des collections enfants (schéma v4) pour l’UI « sous-collections ». */
  async listSousCollectionsForParent(parentId: number): Promise<SousCollectionUi[]> {
    const rels = await this.prisma.prisma.relation_collection.findMany({
      where: { p_collection: parentId },
      orderBy: { id: 'asc' },
      include: { child_quizz: true },
    });
    const out: SousCollectionUi[] = [];
    for (const rel of rels) {
      const childId = rel.e_collection;
      const qcs = await this.prisma.prisma.question_collection.findMany({
        where: { collection_id: childId },
        orderBy: { id: 'asc' },
        include: {
          quizz_question: { include: { ref_p_categorie: true } },
        },
      });
      out.push({
        id: childId,
        collection_id: parentId,
        nom: rel.child_quizz.nom,
        description: rel.child_quizz.description ?? '',
        questions: qcs.map((qc) => ({
          relation_id: qc.id,
          question_id: qc.question_id,
          question: qc.quizz_question.question,
          categorie_type: qc.quizz_question.ref_p_categorie.type,
        })),
      });
    }
    return out;
  }

  async listRefImportancePersonalite(): Promise<RefImportancePersonaliteDto[]> {
    const rows = await this.prisma.prisma.ref_importance_personalite.findMany({
      orderBy: { id: 'asc' },
    });
    return rows.map((r) => ({ id: r.id, type: r.type }));
  }

  async listPersonalitesPicker(): Promise<PersonalitePickerRowDto[]> {
    const rows = await this.prisma.prisma.personalite.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, nom: true, prenom: true, collection_id: true },
    });
    return rows.map((r) => ({
      id: r.id,
      nom: r.nom,
      prenom: r.prenom,
      collection_id: r.collection_id,
    }));
  }
}
