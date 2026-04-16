import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QuizzQuestionRow } from '../quizz.type';

@Injectable()
export class QuizzWriteService {
  constructor(private readonly prisma: PrismaService) {}

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
    data: { question?: string; commentaire?: string; categorie_id?: number },
  ): Promise<QuizzQuestionRow> {
    const patch: {
      question?: string;
      commentaire?: string;
      categorie_id?: number;
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
    if (Object.keys(patch).length === 0) {
      throw new BadRequestException(
        'Au moins un champ parmi "question", "commentaire" (string) ou "categorie_id" (entier) requis',
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
      this.prisma.prisma.user_kpi.deleteMany({ where: { question_id: id } }),
      this.prisma.prisma.quizz_question_reponse.deleteMany({ where: { question_id: id } }),
      this.prisma.prisma.question_collection.deleteMany({ where: { question_id: id } }),
      this.prisma.prisma.quizz_question.delete({ where: { id } }),
    ]);
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
}
