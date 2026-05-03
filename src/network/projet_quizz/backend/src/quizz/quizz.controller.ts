import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { QuizzService } from './services';
import { AppCollectionImportBodyDto } from './dto/import-collection.dto';
import { LlmImportBodyDto } from './dto/import-llm.dto';
import {
  AssignCollectionToModuleDto,
  AttachQuestionToSousCollectionDto,
  CreateCollectionInModuleDto,
  CreateQuestionDto,
  CreateQuizzModuleDto,
  CreateSousCollectionDto,
  CreateStandaloneCollectionDto,
  UpdateQuestionDto,
  UpdateReponseDto,
} from './dto/quizz.dto';

type QuizPlayOrderQuery =
  | 'random'
  | 'linear'
  | 'jamais_repondu'
  | 'mal_repondu_filtre'
  | 'recent'
  | 'ancien'
  | 'mal_repondu';

const ALLOWED_PLAY_ORDER: QuizPlayOrderQuery[] = [
  'random',
  'linear',
  'jamais_repondu',
  'mal_repondu_filtre',
  'recent',
  'ancien',
  'mal_repondu',
];

function parseOnePlayOrderToken(token: string): QuizPlayOrderQuery {
  const t = token.trim();
  if (t === '') {
    throw new BadRequestException('Query order : segment vide (virgules en trop ?)');
  }
  if (!(ALLOWED_PLAY_ORDER as string[]).includes(t)) {
    throw new BadRequestException(
      `Query order : segment inconnu « ${t} ». Valeurs : ${ALLOWED_PLAY_ORDER.join(', ')}`,
    );
  }
  return t as QuizPlayOrderQuery;
}

/** Plusieurs modes séparés par des virgules, appliqués dans l’ordre (ex. `ancien,mal_repondu`). */
function parsePlayOrdersQuery(orderRaw?: string): QuizPlayOrderQuery[] {
  if (orderRaw === undefined || orderRaw.trim() === '') {
    return ['random'];
  }
  const parts = orderRaw.split(',');
  if (parts.length > 12) {
    throw new BadRequestException('Query order : au plus 12 segments séparés par des virgules');
  }
  const out: QuizPlayOrderQuery[] = [];
  for (const p of parts) {
    const mode = parseOnePlayOrderToken(p);
    if (out.length === 0 || out[out.length - 1] !== mode) {
      out.push(mode);
    }
  }
  if (out.length === 0) {
    return ['random'];
  }
  /** Compat : seul « jamais_repondu » gardait un tirage aléatoire parmi les questions filtrées. */
  if (out.length === 1 && out[0] === 'jamais_repondu') {
    return ['jamais_repondu', 'random'];
  }
  return out;
}

function parseUserIdQueryOptional(raw?: string): number | undefined {
  if (raw === undefined || raw === '') return undefined;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) {
    throw new BadRequestException('Query userId : entier ≥ 1 attendu si le paramètre est fourni');
  }
  return n;
}

