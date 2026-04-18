import { Module } from '@nestjs/common';
import {
  ImportCollectionHandler,
  ImportLlmHandler,
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
    ImportLlmHandler,
    ImportCollectionHandler,
    QuizzService,
  ],
})
export class QuizzModule {}
