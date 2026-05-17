import type { QuizzQuestionRow } from "../types/quizz";

/** Règles JSON communes (parseur strict + validation import). */
export const LLM_PROMPT_JSON_FORMAT_RULES = `
RÈGLES JSON OBLIGATOIRES (sinon l’import échoue) :
- Réponds avec du JSON valide uniquement : pas de \`\`\`json autour du document, pas de texte avant/après, pas de commentaires // ou /* */.
- Chaque valeur "question", "commentaire" et "texte" est UNE SEULE ligne JSON : aucun retour à la ligne littéral (caractère Enter) à l’intérieur des guillemets. Pour un saut de ligne dans le texte affiché, écris \\n (deux caractères : antislash + n).
- Échappe tous les antislashs LaTeX / commandes : \\frac, \\sin, \\cos, \\tan, \\theta, \\pi, \\text, \\circ, etc. (double antislash dans le fichier JSON).
- Chaque "texte" de réponse doit être non vide après suppression des espaces : interdit "", " ", "\\n" seul, ou une formule LaTeX perdue/coupée.
- Exactement 4 réponses par question, exactement une avec "correcte": true.
- Markdown, LaTeX ($…$, $$…$$) et extraits de code sont autorisés DANS les chaînes, mais restent sur une ligne ou avec \\n explicites — jamais de bloc multiligne hors guillemets.
- Pour du code dans "texte" : préfère une ligne courte (ex. "const vy = 12 * Math.sin(angleInRadians);") plutôt qu’un faux bloc \`\`\`ts avec de vrais sauts de ligne dans le JSON.

Exemple LaTeX correct dans une réponse :
{ "texte": "$\\\\sin(30^\\\\circ) = \\\\frac{\\\\text{Hauteur}}{\\\\text{Hypoténuse}}$", "correcte": true }

Exemple code correct dans une réponse :
{ "texte": "const vy = 12 * Math.sin(angleInRadians);", "correcte": true }`;

export const LLM_PROMPT_BASE = `Tu produis un JSON STRICT (sans bloc markdown englobant le JSON, sans commentaires) pour l’app FlowLearn.
${LLM_PROMPT_JSON_FORMAT_RULES}

Structure racine :
- "user_id" (optionnel) : entier — si absent, le premier utilisateur en base est utilisé.
- "collections" (optionnel) : tableau de blocs { "nom": string, "questions": [...] }.
- "questions_sans_collection" (optionnel) : tableau de questions hors collection.

Chaque question :
- "question" : énoncé (texte riche autorisé : Markdown, LaTeX $…$ / $$…$$, code court — toujours dans la chaîne JSON, une ligne ou \\n).
- "commentaire" : OBLIGATOIRE — courte explication pédagogique ; ne recopie pas mot pour mot la bonne réponse.
- "reponses" : exactement 4 objets { "texte": string non vide, "correcte": true | false } avec UNE SEULE "correcte": true.

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
${LLM_PROMPT_JSON_FORMAT_RULES}

L’application est déjà positionnée sur UNE collection précise : exporte uniquement une liste de questions. Elles seront toutes enregistrées dans cette collection — n’inclus aucun nom de collection, aucun tableau "collections", aucun "questions_sans_collection".

Racine :
- "questions" : tableau non vide. Chaque élément :
  - "question" : string non vide (Markdown, LaTeX $…$, code court — respecte les règles JSON ci-dessus).
  - "commentaire" : string — explication pédagogique ; ne recopie pas mot pour mot la bonne réponse.
  - "reponses" : exactement 4 objets { "texte": string non vide, "correcte": true | false } avec exactement une seule "correcte": true.

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
