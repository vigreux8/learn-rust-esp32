import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserKpiRow } from '../stats.type';

@Injectable()
export class StatsKpiReadService {
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
}
