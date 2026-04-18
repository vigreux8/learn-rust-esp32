import { Injectable } from '@nestjs/common';
import Database from 'better-sqlite3';
import { PrismaService, sqlitePathFromDatabaseUrl } from '../../prisma/prisma.service';
import { JsonExporterService, SqlExporterService } from './export';
import { MergeOrchestratorService, type JsonMergeResult, SqlReplaceService, type SqlReplaceResult } from './import';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sqlExporter: SqlExporterService,
    private readonly jsonExporter: JsonExporterService,
    private readonly sqlReplace: SqlReplaceService,
    private readonly jsonMergeOrchestrator: MergeOrchestratorService,
  ) {}

  exportDatabaseAsSql(): { filename: string; sql: string } {
    return this.sqlExporter.exportDatabaseAsSql();
  }

  /**
   * Exporte toutes les tables utilisateur en JSON (données brutes + schéma léger).
   * Les clés étrangères restent exprimées par les colonnes d’id ; ce format sert surtout
   * à fusionner via une logique applicative plutôt qu’à rejouer un dump SQL.
   */
  exportDatabaseAsJson(): { filename: string; json: string } {
    return this.jsonExporter.exportDatabaseAsJson();
  }

  async importDatabaseJsonMerge(payload: unknown): Promise<JsonMergeResult> {
    const dbPath = sqlitePathFromDatabaseUrl();
    const db = new Database(dbPath);

    try {
      const result = this.jsonMergeOrchestrator.merge(db, payload);
      await this.prisma.reconnect();
      return result;
    } finally {
      db.close();
    }
  }

  async importDatabaseSqlReplace(script: string, confirmToken: string): Promise<SqlReplaceResult> {
    return this.sqlReplace.importDatabaseSqlReplace(script, confirmToken);
  }
}
