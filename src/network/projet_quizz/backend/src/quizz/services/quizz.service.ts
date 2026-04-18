import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CollectionUi,
  QuestionUi,
  QuizzModuleRow,
  QuizzQuestionDetail,
  QuizzQuestionRow,
  RefCategorieRow,
  SousCollectionUi,
} from '../quizz.type';
import { AppCollectionImportBodyDto } from '../dto/import-collection.dto';
import { LlmImportBodyDto } from '../dto/import-llm.dto';
import { ImportCollectionHandler } from './handlers/import-collection.handler';
import { ImportLlmHandler } from './handlers/import-llm.handler';
import { QuizzStructureService } from './core/quizz-structure.service';
import { QuizzWriteService } from './core/quizz-write.service';
import { QuizzReadService, type QuizPlaySessionOpts } from './quizz-read.service';

@Injectable()
export class QuizzService {
  constructor(
    private readonly read: QuizzReadService,
    private readonly write: QuizzWriteService,
    private readonly structure: QuizzStructureService,
    private readonly importLlm: ImportLlmHandler,
    private readonly importCollection: ImportCollectionHandler,
  ) {}

  // Delegation: QuizzReadService
  buildCollectionUi(
    collectionId: number,
    qtype: 'histoire' | 'pratique' | 'melanger' = 'melanger',
  ): Promise<CollectionUi | null> {
    return this.read.buildCollectionUi(collectionId, qtype);
  }

  listCollections(): Promise<CollectionUi[]> {
    return this.read.listCollections();
  }

  getCollection(
    collectionId: number,
    qtype: 'histoire' | 'pratique' | 'melanger' = 'melanger',
    play?: QuizPlaySessionOpts,
  ): Promise<CollectionUi> {
    return this.read.getCollection(collectionId, qtype, play);
  }

  randomQuizQuestions(opts: QuizPlaySessionOpts): Promise<QuestionUi[]> {
    return this.read.randomQuizQuestions(opts);
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
      verifier?: boolean;
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

  createQuestion(body: {
    user_id: number;
    categorie_id: number;
    question: string;
    commentaire: string;
    reponses: { texte: string; correcte: boolean }[];
    collection_id?: number;
    parent_question_id?: number;
  }): Promise<QuizzQuestionRow> {
    return this.write.createQuestion(body);
  }

  deleteCollection(collectionId: number, userId: number): Promise<void> {
    return this.write.deleteCollection(collectionId, userId);
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

  importQuestionsFromLlmJson(
    body: LlmImportBodyDto,
    opts?: {
      collectionId?: number;
      moduleId?: number;
      categorie?: 'histoire' | 'pratique';
    },
  ): Promise<{
    createdQuestions: number;
    createdCollections: number;
  }> {
    return this.importLlm.importQuestionsFromLlmJson(body, opts);
  }

  importAppCollectionQuestionsJson(
    body: AppCollectionImportBodyDto,
    opts?: { collectionId?: number },
  ): Promise<{ createdQuestions: number }> {
    return this.importCollection.importAppCollectionQuestionsJson(body, opts);
  }

  listSousCollectionsByCollection(
    collectionId: number,
  ): Promise<SousCollectionUi[]> {
    return this.read.listSousCollectionsByCollection(collectionId);
  }

  createSousCollection(
    collectionId: number,
    body: { user_id: number; nom: string; description: string },
  ): Promise<SousCollectionUi> {
    return this.write.createSousCollection(collectionId, body);
  }

  deleteSousCollection(sousCollectionId: number, userId: number): Promise<void> {
    return this.write.deleteSousCollection(sousCollectionId, userId);
  }

  attachQuestionToSousCollection(
    sousCollectionId: number,
    body: { user_id: number; question_id: number },
  ): Promise<void> {
    return this.write.attachQuestionToSousCollection(sousCollectionId, body);
  }

  detachQuestionFromSousCollection(
    sousCollectionId: number,
    userId: number,
    questionId: number,
  ): Promise<void> {
    return this.write.detachQuestionFromSousCollection(
      sousCollectionId,
      userId,
      questionId,
    );
  }
}
