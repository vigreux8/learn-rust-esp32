import type { QuizzQuestionRow } from "../types/quizz";

export const LLM_PROMPT_BASE = `Tu produis un JSON STRICT (sans markdown, sans commentaires) pour l’app FlowLearn.

Structure racine :
- "user_id" (optionnel) : entier — si absent, le premier utilisateur en base est utilisé.
- "collections" (optionnel) : tableau de blocs { "nom": string, "questions": [...] }.
- "questions_sans_collection" (optionnel) : tableau de questions hors collection.

Chaque question :
- "question" : énoncé.
- "commentaire" : OBLIGATOIRE — une courte anecdote ou explication qui éclaire POURQUOI la bonne réponse est la bonne, sans recopier mot pour mot le libellé de cette réponse (le joueur ne doit pas voir la bonne réponse répétée ici).
- "reponses" : exactement 4 objets { "texte": string, "correcte": true | false } avec UNE SEULE "correcte": true.

Si "nom" d’une collection existe déjà pour cet utilisateur, les questions sont ajoutées à cette collection ; sinon une nouvelle collection est créée.

Exemple minimal :

{
  "user_id": 1,
  "collections": [
    {
      "nom": "Ma thématique",
      "questions": [
        {
          "question": "… ?",
          "commentaire": "Anecdote : …",
          "reponses": [
            { "texte": "Bonne", "correcte": true },
            { "texte": "Fausse A", "correcte": false },
            { "texte": "Fausse B", "correcte": false },
            { "texte": "Fausse C", "correcte": false }
          ]
        }
      ]
    }
  ],
  "questions_sans_collection": []
}`;

export const LLM_QUESTION_COUNT_OPTIONS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30, 40, 50,
] as const;

/** Prompt court quand une collection est sélectionnée : le JSON ne contient que des questions. */
export const LLM_PROMPT_COLLECTION = `Tu produis UN SEUL JSON valide (sans markdown, sans texte avant ou après).

L’application est déjà positionnée sur UNE collection précise : exporte uniquement une liste de questions. Elles seront toutes enregistrées dans cette collection — n’inclus aucun nom de collection, aucun tableau "collections", aucun "questions_sans_collection".

Racine :
- "questions" : tableau non vide. Chaque élément :
  - "question" : string non vide.
  - "commentaire" : string — courte anecdote ou explication pédagogique ; n’y recopie pas mot pour mot le libellé de la bonne réponse.
  - "reponses" : exactement 4 objets { "texte": string, "correcte": true | false } avec exactement une seule "correcte": true.

Exemple minimal :

{
  "questions": [
    {
      "question": "… ?",
      "commentaire": "…",
      "reponses": [
        { "texte": "Bonne réponse", "correcte": true },
        { "texte": "Fausse A", "correcte": false },
        { "texte": "Fausse B", "correcte": false },
        { "texte": "Fausse C", "correcte": false }
      ]
    }
  ]
}`;

/** Une ligne de prompt par question (énoncé seul, sans réponses). */
export function formatExistingQuestionStemsForPrompt(rows: QuizzQuestionRow[]): string {
  if (rows.length === 0) return "";
  return rows
    .map((q, i) => {
      const stem = q.question.replace(/\s+/g, " ").trim() || "(intitulé vide)";
      return `${i + 1}. ${stem}`;
    })
    .join("\n");
}
