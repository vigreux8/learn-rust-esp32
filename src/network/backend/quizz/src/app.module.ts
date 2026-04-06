import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { QuizzModule } from './quizz/quizz.module';

@Module({
  imports: [PrismaModule, QuizzModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
