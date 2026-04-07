import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async lookupDevice(adresse_mac: string) {
    const mac = adresse_mac.trim();
    if (!mac) {
      throw new BadRequestException('Query "adresse_mac" (string) requise');
    }
    const device = await this.prisma.prisma.device.findFirst({
      where: { adresse_mac: mac },
    });
    if (!device) {
      return { known: false as const };
    }
    const link = await this.prisma.prisma.user_device.findFirst({
      where: { device_id: device.id },
      include: { user: true },
    });
    if (!link?.user) {
      return { known: false as const };
    }
    return {
      known: true as const,
      user: { id: link.user.id, pseudot: link.user.pseudot },
    };
  }

  async registerDevice(
    adresse_mac: string,
    pseudot: string,
  ): Promise<{ userId: number; pseudot: string }> {
    const mac = adresse_mac.trim();
    const pseudo = pseudot.trim();
    if (!mac) {
      throw new BadRequestException('Champ "adresse_mac" (string) requis');
    }
    if (!pseudo || pseudo.length > 120) {
      throw new BadRequestException(
        'Champ "pseudot" : string non vide, 120 caractères max',
      );
    }
    const existingDev = await this.prisma.prisma.device.findFirst({
      where: { adresse_mac: mac },
    });
    if (existingDev) {
      const link = await this.prisma.prisma.user_device.findFirst({
        where: { device_id: existingDev.id },
      });
      if (link) {
        throw new ConflictException('Cet appareil est déjà associé à un compte.');
      }
    }

    const row = await this.prisma.prisma.$transaction(async (tx) => {
      let deviceId: number;
      if (existingDev) {
        deviceId = existingDev.id;
      } else {
        const d = await tx.device.create({ data: { adresse_mac: mac } });
        deviceId = d.id;
      }
      const user = await tx.user.create({ data: { pseudot: pseudo } });
      await tx.user_device.create({
        data: { user_id: user.id, device_id: deviceId },
      });
      return { userId: user.id, pseudot: user.pseudot };
    });

    return row;
  }
}
