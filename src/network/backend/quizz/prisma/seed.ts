import 'dotenv/config';
import { resolve } from 'node:path';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/prisma/client';

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

async function clearAll(prisma: PrismaClient): Promise<void> {
  await prisma.user_kpi.deleteMany();
  await prisma.question_collection.deleteMany();
  await prisma.quizz_question_reponse.deleteMany();
  await prisma.quizz_question.deleteMany();
  await prisma.quizz_reponse.deleteMany();
  await prisma.ref_collection.deleteMany();
  await prisma.user_device.deleteMany();
  await prisma.device.deleteMany();
  await prisma.user.deleteMany();
}

type AnswerSeed = { texte: string; correcte: boolean };

async function addQuestion(
  prisma: PrismaClient,
  params: {
    userId: number;
    collectionId: number;
    question: string;
    commentaire: string;
    reponses: AnswerSeed[];
  },
): Promise<void> {
  const { userId, collectionId, question, commentaire, reponses } = params;
  const q = await prisma.quizz_question.create({
    data: {
      user_id: userId,
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

    const u1 = await prisma.user.create({ data: { pseudot: 'alice_cap' } });
    const u2 = await prisma.user.create({ data: { pseudot: 'bob_stats' } });
    const u3 = await prisma.user.create({ data: { pseudot: 'clara_ml' } });

    const d1 = await prisma.device.create({
      data: { adresse_mac: '00:1A:2B:3C:4D:01' },
    });
    const d2 = await prisma.device.create({
      data: { adresse_mac: '00:1A:2B:3C:4D:02' },
    });
    const d3 = await prisma.device.create({
      data: { adresse_mac: '00:1A:2B:3C:4D:03' },
    });

    await prisma.user_device.create({
      data: { user_id: u1.id, device_id: d1.id },
    });
    await prisma.user_device.create({
      data: { user_id: u1.id, device_id: d2.id },
    });
    await prisma.user_device.create({
      data: { user_id: u2.id, device_id: d3.id },
    });

    const t = nowIso();
    const colCasquette = await prisma.ref_collection.create({
      data: {
        user_id: u1.id,
        create_at: t,
        update_at: t,
        nom: 'Histoire de la casquette',
      },
    });

    const colStatsIA = await prisma.ref_collection.create({
      data: {
        user_id: u1.id,
        create_at: t,
        update_at: t,
        nom: 'Origine de la statistique et de l’IA',
      },
    });

    await addQuestion(prisma, {
      userId: u1.id,
      collectionId: colCasquette.id,
      question:
        'À partir de quelle période la casquette de baseball s’impose comme accessoire courant du jeu aux États-Unis ?',
      commentaire: 'Fin XIXe siècle.',
      reponses: [
        { texte: 'Fin du XIXe siècle', correcte: true },
        { texte: 'Renaissance italienne', correcte: false },
        { texte: 'Années 1960 uniquement', correcte: false },
        { texte: 'Première Guerre mondiale', correcte: false },
      ],
    });

    await addQuestion(prisma, {
      userId: u1.id,
      collectionId: colCasquette.id,
      question:
        'Comment appelle-t-on la partie rigide qui protège les yeux du soleil sur une casquette ?',
      commentaire: 'La visière.',
      reponses: [
        { texte: 'La visière', correcte: true },
        { texte: 'Le bonnet', correcte: false },
        { texte: 'Le calot', correcte: false },
        { texte: 'La jugulaire', correcte: false },
      ],
    });

    await addQuestion(prisma, {
      userId: u1.id,
      collectionId: colCasquette.id,
      question:
        'Dans quelle culture urbaine la casquette devient un marqueur de style très visible dans les années 1990 ?',
      commentaire: 'Scène hip-hop.',
      reponses: [
        { texte: 'Hip-hop', correcte: true },
        { texte: 'Punk des années 1970', correcte: false },
        { texte: 'Metal progressif', correcte: false },
        { texte: 'Disco italien', correcte: false },
      ],
    });

    await addQuestion(prisma, {
      userId: u1.id,
      collectionId: colCasquette.id,
      question:
        'Quel type de casquette est souvent associé aux chauffeurs routiers américains, avec une partie arrière en maille filet ?',
      commentaire: 'Casquette trucker.',
      reponses: [
        { texte: 'Casquette trucker', correcte: true },
        { texte: 'Casquette plate anglaise', correcte: false },
        { texte: 'Béret basque', correcte: false },
        { texte: 'Casquette de marin', correcte: false },
      ],
    });

    await addQuestion(prisma, {
      userId: u2.id,
      collectionId: colStatsIA.id,
      question:
        'Quels mathématiciens du XVIIe siècle sont associés aux premiers travaux formalisés sur les probabilités et les jeux de hasard ?',
      commentaire: 'Pascal et Fermat.',
      reponses: [
        { texte: 'Pascal et Fermat', correcte: true },
        { texte: 'Newton et Leibniz', correcte: false },
        { texte: 'Gauss et Euler', correcte: false },
        { texte: 'Bourbaki', correcte: false },
      ],
    });

    await addQuestion(prisma, {
      userId: u2.id,
      collectionId: colStatsIA.id,
      question:
        'Quel article d’Alan Turing (1950) pose la question : « Can machines think ? »',
      commentaire: 'Computing Machinery and Intelligence.',
      reponses: [
        {
          texte: 'Computing Machinery and Intelligence',
          correcte: true,
        },
        { texte: 'A Logical Calculus of Ideas', correcte: false },
        { texte: 'On Computable Numbers', correcte: false },
        { texte: 'The Perceptron', correcte: false },
      ],
    });

    await addQuestion(prisma, {
      userId: u2.id,
      collectionId: colStatsIA.id,
      question:
        'En apprentissage automatique supervisé, quel est l’objectif principal à partir d’exemples étiquetés ?',
      commentaire: 'Généraliser pour prédire sur de nouvelles données.',
      reponses: [
        {
          texte: 'Apprendre une règle qui généralise aux nouveaux cas',
          correcte: true,
        },
        { texte: 'Compresser la base sans perte', correcte: false },
        { texte: 'Maximiser le nombre de paramètres', correcte: false },
        { texte: 'Éliminer toute incertitude', correcte: false },
      ],
    });

    await addQuestion(prisma, {
      userId: u3.id,
      collectionId: colStatsIA.id,
      question:
        'Une corrélation statistique forte entre deux variables suffit-elle à prouver une relation causale ?',
      commentaire: 'Non : corrélation ≠ causalité.',
      reponses: [
        {
          texte: 'Non, la causalité demande d’autres arguments',
          correcte: true,
        },
        { texte: 'Oui, toujours', correcte: false },
        { texte: 'Oui si r > 0,9', correcte: false },
        { texte: 'Uniquement en régression linéaire', correcte: false },
      ],
    });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
