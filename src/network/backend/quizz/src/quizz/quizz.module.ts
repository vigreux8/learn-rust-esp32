import { Module } from '@nestjs/common';
import {
  LlmImportParser,
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
    LlmImportParser,
    QuizzImportService,
    QuizzService,
  ],
})
export class QuizzModule {}
