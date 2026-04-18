import { Injectable } from '@nestjs/common';
import Database from 'better-sqlite3';
import { PrismaService, sqlitePathFromDatabaseUrl } from '../../../prisma/prisma.service';

export type SqlReplaceResult = {
  statementsExecuted: number;
};

function stripLeadingCommentsAndWhitespace(input: string): string {
  let s = input;
  while (true) {
    const trimmed = s.trimStart();
    if (trimmed.startsWith('--')) {
      const nl = trimmed.indexOf('\n');
      s = nl === -1 ? '' : trimmed.slice(nl + 1);
      continue;
    }
    if (trimmed.startsWith('/*')) {
      const end = trimmed.indexOf('*/');
      s = end === -1 ? '' : trimmed.slice(end + 2);
      continue;
    }
    return trimmed;
  }
}

/**
 * Découpe grossièrement un script SQLite en statements (séparateur `;`).
 * Suffisant pour les dumps générés par l’export interne (pas de `;` dans des chaînes).
 */
function splitSqlStatements(script: string): string[] {
  const out: string[] = [];
  let buf = '';
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < script.length; i += 1) {
    const ch = script[i]!;
    const prev = i > 0 ? script[i - 1]! : '';

    if (!inDouble && ch === "'" && prev !== '\\') {
      inSingle = !inSingle;
    } else if (!inSingle && ch === '"' && prev !== '\\') {
      inDouble = !inDouble;
    }

    if (!inSingle && !inDouble && ch === ';') {
      const stmt = buf.trim();
      if (stmt.length > 0) out.push(stmt);
      buf = '';
      continue;
    }

    buf += ch;
  }

  const tail = buf.trim();
  if (tail.length > 0) out.push(tail);
  return out;
}

function applySqlReplacementScript(db: Database.Database, script: string): SqlReplaceResult {
  const statements = splitSqlStatements(script).map((s) => stripLeadingCommentsAndWhitespace(s)).filter(Boolean);

  db.exec('PRAGMA foreign_keys = OFF');
  db.exec('BEGIN IMMEDIATE');

  let executed = 0;
  try {
    for (const stmt of statements) {
      db.exec(stmt);
      executed += 1;
    }
    db.exec('COMMIT');
  } catch (e) {
    try {
      db.exec('ROLLBACK');
    } catch {
      /* ignore */
    }
    throw e;
  } finally {
    db.exec('PRAGMA foreign_keys = ON');
  }

  return { statementsExecuted: executed };
}

@Injectable()
export class SqlReplaceService {
  constructor(private readonly prisma: PrismaService) {}

  async importDatabaseSqlReplace(script: string, confirmToken: string): Promise<SqlReplaceResult> {
    if (confirmToken.trim() !== 'REMPLACE_TOUT') {
      throw new Error('Confirmation invalide : envoyer confirm="REMPLACE_TOUT" pour exécuter un remplacement SQL.');
    }

    const dbPath = sqlitePathFromDatabaseUrl();
    const db = new Database(dbPath);

    try {
      const result = applySqlReplacementScript(db, script);
      await this.prisma.reconnect();
      return result;
    } finally {
      db.close();
    }
  }
}
