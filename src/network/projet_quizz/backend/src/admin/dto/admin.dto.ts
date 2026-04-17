import { IsString, MinLength } from 'class-validator';

export class ImportDatabaseSqlDto {
  @IsString()
  @MinLength(1)
  script!: string;

  @IsString()
  confirm!: string;
}
