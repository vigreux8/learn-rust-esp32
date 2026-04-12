import { Injectable } from '@nestjs/common';
import {
  CollectionUi,
  QuestionUi,
  QuizzModuleRow,
  QuizzQuestionRow,
} from '../quizz.type';
import { QuizzImportService } from './quizz-import.service';
import { QuizzReadService } from './quizz-read.service';
import { QuizzStructureService } from './quizz-structure.service';
import { QuizzWriteService } from './quizz-write.service';

@Injectable()
export class QuizzService {
  constructor(
    private readonly read: QuizzReadService,
    private readonly write: QuizzWriteService,
    private readonly structure: QuizzStructureService,
    private readonly importSvc: QuizzImportService,
  ) {}

  // Delegation: QuizzReadService
  buildCollectionUi(collectionId: number): Promise<CollectionUi | null> {
    return this.read.buildCollectionUi(collectionId);
  }

  listCollections(): Promise<CollectionUi[]> {
    return this.read.listCollections();
  }

  getCollection(collectionId: number): Promise<CollectionUi> {
    return this.read.getCollection(collectionId);
  }

  randomQuizQuestions(): Promise<QuestionUi[]> {
    return this.read.randomQuizQuestions();
  }

  listQuestions(
    collectionFilter?: number | 'none',
  ): Promise<QuizzQuestionRow[]> {
    return this.read.listQuestions(collectionFilter);
  }

  listQuestionsFromQuery(collectionId?: string): Promise<QuizzQuestionRow[]> {
    return this.read.listQuestionsFromQuery(collectionId);
  }

  // Delegation: QuizzWriteService
  updateQuestion(
    id: number,
    data: { question?: string; commentaire?: string },
  ): Promise<QuizzQuestionRow> {
    return this.write.updateQuestion(id, data);
  }

  deleteQuestion(id: number): Promise<void> {
    return this.write.deleteQuestion(id);
  }

  listModules(): Promise<QuizzModuleRow[]> {
    return this.structure.listModules();
  }

  createModule(nom: string): Promise<QuizzModuleRow> {
    return this.structure.createModule(nom);
  }

  createCollectionInModule(
    moduleId: number,
    body: { userId: number; nom: string },
  ): Promise<{
    collectionId: number;
    moduleId: number;
    nom: string;
    create_at: string;
    update_at: string;
  }> {
    return this.structure.createCollectionInModule({
      moduleId,
      userId: body.userId,
      nom: body.nom,
    });
  }

  // Delegation: QuizzImportService
  importQuestionsFromLlmJson(body: unknown): Promise<{
    createdQuestions: number;
    createdCollections: number;
  }> {
    return this.importSvc.importQuestionsFromLlmJson(body);
  }
}
