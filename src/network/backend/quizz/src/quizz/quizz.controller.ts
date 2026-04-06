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
  listQuestions() {
    return this.quizz.listQuestions();
  }

  @Patch('questions/:id')
  updateQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { question?: string },
  ) {
    if (typeof body?.question !== 'string') {
      throw new BadRequestException('Champ "question" (string) requis');
    }
    return this.quizz.updateQuestion(id, body.question);
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
