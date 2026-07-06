import { IsNotEmpty, IsString, IsInt, Min, IsOptional, IsEnum, Length } from 'class-validator';
import { VehicleStatus } from '../vehicle.entity';

export class CreateVehicleDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 15)
  plateNumber: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 20)
  vehicleCode: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  capacity: number;

  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;
}
