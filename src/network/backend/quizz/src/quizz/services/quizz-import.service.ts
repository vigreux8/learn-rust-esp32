import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  LlmImportCollectionBlock,
  LlmImportParser,
  LlmImportQuestion,
} from './quizz-import.parser';

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Import transactionnel de questions/réponses au format JSON (LLM ou équivalent).
 *
 * Délègue la validation/parsing à `LlmImportParser` ; ce service orchestre
 * la résolution utilisateur et la persistance Prisma.
 */
@Injectable()
export class QuizzImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly llmImportParser: LlmImportParser,
  ) {}

  /**
   * Détermine l’utilisateur propriétaire de l’import : premier user en base si `user_id` absent.
   *
   * @param userIdRaw - `user_id` du JSON ou `undefined` / `null`.
   * @returns Identifiant utilisateur valide.
   * @throws {BadRequestException} Aucun user en base, format `user_id` invalide ou user introuvable.
   */
  private async resolveImportUserId(userIdRaw: unknown): Promise<number> {
    if (userIdRaw === undefined || userIdRaw === null) {
      const first = await this.prisma.prisma.user.findFirst({
        orderBy: { id: 'asc' },
      });
      if (!first) {
        throw new BadRequestException(
          'Aucun utilisateur en base : indique "user_id" dans le JSON d’import.',
        );
      }
      return first.id;
    }
    let uid: number;
    if (typeof userIdRaw === 'number' && Number.isInteger(userIdRaw)) {
      uid = userIdRaw;
    } else if (
      typeof userIdRaw === 'string' &&
      /^\d+$/.test(userIdRaw.trim())
    ) {
      uid = Number(userIdRaw.trim());
    } else {
      throw new BadRequestException('user_id doit être un entier si fourni');
    }
    const u = await this.prisma.prisma.user.findUnique({
      where: { id: uid },
    });
    if (!u) throw new BadRequestException(`Utilisateur ${uid} introuvable`);
    return u.id;
  }

  /**
   * Importe les questions après parsing ; toute la validation de forme est déjà faite.
   */
  private async persistImportPlan(
    userId: number,
    collections: LlmImportCollectionBlock[],
    questionsSansCollection: LlmImportQuestion[],
  ): Promise<{ createdQuestions: number; createdCollections: number }> {
    let createdQuestions = 0;
    let createdCollections = 0;
    const t = nowIso();

    await this.prisma.prisma.$transaction(async (tx) => {
      const addQuestion = async (
        qin: LlmImportQuestion,
        collectionId: number | null,
      ): Promise<void> => {
        const qRow = await tx.quizz_question.create({
          data: {
            user_id: userId,
            create_at: t,
            question: qin.question,
            commentaire: qin.commentaire,
          },
        });
        for (const r of qin.reponses) {
          const rep = await tx.quizz_reponse.create({
            data: {
              reponse: r.texte,
              bonne_reponse: r.correcte ? 1 : 0,
            },
          });
          await tx.quizz_question_reponse.create({
            data: {
              question_id: qRow.id,
              reponse_id: rep.id,
            },
          });
        }
        if (collectionId != null) {
          await tx.question_collection.create({
            data: {
              collection_id: collectionId,
              question_id: qRow.id,
            },
          });
        }
        createdQuestions += 1;
      };

      for (const block of collections) {
        let col = await tx.ref_collection.findFirst({
          where: { user_id: userId, nom: block.nom },
        });
        if (!col) {
          col = await tx.ref_collection.create({
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

  /**
   * Parse un corps JSON puis persiste en transaction.
   *
   * @param body - Objet JSON brut (`unknown`) validé par `LlmImportParser.parse`.
   * @returns Nombre de questions et de collections créées (collections déjà existantes ne comptent pas comme créées).
   * @throws {BadRequestException} Corps invalide, aucune question importée, ou erreur métier durant l’import.
   */
  async importQuestionsFromLlmJson(body: unknown): Promise<{
    createdQuestions: number;
    createdCollections: number;
  }> {
    const parsed = this.llmImportParser.parse(body);
    const userId = await this.resolveImportUserId(parsed.userIdRaw);

    const { createdQuestions, createdCollections } = await this.persistImportPlan(
      userId,
      parsed.collections,
      parsed.questionsSansCollection,
    );

    if (createdQuestions === 0) {
      throw new BadRequestException(
        'Aucune question importée : vérifie que tes tableaux ne sont pas vides.',
      );
    }

    return { createdQuestions, createdCollections };
  }
}
