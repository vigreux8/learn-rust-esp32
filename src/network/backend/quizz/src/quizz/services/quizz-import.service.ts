import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Import transactionnel de questions/réponses au format JSON (LLM ou équivalent).
 *
 * Crée collections, questions, réponses et liaisons ; regroupe les questions orphelines
 * sous `questions_sans_collection`.
 */
@Injectable()
export class QuizzImportService {
  constructor(private readonly prisma: PrismaService) {}

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
   * Valide le tableau `reponses` d’une question : 4 entrées, exactement une correcte.
   *
   * @param reponses - Valeur brute du champ `reponses`.
   * @returns Réponses normalisées `{ texte, correcte }`.
   * @throws {BadRequestException} Structure ou règle « une bonne réponse » non respectée.
   */
  private assertImportReponses(
    reponses: unknown,
  ): { texte: string; correcte: boolean }[] {
    if (!Array.isArray(reponses) || reponses.length !== 4) {
      throw new BadRequestException(
        'Chaque question doit avoir exactement 4 réponses dans "reponses".',
      );
    }
    const out: { texte: string; correcte: boolean }[] = [];
    let correctCount = 0;
    for (const r of reponses) {
      if (!r || typeof r !== 'object') {
        throw new BadRequestException('Réponse invalide dans le tableau.');
      }
      const o = r as Record<string, unknown>;
      const texte = o.texte ?? o.reponse;
      if (typeof texte !== 'string' || !texte.trim()) {
        throw new BadRequestException('Chaque réponse doit avoir "texte" (string non vide).');
      }
      const correcte = o.correcte === true || o.bonne_reponse === 1;
      if (correcte) correctCount += 1;
      out.push({ texte: texte.trim(), correcte: Boolean(correcte) });
    }
    if (correctCount !== 1) {
      throw new BadRequestException(
        'Chaque question doit avoir exactement une réponse correcte (correcte: true).',
      );
    }
    return out;
  }

  /**
   * Parse un corps JSON, valide les collections/questions et persiste tout en une transaction.
   *
   * @param body - Objet JSON (souvent `collections`, optionnellement `questions_sans_collection`, `user_id`).
   * @returns Nombre de questions et de collections créées (collections déjà existantes ne comptent pas comme créées).
   * @throws {BadRequestException} Corps invalide, tableaux vides après parsing, ou erreur métier durant l’import.
   */
  async importQuestionsFromLlmJson(body: unknown): Promise<{
    createdQuestions: number;
    createdCollections: number;
  }> {
    if (!body || typeof body !== 'object') {
      throw new BadRequestException('Corps JSON attendu (objet).');
    }
    const b = body as Record<string, unknown>;
    const userId = await this.resolveImportUserId(b.user_id);

    type QIn = {
      question: string;
      commentaire: string;
      reponses: { texte: string; correcte: boolean }[];
    };

    const parseQuestion = (raw: unknown, ctx: string): QIn => {
      if (!raw || typeof raw !== 'object') {
        throw new BadRequestException(`${ctx} : objet question attendu.`);
      }
      const q = raw as Record<string, unknown>;
      if (typeof q.question !== 'string' || !q.question.trim()) {
        throw new BadRequestException(`${ctx} : champ "question" (string) requis.`);
      }
      const commentaire =
        typeof q.commentaire === 'string' ? q.commentaire.trim() : '';
      const reponses = this.assertImportReponses(q.reponses);
      return {
        question: q.question.trim(),
        commentaire,
        reponses,
      };
    };

    const collectionsRaw = b.collections;
    const sansRaw = b.questions_sans_collection;

    if (
      (!collectionsRaw || !Array.isArray(collectionsRaw)) &&
      (!sansRaw || !Array.isArray(sansRaw))
    ) {
      throw new BadRequestException(
        'Fournis "collections" (tableau) et/ou "questions_sans_collection" (tableau).',
      );
    }

    let createdQuestions = 0;
    let createdCollections = 0;
    const t = nowIso();

    await this.prisma.prisma.$transaction(async (tx) => {
      const addQuestion = async (
        qin: QIn,
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

      if (Array.isArray(collectionsRaw)) {
        for (let i = 0; i < collectionsRaw.length; i++) {
          const block = collectionsRaw[i];
          if (!block || typeof block !== 'object') {
            throw new BadRequestException(`collections[${i}] : objet attendu.`);
          }
          const bl = block as Record<string, unknown>;
          if (typeof bl.nom !== 'string' || !bl.nom.trim()) {
            throw new BadRequestException(
              `collections[${i}] : "nom" (string) requis.`,
            );
          }
          const nom = bl.nom.trim();
          const questions = bl.questions;
          if (!Array.isArray(questions) || questions.length === 0) {
            throw new BadRequestException(
              `collections[${i}] : "questions" doit être un tableau non vide.`,
            );
          }

          let col = await tx.ref_collection.findFirst({
            where: { user_id: userId, nom },
          });
          if (!col) {
            col = await tx.ref_collection.create({
              data: {
                user_id: userId,
                create_at: t,
                update_at: t,
                nom,
              },
            });
            createdCollections += 1;
          }

          for (let j = 0; j < questions.length; j++) {
            const qin = parseQuestion(
              questions[j],
              `collections[${i}].questions[${j}]`,
            );
            await addQuestion(qin, col.id);
          }
        }
      }

      if (Array.isArray(sansRaw)) {
        for (let k = 0; k < sansRaw.length; k++) {
          const qin = parseQuestion(
            sansRaw[k],
            `questions_sans_collection[${k}]`,
          );
          await addQuestion(qin, null);
        }
      }
    });

    if (createdQuestions === 0) {
      throw new BadRequestException(
        'Aucune question importée : vérifie que tes tableaux ne sont pas vides.',
      );
    }

    return { createdQuestions, createdCollections };
  }
}
