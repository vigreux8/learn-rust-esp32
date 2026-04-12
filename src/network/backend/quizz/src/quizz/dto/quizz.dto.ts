import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsString()
  commentaire?: string;
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
