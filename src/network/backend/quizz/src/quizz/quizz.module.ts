import { Module } from '@nestjs/common';
import { QuizzController } from './quizz.controller';
import { QuizzService } from './quizz.service';

@Module({
  controllers: [QuizzController],
  providers: [QuizzService],
})
export class QuizzModule {}
