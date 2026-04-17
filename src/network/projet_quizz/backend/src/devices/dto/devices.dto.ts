import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RegisterDeviceDto {
  @IsString()
  @IsNotEmpty()
  adresse_mac!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  pseudot!: string;
}
