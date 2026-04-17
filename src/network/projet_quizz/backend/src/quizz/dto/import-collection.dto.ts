import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { LlmImportReponseDto } from './import-llm.dto';

/** Import JSON “application” (export FlowLearn), distinct du format LLM. */
export class AppCollectionSummaryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  id?: number;

  @IsString()
  @MinLength(1)
  nom!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  user_id?: number;
}

export class AppCollectionImportQuestionDto {
  @IsInt()
  @Min(1)
  categorie_id!: number;

  @IsString()
  @MinLength(1)
  categorie_type!: string;

  @IsString()
  @MinLength(1)
  question!: string;

  @IsString()
  commentaire!: string;

  /** Aligné sur la colonne `verifier` ; absent ou omis dans le JSON LLM → faux. */
  @IsOptional()
  @IsBoolean()
  fakechecker?: boolean;

  @IsArray()
  @ArrayMinSize(4)
  @ValidateNested({ each: true })
  @Type(() => LlmImportReponseDto)
  reponses!: LlmImportReponseDto[];
}

export class AppCollectionImportBodyDto {
  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @IsInt()
  version?: number;

  @IsOptional()
  @IsString()
  exportedAt?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  user_id?: number;

  @ValidateNested()
  @Type(() => AppCollectionSummaryDto)
  collection!: AppCollectionSummaryDto;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AppCollectionImportQuestionDto)
  questions!: AppCollectionImportQuestionDto[];
}
