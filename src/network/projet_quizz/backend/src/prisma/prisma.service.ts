import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { resolve } from 'node:path';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';

function sqlitePathFromDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL ?? 'file:./quizz.db';
  const stripped = raw.replace(/^"|"$/g, '').trim();
  const pathPart = stripped.startsWith('file:') ? stripped.slice('file:'.length) : stripped;
  if (pathPart.startsWith('/')) return pathPart;
  return resolve(process.cwd(), pathPart);
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  prisma!: PrismaClient;

  async onModuleInit(): Promise<void> {
    const adapter = new PrismaBetterSqlite3({ url: sqlitePathFromDatabaseUrl() });
    this.prisma = new PrismaClient({ adapter });
  }

  async onModuleDestroy(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
