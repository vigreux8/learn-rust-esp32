import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CollectionUi,
  GroupeQuestionsUi,
  PersonalitePickerRowDto,
  QuestionUi,
  QuizzQuestionDetail,
  QuizzQuestionRow,
  RefCategorieHierarchyRow,
  RefCategorieRow,
  RefImportancePersonaliteDto,
  ReflexionChainEditorDto,
  RefQuestionScaleRow,
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
    qtype: 'histoire' | 'pratique' | 'connaissance' | 'melanger' = 'melanger',
  ): Promise<CollectionUi | null> {
    return this.read.buildCollectionUi(collectionId, qtype);
  }

  listCollections(): Promise<CollectionUi[]> {
    return this.read.listCollections();
  }

  getCollection(
    collectionId: number,
    qtype: 'histoire' | 'pratique' | 'connaissance' | 'melanger' = 'melanger',
    play?: QuizPlaySessionOpts,
  ): Promise<CollectionUi> {
    return this.read.getCollection(collectionId, qtype, play);
  }

  listSousCollectionsForParent(parentId: number): Promise<SousCollectionUi[]> {
    return this.read.listSousCollectionsForParent(parentId);
  }

  createChildSousCollection(
    parentId: number,
    body: { user_id: number; nom: string; description: string },
  ): Promise<SousCollectionUi> {
    return this.write.createChildSousCollection(parentId, body);
  }

  updateChildSousCollection(
    childId: number,
    body: { user_id: number; nom: string; description: string },
  ): Promise<SousCollectionUi> {
    return this.write.updateChildSousCollection(childId, body);
  }

  deleteChildSousCollection(childId: number, userId: number): Promise<void> {
    return this.write.deleteChildSousCollection(childId, userId);
  }

  linkExistingCollectionParent(childId: number, parentId: number, userId: number): Promise<void> {
    return this.write.linkExistingCollectionParent(childId, parentId, userId);
  }

  unlinkCollectionParentRelation(childId: number, userId: number): Promise<void> {
    return this.write.unlinkCollectionParentRelation(childId, userId);
  }

  attachQuestionToChildCollection(
    childId: number,
    body: { user_id: number; question_id: number },
  ): Promise<void> {
    return this.write.attachQuestionToChildCollection(childId, body);
  }

  detachQuestionFromChildCollection(
    childId: number,
    questionId: number,
    userId: number,
  ): Promise<void> {
    return this.write.detachQuestionFromChildCollection(childId, questionId, userId);
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

  listRefCategoriesHierarchy(): Promise<RefCategorieHierarchyRow[]> {
    return this.read.listRefCategoriesHierarchy();
  }

  listRefImportanceQuestions(): Promise<RefQuestionScaleRow[]> {
    return this.read.listRefImportanceQuestions();
  }

  listRefDifficulteQuestions(): Promise<RefQuestionScaleRow[]> {
    return this.read.listRefDifficulteQuestions();
  }

  listRefImportancePersonalite(): Promise<RefImportancePersonaliteDto[]> {
    return this.read.listRefImportancePersonalite();
  }

  listPersonalitesPicker(): Promise<PersonalitePickerRowDto[]> {
    return this.read.listPersonalitesPicker();
  }

  getQuestionDetail(id: number): Promise<QuizzQuestionDetail> {
    return this.read.getQuestionDetail(id);
  }

  listGroupeQuestionsForCollection(collectionId: number): Promise<GroupeQuestionsUi[]> {
    return this.read.listGroupeQuestionsForCollection(collectionId);
  }

  getReflexionChainEditor(
    collectionId: number,
    groupeQuestionsId?: number,
  ): Promise<ReflexionChainEditorDto> {
    return this.read.getReflexionChainEditor(collectionId, groupeQuestionsId);
  }

  setReflexionChainOrder(
    collectionId: number,
    body: {
      user_id: number;
      ordered_question_ids: number[];
      groupe_questions_id?: number;
      chain_color_levels?: Record<string, number>;
    },
  ): Promise<void> {
    return this.write.setReflexionChainOrder(collectionId, body);
  }

  createGroupeQuestions(
    collectionId: number,
    body: { user_id: number; nom: string; description?: string },
  ): Promise<GroupeQuestionsUi> {
    return this.write.createGroupeQuestions(collectionId, body);
  }

  updateGroupeQuestions(
    groupeId: number,
    body: { user_id: number; nom: string; description?: string },
  ): Promise<GroupeQuestionsUi> {
    return this.write.updateGroupeQuestions(groupeId, body);
  }

  deleteGroupeQuestions(groupeId: number, userId: number): Promise<void> {
    return this.write.deleteGroupeQuestions(groupeId, userId);
  }

  moveGroupeQuestionsToCollection(
    groupeId: number,
    body: { user_id: number; to_collection_id: number },
  ): Promise<GroupeQuestionsUi> {
    return this.write.moveGroupeQuestionsToCollection(groupeId, body);
  }

  // Delegation: QuizzWriteService
  updateQuestion(
    id: number,
    data: {
      question?: string;
      commentaire?: string;
      categorie_id?: number;
      categorie_e_id?: number | null;
      verifier?: boolean;
      importance_id?: number | null;
      difficulter_id?: number | null;
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

  deleteImplicitQuestionRelation(relationId: number): Promise<void> {
    return this.write.deleteImplicitQuestionRelation(relationId);
  }

  moveQuestionBetweenCollections(
    questionId: number,
    body: { user_id: number; from_collection_id: number; to_collection_id: number },
  ): Promise<void> {
    return this.write.moveQuestionBetweenCollections({
      userId: body.user_id,
      questionId,
      fromCollectionId: body.from_collection_id,
      toCollectionId: body.to_collection_id,
    });
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

  createCollectionInTag(
    tagCollectionId: number,
    body: { userId: number; nom: string },
  ): Promise<{
    collectionId: number;
    tagCollectionId: number;
    nom: string;
    create_at: string;
    update_at: string;
  }> {
    return this.structure.createCollectionWithTag({
      tagCollectionId,
      userId: body.userId,
      nom: body.nom,
    });
  }

  async assignCollectionTag(
    collectionId: number,
    tagCollectionId: number,
  ): Promise<CollectionUi> {
    await this.structure.assignCollectionTag(tagCollectionId, collectionId);
    const ui = await this.read.buildCollectionUi(collectionId);
    if (!ui) {
      throw new NotFoundException(`Collection ${collectionId} introuvable après assignation`);
    }
    return ui;
  }

  async unassignCollectionTag(
    collectionId: number,
    tagCollectionId: number,
  ): Promise<CollectionUi> {
    await this.structure.unassignCollectionTag(tagCollectionId, collectionId);
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
    tagCollectionId?: number;
  }): Promise<CollectionUi> {
    const { collectionId } =
      await this.structure.createStandaloneCollection(body);
    const ui = await this.read.buildCollectionUi(collectionId);
    if (!ui) {
      throw new NotFoundException(`Collection ${collectionId} introuvable après création`);
    }
    return ui;
  }

  async createPersonaliteCollection(body: {
    userId: number;
    nom: string;
    prenom: string;
    naissance: number;
    mort?: number | null;
    resumer: string;
    tagCollectionId?: number;
  }): Promise<CollectionUi> {
    const { collectionId } =
      await this.write.createPersonaliteCollection(body);
    const ui = await this.read.buildCollectionUi(collectionId);
    if (!ui) {
      throw new NotFoundException(
        `Collection ${collectionId} introuvable après création personnalité`,
      );
    }
    return ui;
  }

  async assignPersonaliteToCollection(
    collectionId: number,
    body: {
      userId: number;
      personaliteId: number;
      importanceType?: string | null;
    },
  ): Promise<CollectionUi> {
    await this.write.assignPersonaliteToCollection(collectionId, body);
    const ui = await this.read.buildCollectionUi(collectionId);
    if (!ui) {
      throw new NotFoundException(`Collection ${collectionId} introuvable`);
    }
    return ui;
  }

  async unassignPersonaliteFromCollection(
    collectionId: number,
    personaliteId: number,
    userId: number,
  ): Promise<CollectionUi> {
    await this.write.unassignPersonaliteFromCollection(
      collectionId,
      personaliteId,
      userId,
    );
    const ui = await this.read.buildCollectionUi(collectionId);
    if (!ui) {
      throw new NotFoundException(`Collection ${collectionId} introuvable`);
    }
    return ui;
  }

  importQuestionsFromLlmJson(
    body: LlmImportBodyDto,
    opts?: {
      collectionId?: number;
      tagCollectionId?: number;
      categorie?: 'histoire' | 'pratique' | 'connaissance';
      sousCollectionId?: number;
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
}
