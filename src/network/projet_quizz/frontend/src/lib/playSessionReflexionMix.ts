import type { QuestionUi } from "../types/quizz";
import { shuffleQuestionAnswers } from "./playOrder";

export type ReflexionMixedPlaylist = {
  questions: QuestionUi[];
  /** Longueur = questions ; à l’index i, index suivant après une mauvaise réponse (sortie de suite réflexion). */
  wrongAnswerNextIndex: number[];
};

function buildWrongAnswerNextIndex(
  length: number,
  chainRanges: ReadonlyArray<{ start: number; end: number }>,
): number[] {
  const next = Array.from({ length }, (_, i) => i + 1);
  for (const { start, end } of chainRanges) {
    for (let i = start; i <= end; i++) {
      next[i] = end + 1;
    }
  }
  return next;
}

/**
 * Insère des blocs « suite réflexion » (ordre parent → enfant) entre des questions hors chaîne.
 * Les ids présents dans la chaîne sont retirés du tirage « normal » pour éviter les doublons.
 *
 * @param reflexionSharePercent — Part cible des blocs réflexion (0–100). Ex. 25 ≈ une chaîne après 3 questions hors chaîne.
 */
export function buildReflexionMixedPlaylist(args: {
  shuffledCollectionQuestions: QuestionUi[];
  chainOrderedQuestions: QuestionUi[];
  reflexionSharePercent: number;
}): ReflexionMixedPlaylist {
  const { shuffledCollectionQuestions, chainOrderedQuestions } = args;
  const shareRaw = args.reflexionSharePercent;
  const chain = chainOrderedQuestions.filter(Boolean);
  const len = shuffledCollectionQuestions.length;

  /** À chaque bloc chaîne inséré : clones + nouvel ordre des réponses (évite la même disposition quand la chaîne est rejouée plusieurs fois). */
  const chainBlockWithFreshAnswerOrder = (): QuestionUi[] =>
    chain.map((q) => ({
      ...q,
      reponses: shuffleQuestionAnswers([...q.reponses]),
    }));

  if (len === 0) {
    return { questions: [], wrongAnswerNextIndex: [] };
  }

  if (chain.length === 0 || shareRaw <= 0) {
    return {
      questions: shuffledCollectionQuestions,
      wrongAnswerNextIndex: buildWrongAnswerNextIndex(len, []),
    };
  }

  const chainIdSet = new Set(chain.map((q) => q.id));
  const normalPool = shuffledCollectionQuestions.filter((q) => !chainIdSet.has(q.id));

  if (normalPool.length === 0) {
    const block = chainBlockWithFreshAnswerOrder();
    const chainRanges = [{ start: 0, end: block.length - 1 }];
    return {
      questions: block,
      wrongAnswerNextIndex: buildWrongAnswerNextIndex(block.length, chainRanges),
    };
  }

  const share = Math.min(100, Math.max(0, shareRaw));
  let normalsBetweenChains: number;
  if (share >= 100) {
    normalsBetweenChains = 1;
  } else {
    normalsBetweenChains = Math.max(1, Math.round((100 - share) / share));
  }

  const out: QuestionUi[] = [];
  const chainRanges: { start: number; end: number }[] = [];

  const appendChain = (): void => {
    const start = out.length;
    out.push(...chainBlockWithFreshAnswerOrder());
    const end = out.length - 1;
    if (end >= start) {
      chainRanges.push({ start, end });
    }
  };

  let i = 0;
  while (i < normalPool.length) {
    const batch = Math.min(normalsBetweenChains, normalPool.length - i);
    for (let b = 0; b < batch; b++) {
      const q = normalPool[i++];
      if (q) out.push(q);
    }
    if (i < normalPool.length) {
      appendChain();
    }
  }

  return {
    questions: out,
    wrongAnswerNextIndex: buildWrongAnswerNextIndex(out.length, chainRanges),
  };
}
