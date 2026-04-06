import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { QuizzService } from './quizz.service';

@Controller()
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

  @Get('quiz/random')
  randomQuiz() {
    return this.quizz.randomQuizQuestions();
  }

  @Get('questions')
  listQuestions(@Query('collectionId') collectionId?: string) {
    if (collectionId === undefined || collectionId === '') {
      return this.quizz.listQuestions();
    }
    if (collectionId === 'none') {
      return this.quizz.listQuestions('none');
    }
    const n = Number(collectionId);
    if (!Number.isFinite(n) || !Number.isInteger(n)) {
      throw new BadRequestException(
        'Query collectionId : nombre entier ou la valeur "none"',
      );
    }
    return this.quizz.listQuestions(n);
  }

  @Post('questions/import')
  importQuestions(@Body() body: unknown) {
    return this.quizz.importQuestionsFromLlmJson(body);
  }

  @Patch('questions/:id')
  updateQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { question?: string; commentaire?: string },
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

  @Get('stats/kpis')
  listKpis(@Query('userId', ParseIntPipe) userId: number) {
    return this.quizz.listKpis(userId);
  }

  @Get('stats/sessions')
  listSessions(@Query('userId', ParseIntPipe) userId: number) {
    return this.quizz.listSessionSummaries(userId);
  }

  @Get('stats/sessions/:sessionId')
  async sessionDetail(
    @Param('sessionId') sessionId: string,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    const detail = await this.quizz.getSessionDetail(sessionId, userId);
    if (!detail) {
      throw new NotFoundException('Session introuvable');
    }
    return detail;
  }
}
