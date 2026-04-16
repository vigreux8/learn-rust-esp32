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

export class UpdateReponseDto {
  @IsString()
  @MinLength(1)
  reponse!: string;
}

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsString()
  commentaire?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  categorie_id?: number;
}

export class CreateQuizzModuleDto {
  @IsString()
  nom!: string;
}

export class CreateCollectionInModuleDto {
  @IsInt()
  @Min(1)
  userId!: number;

  @IsString()
  nom!: string;
}

export class AssignCollectionToModuleDto {
  @IsInt()
  @Min(1)
  moduleId!: number;
}

export class CreateStandaloneCollectionDto {
  @IsInt()
  @Min(1)
  userId!: number;

  @IsString()
  @MinLength(1)
  nom!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  moduleId?: number;
}

export class LlmImportReponseDto {
  @IsString()
  @MinLength(1)
  texte!: string;

  @IsBoolean()
  correcte!: boolean;
}

export class LlmImportQuestionDto {
  @IsString()
  @MinLength(1)
  question!: string;

  @IsString()
  commentaire!: string;

  @IsArray()
  @ArrayMinSize(4)
  @ValidateNested({ each: true })
  @Type(() => LlmImportReponseDto)
  reponses!: LlmImportReponseDto[];
}

export class LlmImportCollectionBlockDto {
  @IsString()
  @MinLength(1)
  nom!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LlmImportQuestionDto)
  questions!: LlmImportQuestionDto[];
}

export class LlmImportBodyDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  user_id?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LlmImportCollectionBlockDto)
  collections!: LlmImportCollectionBlockDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LlmImportQuestionDto)
  questions_sans_collection!: LlmImportQuestionDto[];
}

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
