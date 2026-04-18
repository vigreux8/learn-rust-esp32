import { Injectable } from '@nestjs/common';
import type Database from 'better-sqlite3';

export type JsonTableDump = {
  columns: { name: string; type: string; notnull: number; pk: number }[];
  rows: Record<string, unknown>[];
};

export type FlowlearnSqliteJsonDumpV1 = {
  format: string;
  version: number;
  exportedAt?: string;
  databasePath?: string;
  tables: Record<string, JsonTableDump>;
  sqliteSequence?: { name: string; seq: number }[];
};

export type JsonMergeResult = {
  insertedRows: number;
  skippedRows: number;
  remappedIds: number;
  warnings: string[];
};

type FkRef = { from: string; table: string; fromCol: string; toCol: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertFlowlearnJsonDumpV1(payload: unknown): FlowlearnSqliteJsonDumpV1 {
  if (!isRecord(payload)) throw new Error('JSON invalide : objet racine attendu');
  if (payload.format !== 'flowlearn-sqlite-dump-json') {
    throw new Error(`JSON invalide : format "${String(payload.format)}" inconnu`);
  }
  if (payload.version !== 1) throw new Error(`JSON invalide : version ${String(payload.version)} non supportée`);
  if (!isRecord(payload.tables)) throw new Error('JSON invalide : champ "tables" manquant');

  for (const [tableName, dump] of Object.entries(payload.tables)) {
    if (!isRecord(dump)) throw new Error(`JSON invalide : table "${tableName}" mal formée`);
    if (!Array.isArray(dump.columns)) throw new Error(`JSON invalide : colonnes manquantes pour "${tableName}"`);
    if (!Array.isArray(dump.rows)) throw new Error(`JSON invalide : lignes manquantes pour "${tableName}"`);
  }

  return payload as FlowlearnSqliteJsonDumpV1;
}

function quoteIdentifier(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function sqlLiteral(value: unknown): string {
  if (value == null) return 'NULL';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
  if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
    return `X'${Buffer.from(value as Uint8Array).toString('hex')}'`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

function topoSortTables(tableNames: string[], edges: Array<[string, string]>): string[] {
  const nodes = new Set(tableNames);
  const incoming = new Map<string, number>();
  const adj = new Map<string, Set<string>>();

  for (const n of nodes) {
    incoming.set(n, 0);
    adj.set(n, new Set());
  }

  for (const [from, to] of edges) {
    if (!nodes.has(from) || !nodes.has(to)) continue;
    adj.get(from)!.add(to);
    incoming.set(to, (incoming.get(to) ?? 0) + 1);
  }

  const queue: string[] = [];
  for (const n of nodes) {
    if ((incoming.get(n) ?? 0) === 0) queue.push(n);
  }
  queue.sort((a, b) => a.localeCompare(b));

  const out: string[] = [];
  while (queue.length > 0) {
    const n = queue.shift()!;
    out.push(n);
    const nexts = [...adj.get(n)!].sort((a, b) => a.localeCompare(b));
    for (const m of nexts) {
      const prev = incoming.get(m) ?? 0;
      const next = prev - 1;
      incoming.set(m, next);
      if (next === 0) {
        queue.push(m);
        queue.sort((a, b) => a.localeCompare(b));
      }
    }
  }

  if (out.length !== nodes.size) {
    return [...tableNames].sort((a, b) => a.localeCompare(b));
  }
  return out;
}

function readForeignKeys(db: Database.Database, table: string): FkRef[] {
  const rows = db.prepare(`PRAGMA foreign_key_list(${quoteIdentifier(table)})`).all() as {
    id: number;
    seq: number;
    table: string;
    from: string;
    to: string;
  }[];

  const byId = new Map<number, FkRef[]>();
  for (const row of rows) {
    const list = byId.get(row.id) ?? [];
    list.push({ from: table, table: row.table, fromCol: row.from, toCol: row.to });
    byId.set(row.id, list);
  }

  const out: FkRef[] = [];
  for (const list of byId.values()) {
    list.sort((a, b) => a.fromCol.localeCompare(b.fromCol));
    out.push(...list);
  }
  return out;
}

function getPrimaryKeyColumn(tableInfo: { name: string; pk: number }[]): string | null {
  const pkCols = tableInfo.filter((c) => c.pk > 0).sort((a, b) => a.pk - b.pk);
  if (pkCols.length !== 1) return null;
  return pkCols[0]!.name;
}

function findUserIdByPseudot(db: Database.Database, pseudot: string): number | null {
  const row = db.prepare(`SELECT id FROM user WHERE pseudot = ?`).get(pseudot) as { id: number } | undefined;
  return row?.id ?? null;
}

function findDeviceIdByMac(db: Database.Database, mac: string): number | null {
  const row = db
    .prepare(`SELECT id FROM device WHERE adresse_mac = ?`)
    .get(mac) as { id: number } | undefined;
  return row?.id ?? null;
}

function findRefCategorieIdByType(db: Database.Database, type: string): number | null {
  const row = db
    .prepare(`SELECT id FROM ref_categorie WHERE type = ?`)
    .get(type) as { id: number } | undefined;
  return row?.id ?? null;
}

function findCollectionIdByOwnerAndName(db: Database.Database, userId: number, nom: string): number | null {
  const row = db
    .prepare(`SELECT id FROM quizz_collection WHERE user_id = ? AND nom = ?`)
    .get(userId, nom) as { id: number } | undefined;
  return row?.id ?? null;
}

function findQuizzModuleIdByName(db: Database.Database, nom: string): number | null {
  const row = db.prepare(`SELECT id FROM quizz_module WHERE nom = ?`).get(nom) as { id: number } | undefined;
  return row?.id ?? null;
}

function nextAutoincrementId(db: Database.Database, table: string, pkCol: string): number {
  const row = db
    .prepare(`SELECT IFNULL(MAX(${quoteIdentifier(pkCol)}), 0) + 1 AS next_id FROM ${quoteIdentifier(table)}`)
    .get() as { next_id: number };
  return row.next_id;
}

function buildInsertSql(table: string, cols: string[], values: unknown[]): string {
  const colSql = cols.map((c) => quoteIdentifier(c)).join(', ');
  const valSql = values.map(sqlLiteral).join(', ');
  return `INSERT INTO ${quoteIdentifier(table)} (${colSql}) VALUES (${valSql})`;
}

@Injectable()
export class FormatV1Strategy {
  merge(db: Database.Database, payloadRaw: unknown): JsonMergeResult {
    const payload = assertFlowlearnJsonDumpV1(payloadRaw);

    const warnings: string[] = [];
    let insertedRows = 0;
    let skippedRows = 0;
    let remappedIds = 0;

    const importedTables = payload.tables;
    const tableNames = Object.keys(importedTables).sort((a, b) => a.localeCompare(b));

    const edges: Array<[string, string]> = [];
    for (const t of tableNames) {
      for (const fk of readForeignKeys(db, t)) {
        edges.push([fk.table, t]);
      }
    }

    const insertOrder = topoSortTables(tableNames, edges);
    const idMap = new Map<string, Map<number, number>>();

    const getMap = (table: string): Map<number, number> => {
      const existing = idMap.get(table);
      if (existing) return existing;
      const created = new Map<number, number>();
      idMap.set(table, created);
      return created;
    };

    const mapId = (table: string, oldId: number | null | undefined): number | null => {
      if (oldId == null) return null;
      const mapped = getMap(table).get(oldId);
      return mapped ?? oldId;
    };

    const remapRowValues = (table: string, row: Record<string, unknown>): Record<string, unknown> => {
      const out: Record<string, unknown> = { ...row };
      for (const fk of readForeignKeys(db, table)) {
        const raw = out[fk.fromCol];
        if (typeof raw !== 'number' || !Number.isFinite(raw)) continue;
        const mapped = mapId(fk.table, raw);
        if (mapped !== raw) remappedIds += 1;
        out[fk.fromCol] = mapped;
      }

      if (table === 'quizz_question') {
        const rawCat = out.categorie_id;
        if (typeof rawCat === 'number') {
          const importedCatRow = importedTables.ref_categorie?.rows.find((r) => r.id === rawCat) as
            | { type?: unknown }
            | undefined;
          const type = typeof importedCatRow?.type === 'string' ? importedCatRow.type : null;
          if (type) {
            const localId = findRefCategorieIdByType(db, type);
            if (localId != null && localId !== rawCat) {
              out.categorie_id = localId;
              remappedIds += 1;
            }
          }
        }
      }

      return out;
    };

    const insertOrResolveRow = (
      table: string,
      row: Record<string, unknown>,
    ): 'inserted' | 'skipped' | 'mapped' => {
      const dump = importedTables[table];
      if (!dump) return 'skipped';

      const pkCol = getPrimaryKeyColumn(dump.columns);
      const pkMap = pkCol ? getMap(table) : null;

      if (table === 'user') {
        const oldId = typeof row.id === 'number' ? row.id : null;
        const pseudot = typeof row.pseudot === 'string' ? row.pseudot : '';
        if (!pseudot) return 'skipped';
        const existingId = findUserIdByPseudot(db, pseudot);
        if (existingId != null) {
          if (oldId != null) pkMap?.set(oldId, existingId);
          return 'mapped';
        }
        const cols = Object.keys(row);
        const vals = cols.map((c) => row[c]);
        db.exec(buildInsertSql(table, cols, vals));
        if (oldId != null && pkCol) {
          const newRow = db.prepare(`SELECT last_insert_rowid() AS id`).get() as { id: number };
          pkMap?.set(oldId, newRow.id);
        }
        return 'inserted';
      }

      if (table === 'device') {
        const oldId = typeof row.id === 'number' ? row.id : null;
        const mac = typeof row.adresse_mac === 'string' ? row.adresse_mac : '';
        if (!mac) return 'skipped';
        const existingId = findDeviceIdByMac(db, mac);
        if (existingId != null) {
          if (oldId != null) pkMap?.set(oldId, existingId);
          return 'mapped';
        }
        const cols = Object.keys(row);
        const vals = cols.map((c) => row[c]);
        db.exec(buildInsertSql(table, cols, vals));
        if (oldId != null && pkCol) {
          const newRow = db.prepare(`SELECT last_insert_rowid() AS id`).get() as { id: number };
          pkMap?.set(oldId, newRow.id);
        }
        return 'inserted';
      }

      if (table === 'ref_categorie') {
        const oldId = typeof row.id === 'number' ? row.id : null;
        const type = typeof row.type === 'string' ? row.type : '';
        if (!type) return 'skipped';
        const existingId = findRefCategorieIdByType(db, type);
        if (existingId != null) {
          if (oldId != null) pkMap?.set(oldId, existingId);
          return 'mapped';
        }
        const cols = Object.keys(row);
        const vals = cols.map((c) => row[c]);
        db.exec(buildInsertSql(table, cols, vals));
        if (oldId != null && pkCol) {
          const newRow = db.prepare(`SELECT last_insert_rowid() AS id`).get() as { id: number };
          pkMap?.set(oldId, newRow.id);
        }
        return 'inserted';
      }

      if (table === 'quizz_collection') {
        const oldId = typeof row.id === 'number' ? row.id : null;
        const userId = typeof row.user_id === 'number' ? row.user_id : null;
        const nom = typeof row.nom === 'string' ? row.nom : '';
        if (userId == null || !nom) return 'skipped';
        const existingId = findCollectionIdByOwnerAndName(db, userId, nom);
        if (existingId != null) {
          if (oldId != null) pkMap?.set(oldId, existingId);
          return 'mapped';
        }
        const cols = Object.keys(row);
        const vals = cols.map((c) => row[c]);
        db.exec(buildInsertSql(table, cols, vals));
        if (oldId != null && pkCol) {
          const newRow = db.prepare(`SELECT last_insert_rowid() AS id`).get() as { id: number };
          pkMap?.set(oldId, newRow.id);
        }
        return 'inserted';
      }

      if (table === 'quizz_module') {
        const oldId = typeof row.id === 'number' ? row.id : null;
        const nom = typeof row.nom === 'string' ? row.nom : '';
        if (!nom) return 'skipped';
        const existingId = findQuizzModuleIdByName(db, nom);
        if (existingId != null) {
          if (oldId != null) pkMap?.set(oldId, existingId);
          return 'mapped';
        }
        const cols = Object.keys(row);
        const vals = cols.map((c) => row[c]);
        db.exec(buildInsertSql(table, cols, vals));
        if (oldId != null && pkCol) {
          const newRow = db.prepare(`SELECT last_insert_rowid() AS id`).get() as { id: number };
          pkMap?.set(oldId, newRow.id);
        }
        return 'inserted';
      }

      if (pkCol) {
        const oldPk = typeof row[pkCol] === 'number' ? (row[pkCol] as number) : null;
        if (oldPk != null) {
          const nextId = nextAutoincrementId(db, table, pkCol);
          if (nextId !== oldPk) remappedIds += 1;
          const remapped = { ...row, [pkCol]: nextId };
          const cols = Object.keys(remapped);
          const vals = cols.map((c) => remapped[c]);
          db.exec(buildInsertSql(table, cols, vals));
          pkMap?.set(oldPk, nextId);
          return 'inserted';
        }
      }

      const cols = Object.keys(row);
      const vals = cols.map((c) => row[c]);
      db.exec(buildInsertSql(table, cols, vals));
      return 'inserted';
    };

    db.exec('PRAGMA foreign_keys = OFF');
    db.exec('BEGIN IMMEDIATE');
    try {
      for (const table of insertOrder) {
        const dump = importedTables[table];
        if (!dump) continue;
        for (const rawRow of dump.rows) {
          const row = remapRowValues(table, rawRow);
          try {
            const outcome = insertOrResolveRow(table, row);
            if (outcome === 'inserted') insertedRows += 1;
            if (outcome === 'skipped' || outcome === 'mapped') skippedRows += 1;
          } catch (e) {
            skippedRows += 1;
            warnings.push(`${table}: ${e instanceof Error ? e.message : String(e)}`);
            if (warnings.length >= 25) break;
          }
        }
        if (warnings.length >= 25) break;
      }

      if (payload.sqliteSequence && payload.sqliteSequence.length > 0) {
        const seqTable = db
          .prepare(`SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='sqlite_sequence'`)
          .get() as { count: number };
        if ((seqTable?.count ?? 0) > 0) {
          for (const seq of payload.sqliteSequence) {
            try {
              const current = db
                .prepare(`SELECT IFNULL(seq, 0) AS seq FROM sqlite_sequence WHERE name = ?`)
                .get(seq.name) as { seq: number } | undefined;
              const nextSeq = Math.max(current?.seq ?? 0, seq.seq);
              const update = db.prepare(`UPDATE sqlite_sequence SET seq = ? WHERE name = ?`).run(nextSeq, seq.name);
              if (update.changes === 0) {
                db.prepare(`INSERT INTO sqlite_sequence(name, seq) VALUES(?, ?)`).run(seq.name, nextSeq);
              }
            } catch {
              /* ignore */
            }
          }
        }
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

    return { insertedRows, skippedRows, remappedIds, warnings };
  }
}
