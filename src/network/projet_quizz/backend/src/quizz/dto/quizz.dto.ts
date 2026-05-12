import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { LlmImportReponseDto } from './import-llm.dto';

export class PatchReflexionChainDto {
  @IsInt()
  @Min(1)
  user_id!: number;

  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  ordered_question_ids!: number[];

  /** Si absent : premier groupe de la collection (`id` croissant) ou création à la volée. */
  @IsOptional()
  @IsInt()
  @Min(1)
  groupe_questions_id?: number;

  /**
   * Couleurs de vignettes (suite ordonnée) : clés = id question, valeurs = indice 0..3
   * (palette alignée sur les bords de carte collection par profondeur).
   */
  @IsOptional()
  chain_color_levels?: Record<string, number>;
}

export class CreateGroupeQuestionsBodyDto {
  @IsInt()
  @Min(1)
  user_id!: number;

  @IsString()
  @MinLength(1)
  nom!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class PatchGroupeQuestionsBodyDto {
  @IsInt()
  @Min(1)
  user_id!: number;

  @IsString()
  @MinLength(1)
  nom!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

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

  /**
   * Enfant `ref_e_categorie.id` lié au parent courant (`relation_categorie`).
   * `null` retire l’association ; omis = inchangé sauf changement de parent (alors effacé).
   */
  @IsOptional()
  @ValidateIf((_o, value) => value !== null && value !== undefined)
  @IsInt()
  @Min(1)
  categorie_e_id?: number | null;

  /** Colonne `verifier` (fakechecker côté export app). */
  @IsOptional()
  @IsBoolean()
  verifier?: boolean;

  /** `ref_importance.id` ; `null` retire le lien sur la question. */
  @IsOptional()
  @ValidateIf((_o, value) => value !== null && value !== undefined)
  @IsInt()
  @Min(1)
  importance_id?: number | null;

  /** `ref_difficulter.id` ; `null` retire le lien sur la question. */
  @IsOptional()
  @ValidateIf((_o, value) => value !== null && value !== undefined)
  @IsInt()
  @Min(1)
  difficulter_id?: number | null;
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

export class CreateCollectionUnderTagDto {
  @IsInt()
  @Min(1)
  userId!: number;

  @IsString()
  nom!: string;
}

export class AssignCollectionTagDto {
  @IsInt()
  @Min(1)
  tagCollectionId!: number;
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
  tagCollectionId?: number;
}

/** Lier une collection existante comme enfant d’un parent (`relation-collection`). */
export class LinkCollectionParentBodyDto {
  @IsInt()
  @Min(1)
  userId!: number;

  @IsInt()
  @Min(1)
  parentId!: number;
}

/** Création d’une collection enfant (v4 : `quizz_collection` + `relation-collection`). */
export class CreateSousCollectionBodyDto {
  @IsInt()
  @Min(1)
  user_id!: number;

  @IsString()
  @MinLength(1)
  nom!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class PatchSousCollectionBodyDto {
  @IsInt()
  @Min(1)
  user_id!: number;

  @IsString()
  @MinLength(1)
  nom!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class AttachQuestionToSousCollectionBodyDto {
  @IsInt()
  @Min(1)
  user_id!: number;

  @IsInt()
  @Min(1)
  question_id!: number;
}

export class MoveQuestionCollectionBodyDto {
  @IsInt()
  @Min(1)
  user_id!: number;

  @IsInt()
  @Min(1)
  from_collection_id!: number;

  @IsInt()
  @Min(1)
  to_collection_id!: number;
}

export class CreatePersonaliteCollectionDto {
  @IsInt()
  @Min(1)
  userId!: number;

  @IsString()
  @MinLength(1)
  nom!: string;

  @IsString()
  @MinLength(1)
  prenom!: string;

  @IsInt()
  @Min(-10000)
  @Max(9999)
  naissance!: number;

  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsInt()
  @Min(-10000)
  @Max(9999)
  mort?: number | null;

  @IsString()
  resumer!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  tagCollectionId?: number;
}

export class AssignPersonaliteToCollectionDto {
  @IsInt()
  @Min(1)
  userId!: number;

  @IsInt()
  @Min(1)
  personaliteId!: number;

  /** `null` ou omis : `importance_id` NULL dans `personnalité_collection`. */
  @IsOptional()
  @ValidateIf((_o, v) => v != null && v !== '')
  @IsIn(['pionnier', 'important', 'secondaire'])
  importanceType?: 'pionnier' | 'important' | 'secondaire' | null;
}

