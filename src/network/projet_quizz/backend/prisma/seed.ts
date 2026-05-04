import 'dotenv/config';
import { resolve } from 'node:path';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';

function sqliteUrlFromEnv(): string {
  const raw = process.env.DATABASE_URL ?? 'file:quizz.db';
  const stripped = raw.replace(/^"|"$/g, '').trim();
  if (stripped.startsWith('file:')) {
    const pathPart = stripped.slice('file:'.length);
    if (pathPart.startsWith('/')) return `file:${pathPart}`;
    return `file:${resolve(process.cwd(), pathPart)}`;
  }
  return `file:${resolve(process.cwd(), stripped)}`;
}

function prismaClient(): PrismaClient {
  const adapter = new PrismaBetterSqlite3({
    url: sqliteUrlFromEnv(),
  });
  return new PrismaClient({ adapter });
}

function nowIso(): string {
  return new Date().toISOString();
}

/** Même valeur que `DEMO_DEVICE_MAC` côté frontend (`src/lib/config.ts`). */
const SEED_DEMO_DEVICE_MAC = 'DE:AD:BE:EF:00:01';

async function clearAll(prisma: PrismaClient): Promise<void> {
  await prisma.user_kpi.deleteMany();
  await prisma.question_reflexion.deleteMany();
  await prisma.relation_question_implicite.deleteMany();
  await prisma.quizz_question_reponse.deleteMany();
  await prisma.question_collection.deleteMany();
  await prisma.quizz_question.deleteMany();
  await prisma.personnalite_collection.deleteMany();
  await prisma.personalite.deleteMany();
  await prisma.relation_collection.deleteMany();
  await prisma.relation_categorie.deleteMany();
  await prisma.groupe_questions.deleteMany();
  await prisma.ref_importance_personalite.deleteMany();
  await prisma.ref_e_categorie.deleteMany();
  await prisma.ref_p_categorie.deleteMany();
  await prisma.ref_importance.deleteMany();
  await prisma.ref_difficulter.deleteMany();
  await prisma.quizz_module_collection.deleteMany();
  await prisma.quizz_collection.deleteMany();
  await prisma.quizz_module.deleteMany();
  await prisma.quizz_reponse.deleteMany();
  await prisma.user_device.deleteMany();
  await prisma.device.deleteMany();
  await prisma.user.deleteMany();
}

type AnswerSeed = { texte: string; correcte: boolean };

