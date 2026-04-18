import { Injectable } from '@nestjs/common';
import Database from 'better-sqlite3';
import { sqlitePathFromDatabaseUrl } from '../../../prisma/prisma.service';

type SqlObjectRow = {
  type: 'table' | 'index' | 'trigger' | 'view';
  name: string;
  tbl_name: string;
  sql: string | null;
};

function quoteIdentifier(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function quoteSqlValue(value: unknown): string {
  if (value == null) return 'NULL';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
    return `X'${Buffer.from(value).toString('hex')}'`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

function buildSqlFilename(date = new Date()): string {
  const iso = date.toISOString().replace(/[:]/g, '-').replace(/\.\d{3}Z$/, 'Z');
  return `quizz-export-${iso}.sql`;
}

@Injectable()
export class SqlExporterService {
  exportDatabaseAsSql(): { filename: string; sql: string } {
    const db = new Database(sqlitePathFromDatabaseUrl(), { readonly: true });

    try {
      const objects = db
        .prepare(
          `
            SELECT type, name, tbl_name, sql
            FROM sqlite_master
            WHERE sql IS NOT NULL
              AND name NOT LIKE 'sqlite_%'
              AND type IN ('table', 'index', 'trigger', 'view')
            ORDER BY
              CASE type
                WHEN 'table' THEN 0
                WHEN 'index' THEN 1
                WHEN 'trigger' THEN 2
                WHEN 'view' THEN 3
                ELSE 4
              END,
              name ASC
          `,
        )
        .all() as SqlObjectRow[];

      const tableNames = objects.filter((row) => row.type === 'table').map((row) => row.name);

      const lines: string[] = [
        '-- Export SQL genere par FlowLearn',
        `-- Source: ${sqlitePathFromDatabaseUrl()}`,
        `-- Date: ${new Date().toISOString()}`,
        'PRAGMA foreign_keys=OFF;',
        'BEGIN TRANSACTION;',
        '',
      ];

      for (const object of objects) {
        if (object.sql == null) continue;
        lines.push(`${object.sql};`);

        if (object.type !== 'table') {
          lines.push('');
          continue;
        }

        const columnRows = db.prepare(`PRAGMA table_info(${quoteIdentifier(object.name)})`).all() as {
          name: string;
        }[];
        const columnNames = columnRows.map((row) => row.name);

        if (columnNames.length === 0) {
          lines.push('');
          continue;
        }

        const rows = db.prepare(`SELECT * FROM ${quoteIdentifier(object.name)}`).all() as Record<
          string,
          unknown
        >[];

        const quotedColumns = columnNames.map(quoteIdentifier).join(', ');
        for (const row of rows) {
          const values = columnNames.map((column) => quoteSqlValue(row[column])).join(', ');
          lines.push(
            `INSERT INTO ${quoteIdentifier(object.name)} (${quotedColumns}) VALUES (${values});`,
          );
        }

        lines.push('');
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

      if (sequenceExists) {
        const sequences = db.prepare('SELECT name, seq FROM sqlite_sequence ORDER BY name ASC').all() as {
          name: string;
          seq: number;
        }[];

        if (sequences.length > 0) {
          lines.push('-- Valeurs AUTOINCREMENT');
          for (const sequence of sequences) {
            if (!tableNames.includes(sequence.name)) continue;
            lines.push(
              `INSERT INTO sqlite_sequence (name, seq) VALUES (${quoteSqlValue(sequence.name)}, ${quoteSqlValue(sequence.seq)});`,
            );
          }
          lines.push('');
        }
      }

      lines.push('COMMIT;');
      lines.push('PRAGMA foreign_keys=ON;');
      lines.push('');

      return {
        filename: buildSqlFilename(),
        sql: lines.join('\n'),
      };
    } finally {
      db.close();
    }
  }
}
