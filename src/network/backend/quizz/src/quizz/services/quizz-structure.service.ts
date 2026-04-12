import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { QuizzModuleRow } from '../quizz.type';

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Création des modules (niveau « super-collection ») et rattachement des collections.
 */
@Injectable()
export class QuizzStructureService {
  constructor(private readonly prisma: PrismaService) {}

  async listModules(): Promise<QuizzModuleRow[]> {
    const rows = await this.prisma.prisma.quizz_module.findMany({
      orderBy: { id: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      nom: r.nom,
      create_at: r.create_at,
      update_at: r.update_at,
    }));
  }

  async createModule(nom: string): Promise<QuizzModuleRow> {
    const trimmed = nom.trim();
    if (!trimmed) {
      throw new BadRequestException('Le nom du module ne peut pas être vide');
    }
    const t = nowIso();
    const row = await this.prisma.prisma.quizz_module.create({
      data: { nom: trimmed, create_at: t, update_at: t },
    });
    return {
      id: row.id,
      nom: row.nom,
      create_at: row.create_at,
      update_at: row.update_at,
    };
  }

  /**
   * Crée une collection utilisateur et la rattache à un module (pont `quizz_module_collection`).
   */
  async createCollectionInModule(params: {
    moduleId: number;
    userId: number;
    nom: string;
  }): Promise<{
    collectionId: number;
    moduleId: number;
    nom: string;
    create_at: string;
    update_at: string;
  }> {
    const mod = await this.prisma.prisma.quizz_module.findUnique({
      where: { id: params.moduleId },
    });
    if (!mod) {
      throw new NotFoundException(`Module ${params.moduleId} introuvable`);
    }
    const user = await this.prisma.prisma.user.findUnique({
      where: { id: params.userId },
    });
    if (!user) {
      throw new NotFoundException(`Utilisateur ${params.userId} introuvable`);
    }
    const trimmed = params.nom.trim();
    if (!trimmed) {
      throw new BadRequestException('Le nom de la collection ne peut pas être vide');
    }
    const t = nowIso();
    return this.prisma.prisma.$transaction(async (tx) => {
      const col = await tx.quizz_collection.create({
        data: {
          user_id: params.userId,
          create_at: t,
          update_at: t,
          nom: trimmed,
        },
      });
      await tx.quizz_module_collection.create({
        data: {
          module_id: params.moduleId,
          collection_id: col.id,
        },
      });
      return {
        collectionId: col.id,
        moduleId: params.moduleId,
        nom: col.nom,
        create_at: col.create_at,
        update_at: col.update_at,
      };
    });
  }

  /**
   * Rattache une collection existante à un module (ligne `quizz_module_collection`).
   * Sans effet si le lien existe déjà.
   */
  async assignCollectionToModule(
    collectionId: number,
    moduleId: number,
  ): Promise<void> {
    const col = await this.prisma.prisma.quizz_collection.findUnique({
      where: { id: collectionId },
    });
    if (!col) {
      throw new NotFoundException(`Collection ${collectionId} introuvable`);
    }
    const mod = await this.prisma.prisma.quizz_module.findUnique({
      where: { id: moduleId },
    });
    if (!mod) {
      throw new NotFoundException(`Module ${moduleId} introuvable`);
    }
    const existing = await this.prisma.prisma.quizz_module_collection.findFirst({
      where: { collection_id: collectionId, module_id: moduleId },
    });
    if (existing) return;
    await this.prisma.prisma.quizz_module_collection.create({
      data: { module_id: moduleId, collection_id: collectionId },
    });
  }

  /**
   * Supprime un module et les lignes `quizz_module_collection` associées.
   * Les collections (`quizz_collection`) ne sont pas supprimées.
   */
  async deleteModule(moduleId: number): Promise<void> {
    const mod = await this.prisma.prisma.quizz_module.findUnique({
      where: { id: moduleId },
    });
    if (!mod) {
      throw new NotFoundException(`Module ${moduleId} introuvable`);
    }
    await this.prisma.prisma.$transaction([
      this.prisma.prisma.quizz_module_collection.deleteMany({
        where: { module_id: moduleId },
      }),
      this.prisma.prisma.quizz_module.delete({ where: { id: moduleId } }),
    ]);
  }
}
