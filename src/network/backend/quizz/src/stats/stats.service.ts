import { Injectable, NotFoundException } from '@nestjs/common';
import { QuizzService } from '../quizz/quizz.service';

@Injectable()
export class StatsService {
  constructor(private readonly quizz: QuizzService) {}

  listKpis(userId: number) {
    return this.quizz.listKpis(userId);
  }

  createUserKpi(
    userId: number,
    questionId: number,
    reponseId: number,
    dureeSecondes: number,
  ) {
    return this.quizz.createUserKpi(userId, questionId, reponseId, dureeSecondes);
  }

  listSessionSummaries(userId: number) {
    return this.quizz.listSessionSummaries(userId);
  }

  async getSessionDetailOrThrow(sessionId: string, userId: number) {
    const detail = await this.quizz.getSessionDetail(sessionId, userId);
    if (!detail) {
      throw new NotFoundException('Session introuvable');
    }
    return detail;
  }
}
