import { BadRequestException, Injectable } from '@nestjs/common';

/** Réponse normalisée après validation du JSON LLM. */
export type LlmImportReponse = { texte: string; correcte: boolean };

/** Question prête pour la couche persistance. */
export type LlmImportQuestion = {
  question: string;
  commentaire: string;
  reponses: LlmImportReponse[];
};

/** Bloc collection + ses questions validées. */
export type LlmImportCollectionBlock = {
  nom: string;
  questions: LlmImportQuestion[];
};

/**
 * Corps d’import normalisé : plus de `unknown`, uniquement des données typées.
 * `userIdRaw` reste brut : la résolution en ID (DB) est du métier côté service.
 */
export type ParsedLlmImportBody = {
  userIdRaw: unknown;
  collections: LlmImportCollectionBlock[];
  questionsSansCollection: LlmImportQuestion[];
};

/**
 * Validation et normalisation du JSON d’import LLM (aucun accès base de données).
 * Injectable pour rester aligné sur NestJS et permettre l’injection future (Logger, config, etc.).
 */
@Injectable()
export class LlmImportParser {
  private assertImportReponses(
    reponses: unknown,
    ctx: string,
  ): LlmImportReponse[] {
    if (!Array.isArray(reponses) || reponses.length !== 4) {
      throw new BadRequestException(
        `${ctx} : chaque question doit avoir exactement 4 réponses dans "reponses".`,
      );
    }
    const out: LlmImportReponse[] = [];
    let correctCount = 0;
    for (let i = 0; i < reponses.length; i++) {
      const r = reponses[i];
      if (!r || typeof r !== 'object') {
        throw new BadRequestException(`${ctx} : réponse invalide à l’index ${i}.`);
      }
      const o = r as Record<string, unknown>;
      const texte = o.texte ?? o.reponse;
      if (typeof texte !== 'string' || !texte.trim()) {
        throw new BadRequestException(
          `${ctx} : chaque réponse doit avoir "texte" (string non vide) à l’index ${i}.`,
        );
      }
      const correcte = o.correcte === true || o.bonne_reponse === 1;
      if (correcte) correctCount += 1;
      out.push({ texte: texte.trim(), correcte: Boolean(correcte) });
    }
    if (correctCount !== 1) {
      throw new BadRequestException(
        `${ctx} : exactement une réponse correcte attendue (correcte: true ou bonne_reponse: 1).`,
      );
    }
    return out;
  }

  private parseQuestion(raw: unknown, ctx: string): LlmImportQuestion {
    if (!raw || typeof raw !== 'object') {
      throw new BadRequestException(`${ctx} : objet question attendu.`);
    }
    const q = raw as Record<string, unknown>;
    if (typeof q.question !== 'string' || !q.question.trim()) {
      throw new BadRequestException(`${ctx} : champ "question" (string) requis.`);
    }
    const commentaire =
      typeof q.commentaire === 'string' ? q.commentaire.trim() : '';
    const reponses = this.assertImportReponses(q.reponses, ctx);
    return {
      question: q.question.trim(),
      commentaire,
      reponses,
    };
  }

  private parseCollectionBlocks(raw: unknown): LlmImportCollectionBlock[] {
    if (!Array.isArray(raw)) {
      return [];
    }
    const collections: LlmImportCollectionBlock[] = [];
    for (let i = 0; i < raw.length; i++) {
      const block = raw[i];
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
      const parsedQuestions: LlmImportQuestion[] = [];
      for (let j = 0; j < questions.length; j++) {
        parsedQuestions.push(
          this.parseQuestion(questions[j], `collections[${i}].questions[${j}]`),
        );
      }
      collections.push({ nom, questions: parsedQuestions });
    }
    return collections;
  }

  private parseQuestionsSansCollection(raw: unknown): LlmImportQuestion[] {
    if (!Array.isArray(raw)) {
      return [];
    }
    const out: LlmImportQuestion[] = [];
    for (let k = 0; k < raw.length; k++) {
      out.push(
        this.parseQuestion(raw[k], `questions_sans_collection[${k}]`),
      );
    }
    return out;
  }

  /**
   * Valide et normalise le corps d’import.
   *
   * @param body - Corps brut (ex. `req.body` non typé).
   * @returns Structure typée ; `userIdRaw` est résolu côté `QuizzImportService`.
   * @throws {BadRequestException} Structure JSON ou règles de surface invalides.
   */
  parse(body: unknown): ParsedLlmImportBody {
    if (!body || typeof body !== 'object') {
      throw new BadRequestException('Corps JSON attendu (objet).');
    }
    const b = body as Record<string, unknown>;
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

    return {
      userIdRaw: b.user_id,
      collections: this.parseCollectionBlocks(collectionsRaw),
      questionsSansCollection: this.parseQuestionsSansCollection(sansRaw),
    };
  }
}
