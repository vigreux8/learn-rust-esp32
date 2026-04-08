import { Module } from '@nestjs/common';
import {
  StatsKpiReadService,
  StatsKpiWriteService,
  StatsService,
  StatsSessionService,
} from './services';
import { StatsController } from './stats.controller';

@Module({
  controllers: [StatsController],
  providers: [
    StatsKpiReadService,
    StatsKpiWriteService,
    StatsSessionService,
    StatsService,
  ],
})
export class StatsModule {}
