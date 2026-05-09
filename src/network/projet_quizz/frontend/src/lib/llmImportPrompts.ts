import type { QuizzQuestionRow } from "../types/quizz";

export const LLM_PROMPT_BASE = `Tu produis un JSON STRICT (sans bloc markdown englobant le JSON, sans commentaires) pour l’app FlowLearn.

Structure racine :
- "user_id" (optionnel) : entier — si absent, le premier utilisateur en base est utilisé.
- "collections" (optionnel) : tableau de blocs { "nom": string, "questions": [...] }.
- "questions_sans_collection" (optionnel) : tableau de questions hors collection.

Chaque question :
- "question" : énoncé. IMPORTANT : Utilise du texte riche quand c'est pertinent : Markdown, blocs de code (ex: \`\`\`ts, \`\`\`python, \`\`\`css, etc.) et LaTeX (entoure les formules inline de $ et les blocs de $$).
- "commentaire" : OBLIGATOIRE — une courte anecdote ou explication qui éclaire POURQUOI la bonne réponse est la bonne, sans recopier mot pour mot le libellé de cette réponse. Tu peux y inclure du Markdown, du code ou du LaTeX si cela aide l'explication.
- "reponses" : exactement 4 objets { "texte": string, "correcte": true | false } avec UNE SEULE "correcte": true. Le "texte" peut lui aussi contenir du Markdown, du code court ou du LaTeX si besoin.

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
export const LLM_PROMPT_COLLECTION = `Tu produis UN SEUL JSON valide (sans bloc markdown englobant le JSON, sans texte avant ou après).

L’application est déjà positionnée sur UNE collection précise : exporte uniquement une liste de questions. Elles seront toutes enregistrées dans cette collection — n’inclus aucun nom de collection, aucun tableau "collections", aucun "questions_sans_collection".

Racine :
- "questions" : tableau non vide. Chaque élément :
  - "question" : string non vide. IMPORTANT : N'hésite pas à utiliser du texte riche (Markdown, blocs de code comme \`\`\`ts ou \`\`\`python, et LaTeX avec $ ou $$ pour les mathématiques).
  - "commentaire" : string — courte anecdote ou explication pédagogique ; n’y recopie pas mot pour mot le libellé de la bonne réponse. Tu peux aussi utiliser Markdown, code et LaTeX.
  - "reponses" : exactement 4 objets { "texte": string, "correcte": true | false } avec exactement une seule "correcte": true. Le texte peut aussi contenir du texte riche (Markdown, code, LaTeX).

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
