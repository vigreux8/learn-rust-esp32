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
  AssignCollectionToModuleDto,
  CreateCollectionInModuleDto,
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
  getCollection(@Param('id', ParseIntPipe) id: number) {
    return this.quizz.getCollection(id);
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

  @Get('random')
  randomQuiz(@Query('order') orderRaw?: string) {
    const order = parsePlayOrderQuery(orderRaw);
    return this.quizz.randomQuizQuestions(order);
  }

  @Get('questions')
  listQuestions(@Query('collectionId') collectionId?: string) {
    return this.quizz.listQuestionsFromQuery(collectionId);
  }

  @Get('questions/:id')
  getQuestionDetail(@Param('id', ParseIntPipe) id: number) {
    return this.quizz.getQuestionDetail(id);
  }

  @Get('categories')
  listRefCategories() {
    return this.quizz.listRefCategories();
  }

  @Post('questions/import')
  importQuestions(
    @Body() body: unknown,
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

  @Patch('questions/:id')
  updateQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateQuestionDto,
  ) {
    return this.quizz.updateQuestion(id, {
      question: body?.question,
      commentaire: body?.commentaire,
      categorie_id: body?.categorie_id,
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
