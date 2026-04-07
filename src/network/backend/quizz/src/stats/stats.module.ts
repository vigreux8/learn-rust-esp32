import { Module } from '@nestjs/common';
import { QuizzModule } from '../quizz/quizz.module';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [QuizzModule],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