/** Jeux de référence v4 (commentaires `ddb/v4/v4.sql` + `ddb/v4/readme.md`). */
async function seedRefTables(prisma: PrismaClient): Promise<{
  importance: { faible: { id: number }; standard: { id: number }; forte: { id: number } };
  difficulte: { facile: { id: number }; moyen: { id: number }; difficile: { id: number } };
  parent: {
    histoire: { id: number };
    pratique: { id: number };
    connaissance: { id: number };
  };
  enfant: {
    contexte: { id: number };
    date: { id: number };
    choix: { id: number };
    formule: { id: number };
  };
  importancePerso: {
    pionnier: { id: number };
    important: { id: number };
    secondaire: { id: number };
  };
}> {
  const [impFaible, impStd, impForte] = await Promise.all([
    prisma.ref_importance.create({ data: { lvl: 'faible' } }),
    prisma.ref_importance.create({ data: { lvl: 'standard' } }),
    prisma.ref_importance.create({ data: { lvl: 'forte' } }),
  ]);
  const [difFacile, difMoyen, difDur] = await Promise.all([
    prisma.ref_difficulter.create({ data: { lvl: 'facile' } }),
    prisma.ref_difficulter.create({ data: { lvl: 'moyen' } }),
    prisma.ref_difficulter.create({ data: { lvl: 'difficile' } }),
  ]);

  const catHistoire = await prisma.ref_p_categorie.create({
    data: {
      type: 'histoire',
      description:
        'Contexte de création : quand, pourquoi et par qui ? (readme v4 — catégorie parente).',
    },
  });
  const catPratique = await prisma.ref_p_categorie.create({
    data: {
      type: 'pratique',
      description:
        'Situations où il faut choisir la bonne solution (readme v4 — catégorie parente).',
    },
  });
  const catConnaissance = await prisma.ref_p_categorie.create({
    data: {
      type: 'connaissance',
      description:
        'À quoi ça sert, comment l’utiliser, rôle des variables dans une formule (readme v4 — catégorie parente).',
    },
  });

  const eContexte = await prisma.ref_e_categorie.create({
    data: {
      type: 'contexte',
      description:
        'Questions regroupées autour du contexte (enfant de « histoire », readme v4).',
    },
  });
  const eDate = await prisma.ref_e_categorie.create({
    data: {
      type: 'date',
      description:
        'Repères temporels et chronologie (enfant de « histoire », readme v4).',
    },
  });
  const eChoix = await prisma.ref_e_categorie.create({
    data: {
      type: 'choix',
      description:
        'Décision parmi plusieurs options en situation (enfant de « pratique », readme v4).',
    },
  });
  const eFormule = await prisma.ref_e_categorie.create({
    data: {
      type: 'formule',
      description:
        'Variables, formules et mise en œuvre (enfant de « connaissance », readme v4).',
    },
  });

  await prisma.relation_categorie.createMany({
    data: [
      { p_categorie: catHistoire.id, e_categorie: eContexte.id },
      { p_categorie: catHistoire.id, e_categorie: eDate.id },
      { p_categorie: catPratique.id, e_categorie: eChoix.id },
      { p_categorie: catConnaissance.id, e_categorie: eFormule.id },
    ],
  });

  const [persoPionnier, persoImportant, persoSecondaire] = await Promise.all([
    prisma.ref_importance_personalite.create({ data: { type: 'pionnier' } }),
    prisma.ref_importance_personalite.create({ data: { type: 'important' } }),
    prisma.ref_importance_personalite.create({ data: { type: 'secondaire' } }),
  ]);

  return {
    importance: {
      faible: impFaible,
      standard: impStd,
      forte: impForte,
    },
    difficulte: {
      facile: difFacile,
      moyen: difMoyen,
      difficile: difDur,
    },
    parent: {
      histoire: catHistoire,
      pratique: catPratique,
      connaissance: catConnaissance,
    },
    enfant: {
      contexte: eContexte,
      date: eDate,
      choix: eChoix,
      formule: eFormule,
    },
    importancePerso: {
      pionnier: persoPionnier,
      important: persoImportant,
      secondaire: persoSecondaire,
    },
  };
}

async function addQuestion(
  prisma: PrismaClient,
  params: {
    userId: number;
    categoriePId: number;
    collectionId: number;
    question: string;
    commentaire: string;
    reponses: AnswerSeed[];
    importanceId?: number | null;
    difficulterId?: number | null;
    categorieEId?: number | null;
  },
): Promise<void> {
  const {
    userId,
    categoriePId,
    collectionId,
    question,
    commentaire,
    reponses,
    importanceId,
    difficulterId,
    categorieEId,
  } = params;
  const q = await prisma.quizz_question.create({
    data: {
      user_id: userId,
      categorie_p_id: categoriePId,
      categorie_e_id: categorieEId ?? undefined,
      importance_id: importanceId ?? undefined,
      difficulter_id: difficulterId ?? undefined,
      create_at: nowIso(),
      question,
      commentaire,
      verifier: false,
    },
  });

  for (const r of reponses) {
    const rep = await prisma.quizz_reponse.create({
      data: {
        reponse: r.texte,
        bonne_reponse: r.correcte ? 1 : 0,
      },
    });
    await prisma.quizz_question_reponse.create({
      data: {
        question_id: q.id,
        reponse_id: rep.id,
      },
    });
  }

  await prisma.question_collection.create({
    data: {
      collection_id: collectionId,
      question_id: q.id,
    },
  });
}

