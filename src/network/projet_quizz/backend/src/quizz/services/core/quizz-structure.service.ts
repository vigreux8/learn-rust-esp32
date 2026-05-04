import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Liens « étiquette / hashtag » entre collections (`collection_tag_lien`),
 * distincts de l’arborescence (`relation-collection`).
 */
@Injectable()
export class QuizzStructureService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Rattache une collection « tag » à une collection cible (many-to-many).
   * `tag_collection_id` désigne la collection servant d’étiquette (ex. thématique partagée).
   */
  async assignCollectionTag(
    tagCollectionId: number,
    taggedCollectionId: number,
  ): Promise<void> {
    if (tagCollectionId === taggedCollectionId) {
      throw new BadRequestException(
        'Une collection ne peut pas être étiquetée par elle-même.',
      );
    }
    const tagCol = await this.prisma.prisma.quizz_collection.findUnique({
      where: { id: tagCollectionId },
    });
    const taggedCol = await this.prisma.prisma.quizz_collection.findUnique({
      where: { id: taggedCollectionId },
    });
    if (!tagCol) {
      throw new NotFoundException(`Collection étiquette ${tagCollectionId} introuvable`);
    }
    if (!taggedCol) {
      throw new NotFoundException(`Collection ${taggedCollectionId} introuvable`);
    }
    const existing = await this.prisma.prisma.collection_tag_lien.findFirst({
      where: {
        tag_collection_id: tagCollectionId,
        tagged_collection_id: taggedCollectionId,
      },
    });
    if (existing) return;
    await this.prisma.prisma.collection_tag_lien.create({
      data: {
        tag_collection_id: tagCollectionId,
        tagged_collection_id: taggedCollectionId,
      },
    });
  }

  async unassignCollectionTag(
    tagCollectionId: number,
    taggedCollectionId: number,
  ): Promise<void> {
    const del = await this.prisma.prisma.collection_tag_lien.deleteMany({
      where: {
        tag_collection_id: tagCollectionId,
        tagged_collection_id: taggedCollectionId,
      },
    });
    if (del.count === 0) {
      throw new NotFoundException(
        `Aucun lien étiquette entre ${tagCollectionId} et ${taggedCollectionId}`,
      );
    }
  }

  /**
   * Crée une collection utilisateur et la rattache à une collection-étiquette.
   */
  async createCollectionWithTag(params: {
    tagCollectionId: number;
    userId: number;
    nom: string;
  }): Promise<{
    collectionId: number;
    tagCollectionId: number;
    nom: string;
    create_at: string;
    update_at: string;
  }> {
    const tagCol = await this.prisma.prisma.quizz_collection.findUnique({
      where: { id: params.tagCollectionId },
    });
    if (!tagCol) {
      throw new NotFoundException(
        `Collection étiquette ${params.tagCollectionId} introuvable`,
      );
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
      await tx.collection_tag_lien.create({
        data: {
          tag_collection_id: params.tagCollectionId,
          tagged_collection_id: col.id,
        },
      });
      return {
        collectionId: col.id,
        tagCollectionId: params.tagCollectionId,
        nom: col.nom,
        create_at: col.create_at,
        update_at: col.update_at,
      };
    });
  }

  /**
   * Crée une collection vide (sans questions), optionnellement liée à une collection-étiquette.
   */
  async createStandaloneCollection(params: {
    userId: number;
    nom: string;
    tagCollectionId?: number;
  }): Promise<{ collectionId: number }> {
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
    if (params.tagCollectionId != null) {
      const tag = await this.prisma.prisma.quizz_collection.findUnique({
        where: { id: params.tagCollectionId },
      });
      if (!tag) {
        throw new NotFoundException(
          `Collection étiquette ${params.tagCollectionId} introuvable`,
        );
      }
    }
    const t = nowIso();
    const col = await this.prisma.prisma.$transaction(async (tx) => {
      const c = await tx.quizz_collection.create({
        data: {
          user_id: params.userId,
          create_at: t,
          update_at: t,
          nom: trimmed,
        },
      });
      if (params.tagCollectionId != null) {
        await tx.collection_tag_lien.create({
          data: {
            tag_collection_id: params.tagCollectionId,
            tagged_collection_id: c.id,
          },
        });
      }
      return c;
    });
    return { collectionId: col.id };
  }
}
