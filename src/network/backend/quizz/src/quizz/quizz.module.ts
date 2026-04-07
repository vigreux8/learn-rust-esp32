import { Module } from '@nestjs/common';
import {
  QuizzImportService,
  QuizzReadService,
  QuizzService,
  QuizzWriteService,
} from './services';
import { QuizzController } from './quizz.controller';

@Module({
  controllers: [QuizzController],
  providers: [
    QuizzReadService,
    QuizzWriteService,
    QuizzImportService,
    QuizzService,
  ],
})
export class QuizzModule {}
