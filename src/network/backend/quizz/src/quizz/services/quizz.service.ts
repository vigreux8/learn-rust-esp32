import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CollectionUi,
  QuestionUi,
  QuizzModuleRow,
  QuizzQuestionDetail,
  QuizzQuestionRow,
  RefCategorieRow,
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

  randomQuizQuestions(order: 'random' | 'linear' = 'random'): Promise<QuestionUi[]> {
    return this.read.randomQuizQuestions(order);
  }

  listQuestions(
    collectionFilter?: number | 'none',
  ): Promise<QuizzQuestionRow[]> {
    return this.read.listQuestions(collectionFilter);
  }

  listQuestionsFromQuery(collectionId?: string): Promise<QuizzQuestionRow[]> {
    return this.read.listQuestionsFromQuery(collectionId);
  }

  listRefCategories(): Promise<RefCategorieRow[]> {
    return this.read.listRefCategories();
  }

  getQuestionDetail(id: number): Promise<QuizzQuestionDetail> {
    return this.read.getQuestionDetail(id);
  }

  // Delegation: QuizzWriteService
  updateQuestion(
    id: number,
    data: {
      question?: string;
      commentaire?: string;
      categorie_id?: number;
    },
  ): Promise<QuizzQuestionRow> {
    return this.write.updateQuestion(id, data);
  }

  updateReponse(
    id: number,
    data: { reponse: string },
  ): Promise<{ id: number; reponse: string; bonne_reponse: boolean }> {
    return this.write.updateReponse(id, data);
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

  deleteModule(moduleId: number): Promise<void> {
    return this.structure.deleteModule(moduleId);
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

  async assignCollectionToModule(
    collectionId: number,
    moduleId: number,
  ): Promise<CollectionUi> {
    await this.structure.assignCollectionToModule(collectionId, moduleId);
    const ui = await this.read.buildCollectionUi(collectionId);
    if (!ui) {
      throw new NotFoundException(`Collection ${collectionId} introuvable après assignation`);
    }
    return ui;
  }

  async unassignCollectionFromModule(
    collectionId: number,
    moduleId: number,
  ): Promise<CollectionUi> {
    await this.structure.unassignCollectionFromModule(collectionId, moduleId);
    const ui = await this.read.buildCollectionUi(collectionId);
    if (!ui) {
      throw new NotFoundException(
        `Collection ${collectionId} introuvable après retrait du lien`,
      );
    }
    return ui;
  }

  async createStandaloneCollection(body: {
    userId: number;
    nom: string;
    moduleId?: number;
  }): Promise<CollectionUi> {
    const { collectionId } =
      await this.structure.createStandaloneCollection(body);
    const ui = await this.read.buildCollectionUi(collectionId);
    if (!ui) {
      throw new NotFoundException(`Collection ${collectionId} introuvable après création`);
    }
    return ui;
  }

  // Delegation: QuizzImportService
  importQuestionsFromLlmJson(
    body: unknown,
    opts?: {
      collectionId?: number;
      moduleId?: number;
      categorie?: 'histoire' | 'pratique';
    },
  ): Promise<{
    createdQuestions: number;
    createdCollections: number;
  }> {
    return this.importSvc.importQuestionsFromLlmJson(body, opts);
  }
}
