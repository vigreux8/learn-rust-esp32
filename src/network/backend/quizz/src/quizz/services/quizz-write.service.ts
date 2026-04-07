import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QuizzQuestionRow } from '../quizz.type';

@Injectable()
export class QuizzWriteService {
  constructor(private readonly prisma: PrismaService) {}

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
}