function parseInfiniteQuery(raw?: string): boolean {
  if (raw === undefined || raw === '') return false;
  const v = raw.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

function parseExcludeIdsQuery(raw?: string): number[] {
  if (raw === undefined || raw.trim() === '') return [];
  const parts = raw.split(',');
  const out: number[] = [];
  for (const p of parts) {
    const n = Number(p.trim());
    if (!Number.isInteger(n) || n < 1) {
      throw new BadRequestException(
        'Query exclude : liste d’entiers séparés par des virgules (ex. 1,2,3)',
      );
    }
    out.push(n);
  }
  if (out.length > 500) {
    throw new BadRequestException('Query exclude : au plus 500 identifiants');
  }
  return [...new Set(out)];
}

function assertOrdersRequireUserId(
  orders: QuizPlayOrderQuery[],
  userId: number | undefined,
): void {
  const needs =
    orders.includes('jamais_repondu') ||
    orders.includes('mal_repondu') ||
    orders.includes('mal_repondu_filtre');
  if (needs && userId === undefined) {
    throw new BadRequestException(
      'Query userId (entier ≥ 1) requis si order contient jamais_repondu, mal_repondu et/ou mal_repondu_filtre',
    );
  }
}

function parseImportCategorie(raw?: string): 'histoire' | 'pratique' {
  if (raw === undefined || raw === '') return 'histoire';
  if (raw === 'histoire' || raw === 'pratique') return raw;
  throw new BadRequestException('Query categorie : "histoire" (défaut) ou "pratique"');
}

/** Filtre de questions pour le jeu (GET random / collections/:id). */
function parsePlayQtypeQuery(raw?: string): 'histoire' | 'pratique' | 'melanger' {
  if (raw === undefined || raw === '') return 'melanger';
  if (raw === 'histoire' || raw === 'pratique' || raw === 'melanger') return raw;
  throw new BadRequestException(
    'Query qtype : "histoire", "pratique" ou "melanger" (défaut : tout mélanger)',
  );
}

@Controller('quizz')
export class QuizzController {
  constructor(private readonly quizz: QuizzService) {}

  @Get('modules')
  listModules() {
    return this.quizz.listModules();
  }

  @Post('modules')
  createModule(@Body() body: CreateQuizzModuleDto) {
    return this.quizz.createModule(body.nom);
  }

  @Delete('modules/:moduleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteModule(@Param('moduleId', ParseIntPipe) moduleId: number) {
    return this.quizz.deleteModule(moduleId);
  }

  @Post('modules/:moduleId/collections')
  createCollectionInModule(
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Body() body: CreateCollectionInModuleDto,
  ) {
    return this.quizz.createCollectionInModule(moduleId, {
      userId: body.userId,
      nom: body.nom,
    });
  }

  @Get('collections')
  listCollections() {
    return this.quizz.listCollections();
  }

  @Post('collections')
  createStandaloneCollection(@Body() body: CreateStandaloneCollectionDto) {
    return this.quizz.createStandaloneCollection({
      userId: body.userId,
      nom: body.nom,
      moduleId: body.moduleId,
    });
  }

  @Get('collections/:id/sous-collections')
  listSousCollections(@Param('id', ParseIntPipe) collectionId: number) {
    return this.quizz.listSousCollectionsByCollection(collectionId);
  }

  @Post('collections/:id/sous-collections')
  createSousCollection(
    @Param('id', ParseIntPipe) collectionId: number,
    @Body() body: CreateSousCollectionDto,
  ) {
    return this.quizz.createSousCollection(collectionId, body);
  }

  @Patch('sous-collections/:sousId')
  updateSousCollection(
    @Param('sousId', ParseIntPipe) sousId: number,
    @Body() body: CreateSousCollectionDto,
  ) {
    return this.quizz.updateSousCollection(sousId, body);
  }

  @Delete('sous-collections/:sousId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSousCollection(
    @Param('sousId', ParseIntPipe) sousId: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.quizz.deleteSousCollection(sousId, userId);
  }

  @Post('sous-collections/:sousId/questions')
  @HttpCode(HttpStatus.NO_CONTENT)
  attachQuestionToSousCollection(
    @Param('sousId', ParseIntPipe) sousId: number,
    @Body() body: AttachQuestionToSousCollectionDto,
  ) {
    return this.quizz.attachQuestionToSousCollection(sousId, body);
  }

  @Delete('sous-collections/:sousId/questions/:questionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  detachQuestionFromSousCollection(
    @Param('sousId', ParseIntPipe) sousId: number,
    @Param('questionId', ParseIntPipe) questionId: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.quizz.detachQuestionFromSousCollection(
      sousId,
      userId,
      questionId,
    );
  }

  @Get('collections/:id')
  getCollection(
    @Param('id', ParseIntPipe) id: number,
    @Query('qtype') qtypeRaw?: string,
    @Query('order') orderRaw?: string,
    @Query('userId') userIdRaw?: string,
    @Query('infinite') infiniteRaw?: string,
    @Query('exclude') excludeRaw?: string,
    @Query('sousCollectionId') sousCollectionIdRaw?: string,
  ) {
    const parseOptPositiveInt = (label: string, s?: string): number | undefined => {
      if (s === undefined || s === '') return undefined;
      const n = Number(s);
      if (!Number.isInteger(n) || n < 1) {
        throw new BadRequestException(
          `Query ${label} : entier ≥ 1 attendu si le paramètre est fourni`,
        );
      }
      return n;
    };
    const qtype = parsePlayQtypeQuery(qtypeRaw);
    const sousCollectionId = parseOptPositiveInt(
      'sousCollectionId',
      sousCollectionIdRaw,
    );
    const hasPlay =
      (orderRaw != null && orderRaw !== '') ||
      (userIdRaw != null && userIdRaw !== '') ||
      (infiniteRaw != null && infiniteRaw !== '') ||
      (excludeRaw != null && excludeRaw !== '') ||
      sousCollectionId != null;
    if (!hasPlay) {
      return this.quizz.getCollection(id, qtype);
    }
    const orders = parsePlayOrdersQuery(orderRaw);
    const userId = parseUserIdQueryOptional(userIdRaw);
    assertOrdersRequireUserId(orders, userId);
    const infinite = parseInfiniteQuery(infiniteRaw);
    const excludeIds = parseExcludeIdsQuery(excludeRaw);
    return this.quizz.getCollection(id, qtype, {
      orders,
      userId,
      limit: infinite ? 15 : undefined,
      excludeIds,
      sousCollectionId,
    });
  }

  @Post('collections/:id/modules')
  assignCollectionToModule(
    @Param('id', ParseIntPipe) collectionId: number,
    @Body() body: AssignCollectionToModuleDto,
  ) {
    return this.quizz.assignCollectionToModule(collectionId, body.moduleId);
  }

  @Delete('collections/:id/modules/:moduleId')
  unassignCollectionFromModule(
    @Param('id', ParseIntPipe) collectionId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
  ) {
    return this.quizz.unassignCollectionFromModule(collectionId, moduleId);
  }

  @Delete('collections/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCollection(
    @Param('id', ParseIntPipe) collectionId: number,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.quizz.deleteCollection(collectionId, userId);
  }

  @Get('random')
  randomQuiz(
    @Query('order') orderRaw?: string,
    @Query('qtype') qtypeRaw?: string,
    @Query('userId') userIdRaw?: string,
    @Query('infinite') infiniteRaw?: string,
    @Query('exclude') excludeRaw?: string,
  ) {
    const orders = parsePlayOrdersQuery(orderRaw);
    const qtype = parsePlayQtypeQuery(qtypeRaw);
    const userId = parseUserIdQueryOptional(userIdRaw);
    assertOrdersRequireUserId(orders, userId);
    const infinite = parseInfiniteQuery(infiniteRaw);
    const excludeIds = parseExcludeIdsQuery(excludeRaw);
    return this.quizz.randomQuizQuestions({
      orders,
      qtype,
      userId,
      limit: infinite ? 15 : undefined,
      excludeIds,
    });
  }

  @Get('questions')
  listQuestions(@Query('collectionId') collectionId?: string) {
    return this.quizz.listQuestionsFromQuery(collectionId);
  }

  @Get('questions/:id')
  getQuestionDetail(@Param('id', ParseIntPipe) id: number) {
    return this.quizz.getQuestionDetail(id);
  }

  @Post('questions')
  createQuestion(@Body() body: CreateQuestionDto) {
    return this.quizz.createQuestion({
      user_id: body.user_id,
      categorie_id: body.categorie_id,
      question: body.question,
      commentaire: body.commentaire,
      reponses: body.reponses.map((r) => ({
        texte: r.texte,
        correcte: r.correcte,
      })),
      collection_id: body.collection_id,
      parent_question_id: body.parent_question_id,
    });
  }

  @Get('categories')
  listRefCategories() {
    return this.quizz.listRefCategories();
  }

  @Post('questions/import')
  importQuestions(
    @Body() body: LlmImportBodyDto,
    @Query('collectionId') collectionIdStr?: string,
    @Query('moduleId') moduleIdStr?: string,
    @Query('categorie') categorieRaw?: string,
    @Query('sousCollectionId') sousCollectionIdStr?: string,
  ) {
    const parseOptInt = (label: string, s?: string): number | undefined => {
      if (s === undefined || s === '') return undefined;
      const n = Number(s);
      if (!Number.isInteger(n) || n < 1) {
        throw new BadRequestException(
          `Query ${label} : entier ≥ 1 attendu si le paramètre est fourni`,
        );
      }
      return n;
    };
    const collectionId = parseOptInt('collectionId', collectionIdStr);
    const moduleId = parseOptInt('moduleId', moduleIdStr);
    const sousCollectionId = parseOptInt('sousCollectionId', sousCollectionIdStr);
    if (moduleId != null && collectionId == null) {
      throw new BadRequestException(
        'Query moduleId sans collectionId : indique collectionId pour rattacher l’import.',
      );
    }
    if (sousCollectionId != null && collectionId == null) {
      throw new BadRequestException(
        'Query sousCollectionId sans collectionId : indique collectionId pour rattacher l’import.',
      );
    }
    const categorie = parseImportCategorie(categorieRaw);
    return this.quizz.importQuestionsFromLlmJson(body, {
      collectionId,
      moduleId,
      categorie,
      sousCollectionId,
    });
  }

  /** Import JSON généré par l’application (export collection) — distinct du flux LLM. */
  @Post('collections/questions/import-app')
  importAppCollectionQuestions(
    @Body() body: AppCollectionImportBodyDto,
    @Query('collectionId') collectionIdStr?: string,
  ) {
    const parseOptInt = (label: string, s?: string): number | undefined => {
      if (s === undefined || s === '') return undefined;
      const n = Number(s);
      if (!Number.isInteger(n) || n < 1) {
        throw new BadRequestException(
          `Query ${label} : entier ≥ 1 attendu si le paramètre est fourni`,
        );
      }
      return n;
    };
    const collectionId = parseOptInt('collectionId', collectionIdStr);
    return this.quizz.importAppCollectionQuestionsJson(body, { collectionId });
  }

  @Patch('questions/:id')
  updateQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateQuestionDto,
  ) {
    return this.quizz.updateQuestion(id, {
      question: body?.question,
      commentaire: body?.commentaire,
      categorie_id: body?.categorie_id,
      verifier: body?.verifier,
    });
  }

  @Patch('reponses/:id')
  updateReponse(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateReponseDto,
  ) {
    return this.quizz.updateReponse(id, { reponse: body.reponse });
  }

  @Delete('questions/:id')
  deleteQuestion(@Param('id', ParseIntPipe) id: number) {
    return this.quizz.deleteQuestion(id);
  }
}
