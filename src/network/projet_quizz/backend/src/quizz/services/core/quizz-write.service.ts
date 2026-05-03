import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { QuizzQuestionRow, SousCollectionUi } from '../../quizz.type';

function nowIso(): string {
  return new Date().toISOString();
}

@Injectable()
export class QuizzWriteService {
  constructor(private readonly prisma: PrismaService) {}

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
        categorie_id: body.categorie_id,
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
          question_p_id: body.parent_question_id,
          question_e_id: qRow.id,
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
      verifier?: boolean;
    },
  ): Promise<QuizzQuestionRow> {
    const patch: {
      question?: string;
      commentaire?: string;
      categorie_id?: number;
      verifier?: boolean;
    } = {};
    if (typeof data.question === 'string') patch.question = data.question;
    if (typeof data.commentaire === 'string') patch.commentaire = data.commentaire;
    if (typeof data.categorie_id === 'number' && Number.isInteger(data.categorie_id)) {
      const cat = await this.prisma.prisma.ref_categorie.findUnique({
        where: { id: data.categorie_id },
      });
      if (!cat) {
        throw new BadRequestException(`categorie_id ${data.categorie_id} introuvable`);
      }
      patch.categorie_id = data.categorie_id;
    }
    if (typeof data.verifier === 'boolean') {
      patch.verifier = data.verifier;
    }
    if (Object.keys(patch).length === 0) {
      throw new BadRequestException(
        'Au moins un champ parmi "question", "commentaire" (string), "categorie_id" (entier) ou "verifier" (booléen) requis',
      );
    }
    try {
      const row = await this.prisma.prisma.quizz_question.update({
        where: { id },
        data: patch,
        include: {
          ref_categorie: true,
          question_collection: {
            include: { quizz_collection: true },
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
        verifier: row.verifier,
        categorie_id: row.categorie_id,
        categorie_type: row.ref_categorie.type,
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
      this.prisma.prisma.relation_question_implicite.deleteMany({
        where: { OR: [{ question_p_id: id }, { question_e_id: id }] },
      }),
      this.prisma.prisma.user_kpi.deleteMany({ where: { question_id: id } }),
      this.prisma.prisma.relation_sous_collections.deleteMany({ where: { question_id: id } }),
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
    const cat = await this.prisma.prisma.ref_categorie.findUnique({
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
          ref_categorie: true,
          question_collection: {
            include: { quizz_collection: true },
            orderBy: { id: 'asc' },
          },
        },
      });
    });

    return {
      id: row.id,
      user_id: row.user_id,
      create_at: row.create_at,
      question: row.question,
      commentaire: row.commentaire ?? '',
      verifier: row.verifier,
      categorie_id: row.categorie_id,
      categorie_type: row.ref_categorie.type,
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
      await tx.question_collection.deleteMany({
        where: { collection_id: collectionId },
      });
      await tx.relation_sous_collections.deleteMany({
        where: { question_id: { in: questionIds } },
      });
      await tx.sous_collections.deleteMany({
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

  async createSousCollection(
    collectionId: number,
    body: { user_id: number; nom: string; description: string },
  ): Promise<SousCollectionUi> {
    const col = await this.prisma.prisma.quizz_collection.findUnique({
      where: { id: collectionId },
    });
    if (!col) {
      throw new NotFoundException(`Collection ${collectionId} introuvable`);
    }
    if (col.user_id !== body.user_id) {
      throw new ForbiddenException(
        `La collection ${collectionId} n’appartient pas à l’utilisateur ${body.user_id}.`,
      );
    }

    const row = await this.prisma.prisma.sous_collections.create({
      data: {
        collection_id: collectionId,
        nom: body.nom.trim(),
        description: body.description.trim(),
      },
    });

    return {
      id: row.id,
      collection_id: row.collection_id,
      nom: row.nom,
      description: row.description ?? '',
      questions: [],
    };
  }

  async updateSousCollection(
    sousCollectionId: number,
    body: { user_id: number; nom: string; description: string },
  ): Promise<SousCollectionUi> {
    const sc = await this.prisma.prisma.sous_collections.findUnique({
      where: { id: sousCollectionId },
      include: { quizz_collection: true },
    });
    if (!sc) {
      throw new NotFoundException(`Sous-collection ${sousCollectionId} introuvable`);
    }
    if (sc.quizz_collection.user_id !== body.user_id) {
      throw new ForbiddenException(
        `La sous-collection ${sousCollectionId} n’appartient pas à l’utilisateur ${body.user_id}.`,
      );
    }

    const t = nowIso();
    const row = await this.prisma.prisma.sous_collections.update({
      where: { id: sousCollectionId },
      data: {
        nom: body.nom.trim(),
        description: body.description.trim(),
      },
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

    await this.prisma.prisma.quizz_collection.update({
      where: { id: row.collection_id },
      data: { update_at: t },
    });

    return {
      id: row.id,
      collection_id: row.collection_id,
      nom: row.nom,
      description: row.description ?? '',
      questions: row.relation_sous_collections.map((rel) => ({
        relation_id: rel.id,
        question_id: rel.quizz_question.id,
        question: rel.quizz_question.question,
        categorie_type: rel.quizz_question.ref_categorie.type,
      })),
    };
  }

  async deleteSousCollection(sousCollectionId: number, userId: number): Promise<void> {
    const sc = await this.prisma.prisma.sous_collections.findUnique({
      where: { id: sousCollectionId },
      include: { quizz_collection: true },
    });
    if (!sc) {
      throw new NotFoundException(`Sous-collection ${sousCollectionId} introuvable`);
    }
    if (sc.quizz_collection.user_id !== userId) {
      throw new ForbiddenException(
        `La sous-collection ${sousCollectionId} n’appartient pas à l’utilisateur ${userId}.`,
      );
    }

    await this.prisma.prisma.$transaction([
      this.prisma.prisma.relation_sous_collections.deleteMany({
        where: { sous_collection_id: sousCollectionId },
      }),
      this.prisma.prisma.sous_collections.delete({
        where: { id: sousCollectionId },
      }),
    ]);
  }

  async attachQuestionToSousCollection(
    sousCollectionId: number,
    body: { user_id: number; question_id: number },
  ): Promise<void> {
    const sc = await this.prisma.prisma.sous_collections.findUnique({
      where: { id: sousCollectionId },
      include: { quizz_collection: true },
    });
    if (!sc) {
      throw new NotFoundException(`Sous-collection ${sousCollectionId} introuvable`);
    }
    if (sc.quizz_collection.user_id !== body.user_id) {
      throw new ForbiddenException(
        `La sous-collection ${sousCollectionId} n’appartient pas à l’utilisateur ${body.user_id}.`,
      );
    }

    const inCollection = await this.prisma.prisma.question_collection.findFirst({
      where: {
        collection_id: sc.collection_id,
        question_id: body.question_id,
      },
    });
    if (!inCollection) {
      throw new BadRequestException(
        'La question doit être liée à la collection avant d’être ajoutée à une sous-collection.',
      );
    }

    try {
      await this.prisma.prisma.relation_sous_collections.create({
        data: {
          sous_collection_id: sousCollectionId,
          question_id: body.question_id,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new BadRequestException(
          'Cette question est déjà présente dans cette sous-collection.',
        );
      }
      throw e;
    }
  }

  async detachQuestionFromSousCollection(
    sousCollectionId: number,
    userId: number,
    questionId: number,
  ): Promise<void> {
    const sc = await this.prisma.prisma.sous_collections.findUnique({
      where: { id: sousCollectionId },
      include: { quizz_collection: true },
    });
    if (!sc) {
      throw new NotFoundException(`Sous-collection ${sousCollectionId} introuvable`);
    }
    if (sc.quizz_collection.user_id !== userId) {
      throw new ForbiddenException(
        `La sous-collection ${sousCollectionId} n’appartient pas à l’utilisateur ${userId}.`,
      );
    }

    const res = await this.prisma.prisma.relation_sous_collections.deleteMany({
      where: {
        sous_collection_id: sousCollectionId,
        question_id: questionId,
      },
    });
    if (res.count === 0) {
      throw new NotFoundException(
        `Aucun lien sous-collection / question pour la question ${questionId}.`,
      );
    }
  }
}
