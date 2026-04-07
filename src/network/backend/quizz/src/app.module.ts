import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { DevicesModule } from './devices/devices.module';
import { QuizzModule } from './quizz/quizz.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [PrismaModule, QuizzModule, DevicesModule, StatsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
