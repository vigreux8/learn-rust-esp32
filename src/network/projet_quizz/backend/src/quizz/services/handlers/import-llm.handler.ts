import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { LlmImportBodyDto, LlmImportQuestionDto } from '../../dto/import-llm.dto';
import { QuizzStructureService } from '../core/quizz-structure.service';
import { QuizzImportService } from '../quizz-import.service';

@Injectable()
export class ImportLlmHandler {
  constructor(
    private readonly importService: QuizzImportService,
    private readonly prisma: PrismaService,
    private readonly structure: QuizzStructureService,
  ) {}

  private async resolveImportUserId(userIdRaw: unknown): Promise<number> {
    if (userIdRaw === undefined || userIdRaw === null) {
      const first = await this.prisma.prisma.user.findFirst({
        orderBy: { id: 'asc' },
      });
      if (!first) {
        throw new BadRequestException(
          'Aucun utilisateur en base : indique "user_id" dans le JSON d’import.',
        );
      }
      return first.id;
    }
    let uid: number;
    if (typeof userIdRaw === 'number' && Number.isInteger(userIdRaw)) {
      uid = userIdRaw;
    } else if (
      typeof userIdRaw === 'string' &&
      /^\d+$/.test(userIdRaw.trim())
    ) {
      uid = Number(userIdRaw.trim());
    } else {
      throw new BadRequestException('user_id doit être un entier si fourni');
    }
    const u = await this.prisma.prisma.user.findUnique({
      where: { id: uid },
    });
    if (!u) throw new BadRequestException(`Utilisateur ${uid} introuvable`);
    return u.id;
  }

  private async resolveImportCategorieId(kind: 'histoire' | 'pratique'): Promise<number> {
    const row = await this.prisma.prisma.ref_p_categorie.findFirst({
      where: { type: kind },
      orderBy: { id: 'asc' },
    });
    if (!row) {
      throw new BadRequestException(
        `Catégorie "${kind}" introuvable dans ref_p_categorie — exécute le seed Prisma.`,
      );
    }
    return row.id;
  }

  private flattenParsedQuestions(
    body: LlmImportBodyDto,
  ): LlmImportQuestionDto[] {
    return [...body.collections.flatMap((b) => b.questions), ...body.questions_sans_collection];
  }

  async importQuestionsFromLlmJson(
    body: LlmImportBodyDto,
    opts?: {
      collectionId?: number;
      moduleId?: number;
      categorie?: 'histoire' | 'pratique';
    },
  ): Promise<{
    createdQuestions: number;
    createdCollections: number;
  }> {
    const userId = await this.resolveImportUserId(body.user_id);
    const categorieKind = opts?.categorie ?? 'histoire';
    const categorieId = await this.resolveImportCategorieId(categorieKind);

    if (opts?.collectionId != null) {
      const col = await this.prisma.prisma.quizz_collection.findUnique({
        where: { id: opts.collectionId },
      });
      if (!col) {
        throw new NotFoundException(`Collection ${opts.collectionId} introuvable`);
      }
      if (col.user_id !== userId) {
        throw new BadRequestException(
          `La collection ${opts.collectionId} n’appartient pas à l’utilisateur ${userId} (user_id du JSON).`,
        );
      }
      const flat = this.flattenParsedQuestions(body);
      if (flat.length === 0) {
        throw new BadRequestException(
          'Aucune question à importer : fusionne tes blocs "collections" et/ou "questions_sans_collection".',
        );
      }
      const result = await this.importService.importQuestionsFromLlmJson({
        userId,
        categorieId,
        collections: body.collections,
        questionsSansCollection: body.questions_sans_collection,
        collectionId: opts.collectionId,
      });
      if (opts.moduleId != null) {
        await this.structure.assignCollectionToModule(opts.collectionId, opts.moduleId);
      }
      return result;
    }

    const result = await this.importService.importQuestionsFromLlmJson({
      userId,
      categorieId,
      collections: body.collections,
      questionsSansCollection: body.questions_sans_collection,
    });
    if (result.createdQuestions === 0) {
      throw new BadRequestException(
        'Aucune question importée : vérifie que tes tableaux ne sont pas vides.',
      );
    }
    return result;
  }
}
