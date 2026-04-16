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
import {
  AppCollectionImportBodyDto,
  AssignCollectionToModuleDto,
  CreateCollectionInModuleDto,
  CreateQuestionDto,
  LlmImportBodyDto,
  CreateQuizzModuleDto,
  CreateStandaloneCollectionDto,
  UpdateQuestionDto,
  UpdateReponseDto,
} from './dto/quizz.dto';

function parsePlayOrderQuery(orderRaw?: string): 'random' | 'linear' {
  if (orderRaw === undefined || orderRaw === '') return 'random';
  if (orderRaw === 'random' || orderRaw === 'linear') return orderRaw;
  throw new BadRequestException(
    'Query order : utiliser "random" (défaut) ou "linear"',
  );
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

  @Get('collections/:id')
  getCollection(
    @Param('id', ParseIntPipe) id: number,
    @Query('qtype') qtypeRaw?: string,
  ) {
    const qtype = parsePlayQtypeQuery(qtypeRaw);
    return this.quizz.getCollection(id, qtype);
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
  ) {
    const order = parsePlayOrderQuery(orderRaw);
    const qtype = parsePlayQtypeQuery(qtypeRaw);
    return this.quizz.randomQuizQuestions(order, qtype);
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
    if (moduleId != null && collectionId == null) {
      throw new BadRequestException(
        'Query moduleId sans collectionId : indique collectionId pour rattacher l’import.',
      );
    }
    const categorie = parseImportCategorie(categorieRaw);
    return this.quizz.importQuestionsFromLlmJson(body, {
      collectionId,
      moduleId,
      categorie,
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
