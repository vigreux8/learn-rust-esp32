import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { QuizzQuestionRow } from '../../quizz.type';

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
      verifier?: boolean;
    },
  ): Promise<QuizzQuestionRow> {
    const patch: {
      question?: string;
      commentaire?: string;
      categorie_p_id?: number;
      verifier?: boolean;
    } = {};
    if (typeof data.question === 'string') patch.question = data.question;
    if (typeof data.commentaire === 'string') patch.commentaire = data.commentaire;
    if (typeof data.categorie_id === 'number' && Number.isInteger(data.categorie_id)) {
      const cat = await this.prisma.prisma.ref_p_categorie.findUnique({
        where: { id: data.categorie_id },
      });
      if (!cat) {
        throw new BadRequestException(`categorie_id ${data.categorie_id} introuvable`);
      }
      patch.categorie_p_id = data.categorie_id;
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
          ref_p_categorie: true,
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
        categorie_id: row.categorie_p_id,
        categorie_type: row.ref_p_categorie.type,
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
      categorie_id: row.categorie_p_id,
      categorie_type: row.ref_p_categorie.type,
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
        where: { collection_id: collectionId },
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
}
