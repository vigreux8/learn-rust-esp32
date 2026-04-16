import { Module } from '@nestjs/common';
import {
  QuizzImportService,
  QuizzReadService,
  QuizzStructureService,
  QuizzService,
  QuizzWriteService,
} from './services';
import { QuizzController } from './quizz.controller';

@Module({
  controllers: [QuizzController],
  providers: [
    QuizzReadService,
    QuizzWriteService,
    QuizzStructureService,
    QuizzImportService,
    QuizzService,
  ],
})
export class QuizzModule {}
