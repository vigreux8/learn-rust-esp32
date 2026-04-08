import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CreateKpiDto } from './dto/stats.dto';
import { StatsService } from './services';

@Controller('stats')
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Get('kpis')
  listKpis(@Query('userId', ParseIntPipe) userId: number) {
    return this.stats.listKpis(userId);
  }

  @Post('kpi')
  createKpi(@Body() body: CreateKpiDto) {
    const { userId, questionId, reponseId, dureeSecondes } = body;
    return this.stats.createUserKpi(userId, questionId, reponseId, dureeSecondes);
  }

  @Get('sessions')
  listSessions(@Query('userId', ParseIntPipe) userId: number) {
    return this.stats.listSessionSummaries(userId);
  }

  @Get('sessions/:sessionId')
  async sessionDetail(
    @Param('sessionId') sessionId: string,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.stats.getSessionDetailOrThrow(sessionId, userId);
  }
}
