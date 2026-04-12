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
  await prisma.question_collection.deleteMany();
  await prisma.quizz_question_reponse.deleteMany();
  await prisma.quizz_question.deleteMany();
  await prisma.quizz_module_collection.deleteMany();
  await prisma.quizz_collection.deleteMany();
  await prisma.quizz_module.deleteMany();
  await prisma.quizz_reponse.deleteMany();
  await prisma.ref_categorie.deleteMany();
  await prisma.user_device.deleteMany();
  await prisma.device.deleteMany();
  await prisma.user.deleteMany();
}

type AnswerSeed = { texte: string; correcte: boolean };

async function addQuestion(
  prisma: PrismaClient,
  params: {
    userId: number;
    categorieId: number;
    collectionId: number;
    question: string;
    commentaire: string;
    reponses: AnswerSeed[];
  },
): Promise<void> {
  const { userId, categorieId, collectionId, question, commentaire, reponses } =
    params;
  const q = await prisma.quizz_question.create({
    data: {
      user_id: userId,
      categorie_id: categorieId,
      create_at: nowIso(),
      question,
      commentaire,
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

    const catHistoire = await prisma.ref_categorie.create({
      data: { type: 'histoire' },
    });
    await prisma.ref_categorie.create({
      data: { type: 'pratique' },
    });

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
      categorieId: catHistoire.id,
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
      categorieId: catHistoire.id,
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
      categorieId: catHistoire.id,
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
      categorieId: catHistoire.id,
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
      categorieId: catHistoire.id,
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
      categorieId: catHistoire.id,
      collectionId: colIA.id,
      question: "Que signifie le 'P' dans le nom du modèle 'ChatGPT' ?",
      commentaire: "Il signifie 'Pre-trained' (Pré-entraîné). Cela veut dire que l'IA a ingéré des milliards de textes AVANT d'être capable de discuter avec vous.",
      reponses: [
        { texte: "Pre-trained (Pré-entraîné)", correcte: true },
        { texte: "Powerful (Puissant)", correcte: false },
        { texte: "Programmed (Programmé)", correcte: false },
        { texte: "Predictive (Prédictif)", correcte: false },
      ],
    });

    console.log(
      `Seed complété : appareil démo ${SEED_DEMO_DEVICE_MAC} → user "${u1.pseudot}", 6 questions.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});