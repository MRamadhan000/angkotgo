import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  async findAll(): Promise<Vehicle[]> {
    return this.vehicleRepository.find();
  }

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    // Check unique plate number
    const existingPlate = await this.vehicleRepository.findOne({
      where: { plateNumber: createVehicleDto.plateNumber },
    });
    if (existingPlate) {
      throw new ConflictException('Plate number already exists');
    }

    // Check unique vehicle code
    const existingCode = await this.vehicleRepository.findOne({
      where: { vehicleCode: createVehicleDto.vehicleCode },
    });
    if (existingCode) {
      throw new ConflictException('Vehicle code already exists');
    }

    const vehicle = this.vehicleRepository.create(createVehicleDto);
    return this.vehicleRepository.save(vehicle);
  }
}
