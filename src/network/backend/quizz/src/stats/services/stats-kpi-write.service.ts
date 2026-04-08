import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserKpiRow } from '../stats.type';

@Injectable()
export class StatsKpiWriteService {
  constructor(private readonly prisma: PrismaService) {}

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
}
