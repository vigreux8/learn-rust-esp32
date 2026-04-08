import { Injectable } from '@nestjs/common';
import { UserKpiRow } from '../stats.type';
import { StatsKpiReadService } from './stats-kpi-read.service';
import { StatsKpiWriteService } from './stats-kpi-write.service';
import { StatsSessionService } from './stats-session.service';

@Injectable()
export class StatsService {
  constructor(
    private readonly kpiRead: StatsKpiReadService,
    private readonly kpiWrite: StatsKpiWriteService,
    private readonly session: StatsSessionService,
  ) {}

  listKpis(userId: number): Promise<UserKpiRow[]> {
    return this.kpiRead.listKpis(userId);
  }

  createUserKpi(
    userId: number,
    questionId: number,
    reponseId: number,
    dureeSecondes: number,
  ): Promise<UserKpiRow> {
    return this.kpiWrite.createUserKpi(
      userId,
      questionId,
      reponseId,
      dureeSecondes,
    );
  }

  listSessionSummaries(userId: number) {
    return this.session.listSessionSummaries(userId);
  }

  getSessionDetailOrThrow(sessionId: string, userId: number) {
    return this.session.getSessionDetailOrThrow(sessionId, userId);
  }
}
