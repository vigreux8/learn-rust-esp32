import { Injectable } from '@nestjs/common';
import Database from 'better-sqlite3';
import { sqlitePathFromDatabaseUrl } from '../../../prisma/prisma.service';

function quoteIdentifier(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function buildJsonFilename(date = new Date()): string {
  const iso = date.toISOString().replace(/[:]/g, '-').replace(/\.\d{3}Z$/, 'Z');
  return `quizz-export-${iso}.json`;
}

@Injectable()
export class JsonExporterService {
  /**
   * Exporte toutes les tables utilisateur en JSON (données brutes + schéma léger).
   * Les clés étrangères restent exprimées par les colonnes d’id ; ce format sert surtout
   * à fusionner via une logique applicative plutôt qu’à rejouer un dump SQL.
   */
  exportDatabaseAsJson(): { filename: string; json: string } {
    const dbPath = sqlitePathFromDatabaseUrl();
    const db = new Database(dbPath, { readonly: true });

    try {
      const tableRows = db
        .prepare(
          `
            SELECT name
            FROM sqlite_master
            WHERE type = 'table'
              AND name NOT LIKE 'sqlite_%'
            ORDER BY name ASC
          `,
        )
        .all() as { name: string }[];

      const tables: Record<
        string,
        {
          columns: { name: string; type: string; notnull: number; pk: number }[];
          rows: Record<string, unknown>[];
        }
      > = {};

      for (const { name } of tableRows) {
        const columns = db.prepare(`PRAGMA table_info(${quoteIdentifier(name)})`).all() as {
          name: string;
          type: string;
          notnull: number;
          pk: number;
        }[];
        const rows = db.prepare(`SELECT * FROM ${quoteIdentifier(name)}`).all() as Record<
          string,
          unknown
        >[];
        tables[name] = { columns, rows };
      }

      const sequenceRow = db
        .prepare(
          `
            SELECT COUNT(*) as count
            FROM sqlite_master
            WHERE name = 'sqlite_sequence'
          `,
        )
        .get() as { count: number } | undefined;
      const sequenceExists = (sequenceRow?.count ?? 0) > 0;

      let sqliteSequence: { name: string; seq: number }[] | undefined;
      if (sequenceExists) {
        sqliteSequence = db.prepare('SELECT name, seq FROM sqlite_sequence ORDER BY name ASC').all() as {
          name: string;
          seq: number;
        }[];
      }

      const payload = {
        format: 'flowlearn-sqlite-dump-json',
        version: 1,
        exportedAt: new Date().toISOString(),
        databasePath: dbPath,
        tables,
        sqliteSequence,
      };

      return {
        filename: buildJsonFilename(),
        json: `${JSON.stringify(payload, null, 2)}\n`,
      };
    } finally {
      db.close();
    }
  }
}
