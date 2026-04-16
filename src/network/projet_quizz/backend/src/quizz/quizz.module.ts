import { Module } from '@nestjs/common';
import {
  LlmImportParser,
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
    LlmImportParser,
    QuizzImportService,
    QuizzService,
  ],
})
export class QuizzModule {}
