import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminController } from './admin.controller';
import {
  AdminService,
  FormatV1Strategy,
  JsonExporterService,
  MergeOrchestratorService,
  SqlExporterService,
  SqlReplaceService,
} from './services';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [
    SqlExporterService,
    JsonExporterService,
    SqlReplaceService,
    FormatV1Strategy,
    MergeOrchestratorService,
    AdminService,
  ],
})
export class AdminModule {}
