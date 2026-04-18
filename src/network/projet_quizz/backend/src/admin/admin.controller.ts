import { BadRequestException, Body, Controller, Get, Headers, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ImportDatabaseSqlDto } from './dto/admin.dto';
import { AdminService } from './services';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('database/export.sql')
  exportDatabaseSql(@Res({ passthrough: true }) res: Response): string {
    const dump = this.adminService.exportDatabaseAsSql();
    res.setHeader('Content-Type', 'application/sql; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${dump.filename}"`);
    return dump.sql;
  }

  @Get('database/export.json')
  exportDatabaseJson(@Res({ passthrough: true }) res: Response): string {
    const dump = this.adminService.exportDatabaseAsJson();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${dump.filename}"`);
    return dump.json;
  }

  @Post('database/import.json')
  async importDatabaseJson(@Body() body: unknown) {
    try {
      return await this.adminService.importDatabaseJsonMerge(body);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      throw new BadRequestException(message);
    }
  }

  @Post('database/import.sql')
  async importDatabaseSql(
    @Body() body: unknown,
    @Headers('x-quizz-confirm') confirmHeader?: string,
  ) {
    const confirmFromHeader = confirmHeader?.trim();
    const confirmFromBody =
      typeof body === 'object' && body !== null && 'confirm' in body
        ? String((body as { confirm?: unknown }).confirm ?? '').trim()
        : '';
    const confirm = confirmFromHeader || confirmFromBody;

    const dto = typeof body === 'object' && body !== null ? (body as Partial<ImportDatabaseSqlDto>) : undefined;
    const script =
      typeof body === 'string' ? body : typeof dto?.script === 'string' ? dto.script : '';

    if (!script.trim()) {
      throw new BadRequestException('Corps invalide : fournir le script SQL (texte brut ou champ { "script": "..." }).');
    }

    try {
      return await this.adminService.importDatabaseSqlReplace(script, confirm);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      throw new BadRequestException(message);
    }
  }
}
