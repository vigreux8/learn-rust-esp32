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
