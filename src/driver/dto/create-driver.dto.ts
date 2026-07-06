import { IsNotEmpty, IsString, Length, IsOptional, IsEnum } from 'class-validator';
import { DriverStatus } from '../driver.entity';

export class CreateDriverDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  name: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 20)
  phone: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 50)
  licenseNumber: string;

  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;
}
