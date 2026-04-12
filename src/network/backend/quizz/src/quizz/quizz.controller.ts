import {
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
  UpdateQuestionDto,
} from './dto/quizz.dto';

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
  randomQuiz() {
    return this.quizz.randomQuizQuestions();
  }

  @Get('questions')
  listQuestions(@Query('collectionId') collectionId?: string) {
    return this.quizz.listQuestionsFromQuery(collectionId);
  }

  @Post('questions/import')
  importQuestions(@Body() body: unknown) {
    return this.quizz.importQuestionsFromLlmJson(body);
  }

  @Patch('questions/:id')
  updateQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateQuestionDto,
  ) {
    return this.quizz.updateQuestion(id, {
      question: body?.question,
      commentaire: body?.commentaire,
    });
  }

  @Delete('questions/:id')
  deleteQuestion(@Param('id', ParseIntPipe) id: number) {
    return this.quizz.deleteQuestion(id);
  }
}
