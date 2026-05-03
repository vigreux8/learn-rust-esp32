import {
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppCollectionImportQuestionDto } from '../dto/import-collection.dto';
import {
  LlmImportCollectionBlockDto,
  LlmImportQuestionDto,
} from '../dto/import-llm.dto';
import { QuizzWriteService } from './core/quizz-write.service';

function nowIso(): string {
  return new Date().toISOString();
}

@Injectable()
export class QuizzImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly write: QuizzWriteService,
  ) {}

  private toLlmQuestionDto(q: AppCollectionImportQuestionDto): LlmImportQuestionDto {
    return {
      question: q.question,
      commentaire: q.commentaire ?? '',
      reponses: q.reponses,
    };
  }

  private async persistImportPlan(params: {
    userId: number;
    collections: LlmImportCollectionBlockDto[];
    questionsSansCollection: LlmImportQuestionDto[];
    categorieId: number;
  }): Promise<{ createdQuestions: number; createdCollections: number }> {
    const { userId, collections, questionsSansCollection, categorieId } = params;
    let createdQuestions = 0;
    let createdCollections = 0;
    const t = nowIso();

    await this.prisma.prisma.$transaction(async (tx) => {
      const addQuestion = async (
        qin: LlmImportQuestionDto,
        collectionId: number | null,
      ): Promise<void> => {
        await this.write.insertQuestionWithAnswers(tx, {
          user_id: userId,
          categorie_id: categorieId,
          question: qin.question,
          commentaire: qin.commentaire,
          reponses: qin.reponses,
          collection_id: collectionId ?? undefined,
          verifier: false,
        });
        createdQuestions += 1;
      };

      for (const block of collections) {
        let col = await tx.quizz_collection.findFirst({
          where: { user_id: userId, nom: block.nom },
        });
        if (!col) {
          col = await tx.quizz_collection.create({
            data: {
              user_id: userId,
              create_at: t,
              update_at: t,
              nom: block.nom,
            },
          });
          createdCollections += 1;
        }

        for (const qin of block.questions) {
          await addQuestion(qin, col.id);
        }
      }

      for (const qin of questionsSansCollection) {
        await addQuestion(qin, null);
      }
    });

    return { createdQuestions, createdCollections };
  }

  private async persistImportIntoExistingCollection(params: {
    userId: number;
    targetCollectionId: number;
    questions: LlmImportQuestionDto[];
    categorieId: number;
    sousCollectionId?: number;
  }): Promise<{ createdQuestions: number }> {
    const { userId, targetCollectionId, questions, categorieId, sousCollectionId } = params;
    let createdQuestions = 0;
    const t = nowIso();
    await this.prisma.prisma.$transaction(async (tx) => {
      for (const qin of questions) {
        const questionId = await this.write.insertQuestionWithAnswers(tx, {
          user_id: userId,
          categorie_id: categorieId,
          question: qin.question,
          commentaire: qin.commentaire,
          reponses: qin.reponses,
          collection_id: targetCollectionId,
          verifier: false,
        });
        createdQuestions += 1;
        if (sousCollectionId != null) {
          await tx.relation_sous_collections.create({
            data: {
              sous_collection_id: sousCollectionId,
              question_id: questionId,
            },
          });
        }
      }
      await tx.quizz_collection.update({
        where: { id: targetCollectionId },
        data: { update_at: t },
      });
    });
    return { createdQuestions };
  }

  async importQuestionsFromLlmJson(
    params: {
      userId: number;
      categorieId: number;
      collections: LlmImportCollectionBlockDto[];
      questionsSansCollection: LlmImportQuestionDto[];
      collectionId?: number;
      sousCollectionId?: number;
    },
  ): Promise<{
    createdQuestions: number;
    createdCollections: number;
  }> {
    const {
      userId,
      categorieId,
      collections,
      questionsSansCollection,
      collectionId,
      sousCollectionId,
    } = params;
    if (collectionId != null) {
      const flat = [...collections.flatMap((b) => b.questions), ...questionsSansCollection];
      const { createdQuestions } = await this.persistImportIntoExistingCollection(
        {
          userId,
          targetCollectionId: collectionId,
          questions: flat,
          categorieId,
          sousCollectionId,
        },
      );
      return { createdQuestions, createdCollections: 0 };
    }

    return this.persistImportPlan({
      userId,
      collections,
      questionsSansCollection,
      categorieId,
    });
  }

  async importAppCollectionQuestionsJson(
    params: {
      userId: number;
      targetCollectionId: number;
      questions: AppCollectionImportQuestionDto[];
    },
  ): Promise<{
    createdQuestions: number;
  }> {
    const { userId, targetCollectionId, questions } = params;
    let createdQuestions = 0;
    const t = nowIso();

    await this.prisma.prisma.$transaction(async (tx) => {
      for (const qin of questions) {
        const verifier = qin.fakechecker ?? false;
        const llmQuestion = this.toLlmQuestionDto(qin);
        await this.write.insertQuestionWithAnswers(tx, {
          user_id: userId,
          categorie_id: qin.categorie_id,
          question: llmQuestion.question,
          commentaire: llmQuestion.commentaire,
          reponses: llmQuestion.reponses,
          collection_id: targetCollectionId,
          verifier,
        });
        createdQuestions += 1;
      }

      await tx.quizz_collection.update({
        where: { id: targetCollectionId },
        data: { update_at: t },
      });
    });

    return { createdQuestions };
  }
}
