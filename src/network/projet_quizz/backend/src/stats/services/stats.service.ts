import { Injectable } from '@nestjs/common';
import { UserKpiRow } from '../stats.type';
import { StatsKpiReadService } from './stats-kpi-read.service';
import { StatsKpiWriteService } from './stats-kpi-write.service';
import { StatsSessionService } from './stats-session.service';

/**
 * Façade du module stats : délégation vers lecture KPI, écriture KPI et agrégations session.
 */
@Injectable()
export class StatsService {
  constructor(
    private readonly kpiRead: StatsKpiReadService,
    private readonly kpiWrite: StatsKpiWriteService,
    private readonly session: StatsSessionService,
  ) {}

  /** @see StatsKpiReadService.listKpis */
  listKpis(userId: number): Promise<UserKpiRow[]> {
    return this.kpiRead.listKpis(userId);
  }

  /** @see StatsKpiWriteService.createUserKpi */
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

  /** @see StatsSessionService.listSessionSummaries */
  listSessionSummaries(userId: number) {
    return this.session.listSessionSummaries(userId);
  }

  /** @see StatsSessionService.getSessionDetailOrThrow */
  getSessionDetailOrThrow(sessionId: string, userId: number) {
    return this.session.getSessionDetailOrThrow(sessionId, userId);
  }
}
