import { IsInt, Min } from 'class-validator';

export class MoveGroupeQuestionsBodyDto {
  @IsInt()
  @Min(1)
  user_id!: number;

  @IsInt()
  @Min(1)
  to_collection_id!: number;
}
