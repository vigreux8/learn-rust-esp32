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

  /** Colonne `verifier` (fakechecker côté export app). */
  @IsOptional()
  @IsBoolean()
  verifier?: boolean;
}

/** Création d’une question (4 réponses, une seule correcte) avec rattachements optionnels. */
export class CreateQuestionDto {
  @IsInt()
  @Min(1)
  user_id!: number;

  @IsInt()
  @Min(1)
  categorie_id!: number;

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

  @IsOptional()
  @IsInt()
  @Min(1)
  collection_id?: number;

  /** Question parente : insère une ligne `relation_question_implicite` (parent → enfant créé). */
  @IsOptional()
  @IsInt()
  @Min(1)
  parent_question_id?: number;
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

