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

  @Get('device/lookup')
  lookupDevice(@Query('adresse_mac') adresse_mac?: string) {
    return this.quizz.lookupDevice(adresse_mac ?? '');
  }

  @Post('device/register')
  registerDevice(
    @Body() body: { adresse_mac?: string; pseudot?: string },
  ) {
    return this.quizz.registerDevice(
      typeof body?.adresse_mac === 'string' ? body.adresse_mac : '',
      typeof body?.pseudot === 'string' ? body.pseudot : '',
    );
  }

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

  @Post('stats/kpi')
  createKpi(
    @Body()
    body: {
      userId?: number;
      questionId?: number;
      reponseId?: number;
      dureeSecondes?: number;
    },
  ) {
    const { userId, questionId, reponseId, dureeSecondes } = body ?? {};
    if (typeof userId !== 'number' || !Number.isInteger(userId)) {
      throw new BadRequestException('Champ "userId" (entier) requis');
    }
    if (typeof questionId !== 'number' || !Number.isInteger(questionId)) {
      throw new BadRequestException('Champ "questionId" (entier) requis');
    }
    if (typeof reponseId !== 'number' || !Number.isInteger(reponseId)) {
      throw new BadRequestException('Champ "reponseId" (entier) requis');
    }
    if (typeof dureeSecondes !== 'number' || !Number.isFinite(dureeSecondes)) {
      throw new BadRequestException('Champ "dureeSecondes" (nombre) requis');
    }
    return this.quizz.createUserKpi(userId, questionId, reponseId, dureeSecondes);
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
