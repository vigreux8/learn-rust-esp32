import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { QuizzQuestionRow, SousCollectionUi } from '../../quizz.type';

function nowIso(): string {
  return new Date().toISOString();
}

@Injectable()
export class QuizzWriteService {
  constructor(private readonly prisma: PrismaService) {}

  /** Supprime une ligne `relation_question_implicite` par son id. */
  async deleteImplicitQuestionRelation(relationId: number): Promise<void> {
    const row = await this.prisma.prisma.relation_question_implicite.findUnique({
      where: { id: relationId },
    });
    if (!row) {
      throw new NotFoundException(`relation_question_implicite ${relationId} introuvable`);
    }
    await this.prisma.prisma.relation_question_implicite.delete({
      where: { id: relationId },
    });
  }

  async insertQuestionWithAnswers(
    tx: Prisma.TransactionClient,
    body: {
      user_id: number;
      categorie_id: number;
      question: string;
      commentaire: string;
      reponses: { texte: string; correcte: boolean }[];
      collection_id?: number;
      parent_question_id?: number;
      verifier?: boolean;
    },
  ): Promise<number> {
    const qRow = await tx.quizz_question.create({
      data: {
        user_id: body.user_id,
        categorie_p_id: body.categorie_id,
        create_at: nowIso(),
        question: body.question,
        commentaire: body.commentaire,
        verifier: body.verifier ?? false,
      },
    });
    for (const r of body.reponses) {
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
    if (body.collection_id != null) {
      await tx.question_collection.create({
        data: {
          collection_id: body.collection_id,
          question_id: qRow.id,
        },
      });
    }
    if (body.parent_question_id != null) {
      await tx.relation_question_implicite.create({
        data: {
          question_1_id: body.parent_question_id,
          question_2_id: qRow.id,
          story_id: null,
        },
      });
    }
    return qRow.id;
  }

  async updateReponse(
    id: number,
    data: { reponse: string },
  ): Promise<{ id: number; reponse: string; bonne_reponse: boolean }> {
    try {
      const row = await this.prisma.prisma.quizz_reponse.update({
        where: { id },
        data: { reponse: data.reponse },
      });
      return {
        id: row.id,
        reponse: row.reponse,
        bonne_reponse: row.bonne_reponse === 1,
      };
    } catch {
      throw new NotFoundException(`Réponse ${id} introuvable`);
    }
  }

  async updateQuestion(
    id: number,
    data: {
      question?: string;
      commentaire?: string;
      categorie_id?: number;
      categorie_e_id?: number | null;
      verifier?: boolean;
      importance_id?: number | null;
      difficulter_id?: number | null;
    },
  ): Promise<QuizzQuestionRow> {
    const existing = await this.prisma.prisma.quizz_question.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Question ${id} introuvable`);
    }

    const patch: {
      question?: string;
      commentaire?: string;
      categorie_p_id?: number;
      categorie_e_id?: number | null;
      verifier?: boolean;
      importance_id?: number | null;
      difficulter_id?: number | null;
    } = {};
    if (typeof data.question === 'string') patch.question = data.question;
    if (typeof data.commentaire === 'string') patch.commentaire = data.commentaire;
    if (typeof data.verifier === 'boolean') {
      patch.verifier = data.verifier;
    }

    if (typeof data.categorie_id === 'number' && Number.isInteger(data.categorie_id)) {
      const cat = await this.prisma.prisma.ref_p_categorie.findUnique({
        where: { id: data.categorie_id },
      });
      if (!cat) {
        throw new BadRequestException(`categorie_id ${data.categorie_id} introuvable`);
      }
      if (data.categorie_id !== existing.categorie_p_id) {
        patch.categorie_p_id = data.categorie_id;
      }
    }

    const resolvedParent =
      patch.categorie_p_id !== undefined ? patch.categorie_p_id : existing.categorie_p_id;
    const parentChanged = patch.categorie_p_id !== undefined;

    const assertLink = async (parentId: number, enfantId: number): Promise<void> => {
      const ok = await this.prisma.prisma.relation_categorie.findFirst({
        where: { p_categorie: parentId, e_categorie: enfantId },
      });
      if (!ok) {
        throw new BadRequestException(
          `categorie_e_id ${enfantId} incompatible avec la catégorie parente ${parentId}`,
        );
      }
    };

    if (data.categorie_e_id !== undefined) {
      if (data.categorie_e_id === null) {
        patch.categorie_e_id = null;
      } else {
        await assertLink(resolvedParent, data.categorie_e_id);
        patch.categorie_e_id = data.categorie_e_id;
      }
    } else if (parentChanged) {
      patch.categorie_e_id = null;
    } else if (
      existing.categorie_e_id != null &&
      data.categorie_id === undefined &&
      data.categorie_e_id === undefined
    ) {
      const stillOk = await this.prisma.prisma.relation_categorie.findFirst({
        where: { p_categorie: resolvedParent, e_categorie: existing.categorie_e_id },
      });
      if (!stillOk) {
        patch.categorie_e_id = null;
      }
    }

    if (data.importance_id !== undefined) {
      if (data.importance_id === null) {
        patch.importance_id = null;
      } else {
        const imp = await this.prisma.prisma.ref_importance.findUnique({
          where: { id: data.importance_id },
        });
        if (!imp) {
          throw new BadRequestException(`importance_id ${data.importance_id} introuvable`);
        }
        patch.importance_id = data.importance_id;
      }
    }

    if (data.difficulter_id !== undefined) {
      if (data.difficulter_id === null) {
        patch.difficulter_id = null;
      } else {
        const dif = await this.prisma.prisma.ref_difficulter.findUnique({
          where: { id: data.difficulter_id },
        });
        if (!dif) {
          throw new BadRequestException(`difficulter_id ${data.difficulter_id} introuvable`);
        }
        patch.difficulter_id = data.difficulter_id;
      }
    }

    if (Object.keys(patch).length === 0) {
      throw new BadRequestException(
        'Au moins un champ parmi question, commentaire, categorie_id, categorie_e_id, verifier, importance_id ou difficulter_id requis',
      );
    }
    try {
      const row = await this.prisma.prisma.quizz_question.update({
        where: { id },
        data: patch,
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
      const eid = row.categorie_e_id;
      const impId = row.importance_id;
      const difId = row.difficulter_id;
      return {
        id: row.id,
        user_id: row.user_id,
        create_at: row.create_at,
        question: row.question,
        commentaire: row.commentaire ?? '',
        verifier: row.verifier,
        categorie_id: row.categorie_p_id,
        categorie_type: row.ref_p_categorie.type,
        categorie_e_id: eid,
        categorie_e_type: eid != null && row.ref_e_categorie ? row.ref_e_categorie.type : null,
        importance_id: impId,
        importance_lvl: impId != null && row.ref_importance ? row.ref_importance.lvl : null,
        difficulter_id: difId,
        difficulter_lvl: difId != null && row.ref_difficulter ? row.ref_difficulter.lvl : null,
        collections: row.question_collection.map((qc) => ({
          id: qc.quizz_collection.id,
          nom: qc.quizz_collection.nom,
        })),
      };
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new NotFoundException(`Question ${id} introuvable`);
    }
  }

  async deleteQuestion(id: number): Promise<void> {
    const exists = await this.prisma.prisma.quizz_question.findUnique({
      where: { id },
    });
    if (!exists) throw new NotFoundException(`Question ${id} introuvable`);

    await this.prisma.prisma.$transaction([
      this.prisma.prisma.question_reflexion.deleteMany({
        where: { OR: [{ question_p_id: id }, { question_a_id: id }] },
      }),
      this.prisma.prisma.relation_question_implicite.deleteMany({
        where: { OR: [{ question_1_id: id }, { question_2_id: id }] },
      }),
      this.prisma.prisma.user_kpi.deleteMany({ where: { question_id: id } }),
      this.prisma.prisma.quizz_question_reponse.deleteMany({ where: { question_id: id } }),
      this.prisma.prisma.question_collection.deleteMany({ where: { question_id: id } }),
      this.prisma.prisma.quizz_question.delete({ where: { id } }),
    ]);
  }

  /**
   * Crée une question avec 4 réponses, optionnellement liée à une collection et/ou à une question parente (implicite).
   */
  async createQuestion(body: {
    user_id: number;
    categorie_id: number;
    question: string;
    commentaire: string;
    reponses: { texte: string; correcte: boolean }[];
    collection_id?: number;
    parent_question_id?: number;
  }): Promise<QuizzQuestionRow> {
    if (body.reponses.length !== 4) {
      throw new BadRequestException('Exactement 4 réponses sont requises');
    }
    const nCorrect = body.reponses.filter((r) => r.correcte).length;
    if (nCorrect !== 1) {
      throw new BadRequestException('Une seule réponse doit être marquée comme correcte');
    }
    for (const r of body.reponses) {
      if (typeof r.texte !== 'string' || r.texte.trim().length === 0) {
        throw new BadRequestException('Chaque réponse doit avoir un texte non vide');
      }
    }

    const user = await this.prisma.prisma.user.findUnique({
      where: { id: body.user_id },
    });
    if (!user) {
      throw new BadRequestException(`Utilisateur ${body.user_id} introuvable`);
    }
    const cat = await this.prisma.prisma.ref_p_categorie.findUnique({
      where: { id: body.categorie_id },
    });
    if (!cat) {
      throw new BadRequestException(`categorie_id ${body.categorie_id} introuvable`);
    }

    if (body.collection_id != null) {
      const col = await this.prisma.prisma.quizz_collection.findUnique({
        where: { id: body.collection_id },
      });
      if (!col) {
        throw new BadRequestException(`collection_id ${body.collection_id} introuvable`);
      }
    }

    if (body.parent_question_id != null) {
      const parent = await this.prisma.prisma.quizz_question.findUnique({
        where: { id: body.parent_question_id },
      });
      if (!parent) {
        throw new BadRequestException(
          `parent_question_id ${body.parent_question_id} introuvable`,
        );
      }
    }

    const row = await this.prisma.prisma.$transaction(async (tx) => {
      const questionId = await this.insertQuestionWithAnswers(tx, {
        user_id: body.user_id,
        categorie_id: body.categorie_id,
        question: body.question.trim(),
        commentaire: body.commentaire.trim(),
        reponses: body.reponses.map((r) => ({
          texte: r.texte.trim(),
          correcte: r.correcte,
        })),
        collection_id: body.collection_id,
        parent_question_id: body.parent_question_id,
        verifier: false,
      });
      return tx.quizz_question.findUniqueOrThrow({
        where: { id: questionId },
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
    });

    const eid = row.categorie_e_id;
    const impId = row.importance_id;
    const difId = row.difficulter_id;
    return {
      id: row.id,
      user_id: row.user_id,
      create_at: row.create_at,
      question: row.question,
      commentaire: row.commentaire ?? '',
      verifier: row.verifier,
      categorie_id: row.categorie_p_id,
      categorie_type: row.ref_p_categorie.type,
      categorie_e_id: eid,
      categorie_e_type: eid != null && row.ref_e_categorie ? row.ref_e_categorie.type : null,
      importance_id: impId,
      importance_lvl: impId != null && row.ref_importance ? row.ref_importance.lvl : null,
      difficulter_id: difId,
      difficulter_lvl: difId != null && row.ref_difficulter ? row.ref_difficulter.lvl : null,
      collections: row.question_collection.map((qc) => ({
        id: qc.quizz_collection.id,
        nom: qc.quizz_collection.nom,
      })),
    };
  }

  /**
   * Supprime une collection, ses liens supercollections, puis chaque question qui ne reste liée à aucune autre collection.
   */
  async deleteCollection(collectionId: number, userId: number): Promise<void> {
    const col = await this.prisma.prisma.quizz_collection.findUnique({
      where: { id: collectionId },
    });
    if (!col) {
      throw new NotFoundException(`Collection ${collectionId} introuvable`);
    }
    if (col.user_id !== userId) {
      throw new ForbiddenException(
        `La collection ${collectionId} n’appartient pas à l’utilisateur ${userId}.`,
      );
    }

    const links = await this.prisma.prisma.question_collection.findMany({
      where: { collection_id: collectionId },
      select: { question_id: true },
    });
    const questionIds = [...new Set(links.map((l) => l.question_id))];

    await this.prisma.prisma.$transaction(async (tx) => {
      await tx.personnalite_collection.deleteMany({
        where: {
          OR: [
            { collection_id: collectionId },
            { personalite: { collection_id: collectionId } },
          ],
        },
      });
      await tx.personalite.deleteMany({
        where: { collection_id: collectionId },
      });
      await tx.relation_collection.deleteMany({
        where: {
          OR: [{ p_collection: collectionId }, { e_collection: collectionId }],
        },
      });
      await tx.question_collection.deleteMany({
        where: { collection_id: collectionId },
      });
      await tx.quizz_module_collection.deleteMany({
        where: { collection_id: collectionId },
      });

      for (const qid of questionIds) {
        const remaining = await tx.question_collection.count({
          where: { question_id: qid },
        });
        if (remaining === 0) {
          await tx.question_reflexion.deleteMany({
            where: {
              OR: [{ question_p_id: qid }, { question_a_id: qid }],
            },
          });
          await tx.relation_question_implicite.deleteMany({
            where: {
              OR: [{ question_1_id: qid }, { question_2_id: qid }],
            },
          });
          await tx.user_kpi.deleteMany({ where: { question_id: qid } });
          await tx.quizz_question_reponse.deleteMany({
            where: { question_id: qid },
          });
          await tx.quizz_question.delete({ where: { id: qid } });
        }
      }

      await tx.quizz_collection.delete({ where: { id: collectionId } });
    });
  }

  private async findParentIdForChildCollection(childId: number): Promise<number | null> {
    const rel = await this.prisma.prisma.relation_collection.findFirst({
      where: { e_collection: childId },
      select: { p_collection: true },
    });
    return rel?.p_collection ?? null;
  }

  /**
   * Crée une `quizz_collection` enfant et une ligne `relation-collection` vers le parent.
   */
  async createChildSousCollection(
    parentId: number,
    body: { user_id: number; nom: string; description: string },
  ): Promise<SousCollectionUi> {
    const parent = await this.prisma.prisma.quizz_collection.findUnique({
      where: { id: parentId },
    });
    if (!parent) {
      throw new NotFoundException(`Collection parent ${parentId} introuvable`);
    }
    if (parent.user_id !== body.user_id) {
      throw new ForbiddenException(
        `La collection ${parentId} n’appartient pas à l’utilisateur ${body.user_id}.`,
      );
    }
    const t = nowIso();
    const child = await this.prisma.prisma.$transaction(async (tx) => {
      const c = await tx.quizz_collection.create({
        data: {
          user_id: body.user_id,
          create_at: t,
          update_at: t,
          nom: body.nom.trim(),
          description: body.description.trim() === '' ? null : body.description.trim(),
        },
      });
      await tx.relation_collection.create({
        data: { p_collection: parentId, e_collection: c.id },
      });
      await tx.quizz_collection.update({
        where: { id: parentId },
        data: { update_at: t },
      });
      return c;
    });
    return {
      id: child.id,
      collection_id: parentId,
      nom: child.nom,
      description: child.description ?? '',
      questions: [],
    };
  }

  async updateChildSousCollection(
    childId: number,
    body: { user_id: number; nom: string; description: string },
  ): Promise<SousCollectionUi> {
    const parentId = await this.findParentIdForChildCollection(childId);
    if (parentId == null) {
      throw new BadRequestException(
        `La collection ${childId} n’est pas une collection enfant (aucun lien parent).`,
      );
    }
    const child = await this.prisma.prisma.quizz_collection.findUnique({
      where: { id: childId },
    });
    if (!child) {
      throw new NotFoundException(`Collection ${childId} introuvable`);
    }
    if (child.user_id !== body.user_id) {
      throw new ForbiddenException(
        `La collection ${childId} n’appartient pas à l’utilisateur ${body.user_id}.`,
      );
    }
    const t = nowIso();
    const updated = await this.prisma.prisma.$transaction(async (tx) => {
      const u = await tx.quizz_collection.update({
        where: { id: childId },
        data: {
          nom: body.nom.trim(),
          description: body.description.trim() === '' ? null : body.description.trim(),
          update_at: t,
        },
      });
      await tx.quizz_collection.update({
        where: { id: parentId },
        data: { update_at: t },
      });
      return u;
    });
    const qcs = await this.prisma.prisma.question_collection.findMany({
      where: { collection_id: childId },
      orderBy: { id: 'asc' },
      include: {
        quizz_question: { include: { ref_p_categorie: true } },
      },
    });
    return {
      id: updated.id,
      collection_id: parentId,
      nom: updated.nom,
      description: updated.description ?? '',
      questions: qcs.map((qc) => ({
        relation_id: qc.id,
        question_id: qc.question_id,
        question: qc.quizz_question.question,
        categorie_type: qc.quizz_question.ref_p_categorie.type,
      })),
    };
  }

  /**
   * Supprime le lien parent → enfant, les rattachements questions de l’enfant, puis la collection enfant.
   * Les questions restent liées au parent si elles y étaient encore.
   */
  async deleteChildSousCollection(childId: number, userId: number): Promise<void> {
    const parentId = await this.findParentIdForChildCollection(childId);
    if (parentId == null) {
      throw new BadRequestException(
        `La collection ${childId} n’est pas une collection enfant (aucun lien parent).`,
      );
    }
    const child = await this.prisma.prisma.quizz_collection.findUnique({
      where: { id: childId },
    });
    if (!child) {
      throw new NotFoundException(`Collection ${childId} introuvable`);
    }
    if (child.user_id !== userId) {
      throw new ForbiddenException(
        `La collection ${childId} n’appartient pas à l’utilisateur ${userId}.`,
      );
    }
    const t = nowIso();
    await this.prisma.prisma.$transaction(async (tx) => {
      await tx.relation_collection.deleteMany({
        where: { e_collection: childId },
      });
      await tx.personnalite_collection.deleteMany({
        where: { collection_id: childId },
      });
      await tx.personalite.deleteMany({
        where: { collection_id: childId },
      });
      await tx.question_collection.deleteMany({
        where: { collection_id: childId },
      });
      await tx.quizz_module_collection.deleteMany({
        where: { collection_id: childId },
      });
      await tx.quizz_collection.delete({ where: { id: childId } });
      await tx.quizz_collection.update({
        where: { id: parentId },
        data: { update_at: t },
      });
    });
  }

  async attachQuestionToChildCollection(
    childId: number,
    body: { user_id: number; question_id: number },
  ): Promise<void> {
    const parentId = await this.findParentIdForChildCollection(childId);
    if (parentId == null) {
      throw new BadRequestException(
        `La collection ${childId} n’est pas une collection enfant (aucun lien parent).`,
      );
    }
    const parent = await this.prisma.prisma.quizz_collection.findUnique({
      where: { id: parentId },
    });
    if (!parent || parent.user_id !== body.user_id) {
      throw new ForbiddenException(
        `Accès refusé pour rattacher une question à la collection ${childId}.`,
      );
    }
    const inParent = await this.prisma.prisma.question_collection.findFirst({
      where: { collection_id: parentId, question_id: body.question_id },
    });
    if (!inParent) {
      throw new BadRequestException(
        `La question ${body.question_id} doit d’abord être liée à la collection parent ${parentId}.`,
      );
    }
    const exists = await this.prisma.prisma.question_collection.findFirst({
      where: { collection_id: childId, question_id: body.question_id },
    });
    if (exists) {
      return;
    }
    const t = nowIso();
    await this.prisma.prisma.$transaction([
      this.prisma.prisma.question_collection.create({
        data: { collection_id: childId, question_id: body.question_id },
      }),
      this.prisma.prisma.quizz_collection.update({
        where: { id: parentId },
        data: { update_at: t },
      }),
      this.prisma.prisma.quizz_collection.update({
        where: { id: childId },
        data: { update_at: t },
      }),
    ]);
  }

  async detachQuestionFromChildCollection(
    childId: number,
    questionId: number,
    userId: number,
  ): Promise<void> {
    const parentId = await this.findParentIdForChildCollection(childId);
    if (parentId == null) {
      throw new BadRequestException(
        `La collection ${childId} n’est pas une collection enfant (aucun lien parent).`,
      );
    }
    const parent = await this.prisma.prisma.quizz_collection.findUnique({
      where: { id: parentId },
    });
    if (!parent || parent.user_id !== userId) {
      throw new ForbiddenException(
        `Accès refusé pour retirer une question de la collection ${childId}.`,
      );
    }
    const t = nowIso();
    await this.prisma.prisma.$transaction([
      this.prisma.prisma.question_collection.deleteMany({
        where: { collection_id: childId, question_id: questionId },
      }),
      this.prisma.prisma.quizz_collection.update({
        where: { id: parentId },
        data: { update_at: t },
      }),
      this.prisma.prisma.quizz_collection.update({
        where: { id: childId },
        data: { update_at: t },
      }),
    ]);
  }

  /**
   * Crée une collection dont le nom est « Prénom Nom » et la fiche `personalite` associée.
   */
  async createPersonaliteCollection(body: {
    userId: number;
    nom: string;
    prenom: string;
    naissance: number;
    mort?: number | null;
    resumer: string;
    moduleId?: number;
  }): Promise<{ collectionId: number; personaliteId: number }> {
    const user = await this.prisma.prisma.user.findUnique({
      where: { id: body.userId },
    });
    if (!user) {
      throw new NotFoundException(`Utilisateur ${body.userId} introuvable`);
    }
    if (body.moduleId != null) {
      const mod = await this.prisma.prisma.quizz_module.findUnique({
        where: { id: body.moduleId },
      });
      if (!mod) {
        throw new NotFoundException(`Module ${body.moduleId} introuvable`);
      }
    }
    const colNom = `${body.prenom.trim()} ${body.nom.trim()}`.trim();
    if (!colNom) {
      throw new BadRequestException('Le nom complet (prénom + nom) ne peut pas être vide');
    }
    if (body.mort != null && body.mort < body.naissance) {
      throw new BadRequestException(
        "L'année de décès ne peut pas être antérieure à l'année de naissance.",
      );
    }
    const t = nowIso();
    const res = await this.prisma.prisma.$transaction(async (tx) => {
      const c = await tx.quizz_collection.create({
        data: {
          user_id: body.userId,
          create_at: t,
          update_at: t,
          nom: colNom,
        },
      });
      const p = await tx.personalite.create({
        data: {
          collection_id: c.id,
          nom: body.nom.trim(),
          prenom: body.prenom.trim(),
          naissance: body.naissance,
          mort: body.mort != null ? body.mort : null,
          resumer: body.resumer.trim() !== '' ? body.resumer.trim() : '—',
        },
      });
      if (body.moduleId != null) {
        await tx.quizz_module_collection.create({
          data: { module_id: body.moduleId, collection_id: c.id },
        });
      }
      return { collectionId: c.id, personaliteId: p.id };
    });
    return res;
  }

  async assignPersonaliteToCollection(
    collectionId: number,
    body: {
      userId: number;
      personaliteId: number;
      importanceType?: string | null;
    },
  ): Promise<void> {
    const col = await this.prisma.prisma.quizz_collection.findUnique({
      where: { id: collectionId },
    });
    if (!col) {
      throw new NotFoundException(`Collection ${collectionId} introuvable`);
    }
    if (col.user_id !== body.userId) {
      throw new ForbiddenException(
        `La collection ${collectionId} n’appartient pas à l’utilisateur ${body.userId}.`,
      );
    }
    const perso = await this.prisma.prisma.personalite.findUnique({
      where: { id: body.personaliteId },
    });
    if (!perso) {
      throw new NotFoundException(`Personnalité ${body.personaliteId} introuvable`);
    }
    if (perso.collection_id === collectionId) {
      throw new BadRequestException(
        'Cette collection est déjà la fiche principale de cette personnalité.',
      );
    }
    const dup = await this.prisma.prisma.personnalite_collection.findFirst({
      where: { collection_id: collectionId, personalite_id: body.personaliteId },
    });
    if (dup != null) {
      throw new BadRequestException(
        'Cette personnalité est déjà associée à cette collection.',
      );
    }
    let importance_id: number | null = null;
    const it = body.importanceType?.trim();
    if (it != null && it !== '') {
      const ref = await this.prisma.prisma.ref_importance_personalite.findFirst({
        where: { type: it },
      });
      if (!ref) {
        throw new BadRequestException(`Type d’importance inconnu : « ${it} »`);
      }
      importance_id = ref.id;
    }
    const t = nowIso();
    await this.prisma.prisma.personnalite_collection.create({
      data: {
        personalite_id: body.personaliteId,
        collection_id: collectionId,
        importance_id,
      },
    });
    await this.prisma.prisma.quizz_collection.update({
      where: { id: collectionId },
      data: { update_at: t },
    });
  }

  async unassignPersonaliteFromCollection(
    collectionId: number,
    personaliteId: number,
    userId: number,
  ): Promise<void> {
    const col = await this.prisma.prisma.quizz_collection.findUnique({
      where: { id: collectionId },
    });
    if (!col) {
      throw new NotFoundException(`Collection ${collectionId} introuvable`);
    }
    if (col.user_id !== userId) {
      throw new ForbiddenException(
        `La collection ${collectionId} n’appartient pas à l’utilisateur ${userId}.`,
      );
    }
    const rm = await this.prisma.prisma.personnalite_collection.deleteMany({
      where: { collection_id: collectionId, personalite_id: personaliteId },
    });
    if (rm.count === 0) {
      throw new NotFoundException('Association personnalité / collection introuvable');
    }
    await this.prisma.prisma.quizz_collection.update({
      where: { id: collectionId },
      data: { update_at: nowIso() },
    });
  }
}
