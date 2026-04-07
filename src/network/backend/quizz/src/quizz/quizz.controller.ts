import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { QuizzService } from './services';
import { UpdateQuestionDto } from './dto/quizz.dto';

@Controller('quizz')
export class QuizzController {
  constructor(private readonly quizz: QuizzService) {}

  @Get('collections')
  listCollections() {
    return this.quizz.listCollections();
  }

  @Get('collections/:id')
  getCollection(@Param('id', ParseIntPipe) id: number) {
    return this.quizz.getCollection(id);
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
