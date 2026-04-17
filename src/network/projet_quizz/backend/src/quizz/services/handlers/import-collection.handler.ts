import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AppCollectionImportBodyDto } from '../../dto/import-collection.dto';
import { QuizzImportService } from '../quizz-import.service';

@Injectable()
export class ImportCollectionHandler {
  constructor(
    private readonly importService: QuizzImportService,
    private readonly prisma: PrismaService,
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

  async importAppCollectionQuestionsJson(
    body: AppCollectionImportBodyDto,
    opts?: { collectionId?: number },
  ): Promise<{
    createdQuestions: number;
  }> {
    const userId = await this.resolveImportUserId(body.user_id);
    const fromQuery = opts?.collectionId;
    const fromBody = body.collection.id;
    const targetCollectionId = fromQuery ?? fromBody;
    if (targetCollectionId == null) {
      throw new BadRequestException(
        'Indique la collection cible : query ?collectionId=… (export récent) ou collection.id dans le JSON (ancien export).',
      );
    }

    const col = await this.prisma.prisma.quizz_collection.findUnique({ where: { id: targetCollectionId } });
    if (!col) {
      throw new NotFoundException(`Collection ${targetCollectionId} introuvable`);
    }
    if (col.user_id !== userId) {
      throw new BadRequestException(
        `La collection ${targetCollectionId} n’appartient pas à l’utilisateur ${userId} (user_id du JSON).`,
      );
    }

    const legacyStrict =
      fromQuery == null &&
      fromBody != null &&
      body.collection.user_id != null;
    if (legacyStrict) {
      if (col.nom !== body.collection.nom) {
        throw new BadRequestException(
          `Le nom de collection ne correspond pas : attendu « ${col.nom} », reçu « ${body.collection.nom} ».`,
        );
      }
      if (col.user_id !== body.collection.user_id) {
        throw new BadRequestException(
          'Le champ collection.user_id ne correspond pas au propriétaire réel.',
        );
      }
    }

    for (const qin of body.questions) {
      const ref = await this.prisma.prisma.ref_categorie.findUnique({ where: { id: qin.categorie_id } });
      if (!ref) {
        throw new BadRequestException(`ref_categorie introuvable : id ${qin.categorie_id}`);
      }
      if (ref.type !== qin.categorie_type) {
        throw new BadRequestException(
          `ref_categorie ${qin.categorie_id} : type attendu « ${ref.type} », reçu « ${qin.categorie_type} ».`,
        );
      }
    }

    const result = await this.importService.importAppCollectionQuestionsJson({
      userId,
      targetCollectionId,
      questions: body.questions,
    });
    if (result.createdQuestions === 0) {
      throw new BadRequestException('Aucune question importée.');
    }
    return result;
  }
}
