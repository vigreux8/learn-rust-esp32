import { Type } from 'class-transformer';
import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class CreateKpiDto {
  @Type(() => Number)
  @IsInt()
  userId!: number;

  @Type(() => Number)
  @IsInt()
  questionId!: number;

  @Type(() => Number)
  @IsInt()
  reponseId!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(86_400)
  dureeSecondes!: number;
}