async function main(): Promise<void> {
  const prisma = prismaClient();

  try {
    await clearAll(prisma);

    const refs = await seedRefTables(prisma);

    const u1 = await prisma.user.create({ data: { pseudot: 'maitre_quizz' } });
    const devDemo = await prisma.device.create({
      data: { adresse_mac: SEED_DEMO_DEVICE_MAC },
    });
    await prisma.user_device.create({
      data: { user_id: u1.id, device_id: devDemo.id },
    });
    const t = nowIso();

    const modDemo = await prisma.quizz_module.create({
      data: {
        nom: 'demo-thematique',
        create_at: t,
        update_at: t,
      },
    });

    // --- COLLECTIONS (quizz_collection) ---
    const colCasquette = await prisma.quizz_collection.create({
      data: {
        user_id: u1.id,
        create_at: t,
        update_at: t,
        nom: 'Sociologie de la Casquette',
      },
    });

    const colOrthographe = await prisma.quizz_collection.create({
      data: {
        user_id: u1.id,
        create_at: t,
        update_at: t,
        nom: 'Les Mystères de l’Orthographe',
      },
    });

    const colIA = await prisma.quizz_collection.create({
      data: {
        user_id: u1.id,
        create_at: t,
        update_at: t,
        nom: 'Intelligence Artificielle',
      },
    });

    for (const col of [colCasquette, colOrthographe, colIA]) {
      await prisma.quizz_module_collection.create({
        data: { module_id: modDemo.id, collection_id: col.id },
      });
    }

    // --- QUESTIONS : SOCIOLOGIE DE LA CASQUETTE ---

    await addQuestion(prisma, {
      userId: u1.id,
      categoriePId: refs.parent.histoire.id,
      categorieEId: refs.enfant.contexte.id,
      importanceId: refs.importance.standard.id,
      difficulterId: refs.difficulte.moyen.id,
      collectionId: colCasquette.id,
      question: "Pourquoi est-il traditionnellement jugé impoli de garder sa casquette à l'intérieur ?",
      commentaire: "Anecdote : Cela remonte à l'époque des chevaliers. Relever sa visière ou retirer son casque servait à montrer son visage pour prouver que l'on n'avait pas d'intentions hostiles. Garder son couvre-chef signifie que l'on reste 'sur ses gardes'.",
      reponses: [
        { texte: "C'est un héritage des chevaliers (signe de paix)", correcte: true },
        { texte: "Pour ne pas salir les fauteuils", correcte: false },
        { texte: "C'était une loi sous Napoléon", correcte: false },
        { texte: "Pour éviter de perdre ses cheveux", correcte: false },
      ],
    });

    await addQuestion(prisma, {
      userId: u1.id,
      categoriePId: refs.parent.histoire.id,
      categorieEId: refs.enfant.date.id,
      importanceId: refs.importance.faible.id,
      difficulterId: refs.difficulte.facile.id,
      collectionId: colCasquette.id,
      question: "Comment la casquette a-t-elle servi historiquement à séparer les classes sociales ?",
      commentaire: "Au XIXe siècle, la 'casquette plate' était l'uniforme de l'ouvrier et du paysan, tandis que le 'haut-de-forme' symbolisait la bourgeoisie. La casquette était un marqueur visuel immédiat de la classe laborieuse par opposition à l'élite.",
      reponses: [
        { texte: "Elle était le symbole de la classe ouvrière", correcte: true },
        { texte: "Elle était réservée aux nobles", correcte: false },
        { texte: "Seuls les prêtres y avaient droit", correcte: false },
        { texte: "Elle servait à cacher les visages des pauvres", correcte: false },
      ],
    });

    // --- QUESTIONS : ORTHOGRAPHE FRANÇAISE ---

    await addQuestion(prisma, {
      userId: u1.id,
      categoriePId: refs.parent.histoire.id,
      categorieEId: refs.enfant.contexte.id,
      importanceId: refs.importance.standard.id,
      difficulterId: refs.difficulte.moyen.id,
      collectionId: colOrthographe.id,
      question: "Pourquoi l'orthographe française contient-elle tant de lettres muettes (comme dans 'sept' ou 'temps') ?",
      commentaire: "Les savants de la Renaissance ont ajouté des lettres 'étymologiques' pour rappeler les racines latines et grecques des mots. Par exemple, le 'p' de 'sept' (septem) a été ajouté pour que le mot ressemble visuellement à son origine latine.",
      reponses: [
        { texte: "Pour rappeler les origines latines et grecques", correcte: true },
        { texte: "Pour rallonger les lignes dans les livres", correcte: false },
        { texte: "C'est une erreur des premiers imprimeurs", correcte: false },
        { texte: "Pour rendre la lecture plus lente", correcte: false },
      ],
    });

    await addQuestion(prisma, {
      userId: u1.id,
      categoriePId: refs.parent.histoire.id,
      categorieEId: refs.enfant.date.id,
      importanceId: refs.importance.forte.id,
      difficulterId: refs.difficulte.difficile.id,
      collectionId: colOrthographe.id,
      question: "Quelle était l'une des raisons pour lesquelles l'Académie française a refusé de simplifier l'orthographe au XVIIIe siècle ?",
      commentaire: "L'Académie a écrit en 1740 qu'elle voulait que l'orthographe 'distingue les gens de lettres d'avec les ignorants'. Une orthographe difficile était donc un outil pour séparer l'élite instruite du peuple.",
      reponses: [
        { texte: "Pour distinguer l'élite instruite du peuple", correcte: true },
        { texte: "Par manque de budget pour réimprimer les livres", correcte: false },
        { texte: "Parce que le Roi aimait les lettres muettes", correcte: false },
        { texte: "Parce que le papier coûtait trop cher", correcte: false },
      ],
    });

    // --- QUESTIONS : INTELLIGENCE ARTIFICIELLE ---

    await addQuestion(prisma, {
      userId: u1.id,
      categoriePId: refs.parent.histoire.id,
      categorieEId: refs.enfant.date.id,
      importanceId: refs.importance.forte.id,
      difficulterId: refs.difficulte.difficile.id,
      collectionId: colIA.id,
      question: "Quel événement de 2011 a prouvé que l'IA Watson d'IBM pouvait comprendre le langage humain complexe ?",
      commentaire: "Watson a battu les plus grands champions du jeu télévisé 'Jeopardy!'. Contrairement aux échecs, ce jeu nécessite de comprendre les jeux de mots, les métaphores et l'ironie.",
      reponses: [
        { texte: "Sa victoire au jeu Jeopardy!", correcte: true },
        { texte: "Son élection au Sénat américain", correcte: false },
        { texte: "Sa réussite au test du permis de conduire", correcte: false },
        { texte: "Sa création d'une symphonie originale", correcte: false },
      ],
    });

    await addQuestion(prisma, {
      userId: u1.id,
      categoriePId: refs.parent.pratique.id,
      categorieEId: refs.enfant.choix.id,
      importanceId: refs.importance.standard.id,
      difficulterId: refs.difficulte.moyen.id,
      collectionId: colIA.id,
      question:
        "Tu rédiges un mail professionnel : dans quel cas utiliser plutôt un modèle génératif type ChatGPT pour un premier jet, sans le copier-coller tel quel ?",
      commentaire:
        "Cas pratique : le bon usage est le brouillon assisté puis relecture humaine (ton, exactitude, confidentialité). Copier-coller aveugle risque erreurs et fuites.",
      reponses: [
        {
          texte: "Pour un brouillon à retravailler soi-même (ton, faits, confident)",
          correcte: true,
        },
        { texte: "Pour envoyer tel quel sans relecture si le mail est court", correcte: false },
        { texte: "Uniquement si le destinataire utilise aussi l’IA", correcte: false },
        { texte: "Jamais : l’IA est interdite en entreprise", correcte: false },
      ],
    });

    await addQuestion(prisma, {
      userId: u1.id,
      categoriePId: refs.parent.connaissance.id,
      categorieEId: refs.enfant.formule.id,
      importanceId: refs.importance.faible.id,
      difficulterId: refs.difficulte.facile.id,
      collectionId: colIA.id,
      question:
        'Dans la loi d’Ohm U = R × I, que représente le symbole « R » si U est en volts et I en ampères ?',
      commentaire:
        'Exemple « connaissance / formule » (readme v4) : relier les grandeurs et leur rôle dans une expression.',
      reponses: [
        { texte: 'La résistance du dipôle, en ohms (Ω)', correcte: true },
        { texte: 'La puissance en watts', correcte: false },
        { texte: 'La charge du condensateur', correcte: false },
        { texte: 'La fréquence du signal', correcte: false },
      ],
    });

    console.log(
      [
        `Seed v4 complété : appareil démo ${SEED_DEMO_DEVICE_MAC} → user "${u1.pseudot}", 7 questions.`,
        `Référentiels : ref_importance (${Object.keys(refs.importance).length}), ref_difficulter (${Object.keys(refs.difficulte).length}),`,
        `ref_p_categorie (histoire, pratique, connaissance), ref_e_categorie + relation_categorie,`,
        `ref_importance_personalite (${Object.keys(refs.importancePerso).length}).`,
      ].join(' '),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});