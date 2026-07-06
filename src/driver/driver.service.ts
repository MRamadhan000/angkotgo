import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './driver.entity';
import { CreateDriverDto } from './dto/create-driver.dto';

@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
  ) {}

  async findAll(): Promise<Driver[]> {
    return this.driverRepository.find();
  }

  async create(createDriverDto: CreateDriverDto): Promise<Driver> {
    // Check unique phone number
    const existingPhone = await this.driverRepository.findOne({
      where: { phone: createDriverDto.phone },
    });
    if (existingPhone) {
      throw new ConflictException('Phone number already exists');
    }

    // Check unique license number
    const existingLicense = await this.driverRepository.findOne({
      where: { licenseNumber: createDriverDto.licenseNumber },
    });
    if (existingLicense) {
      throw new ConflictException('License number already exists');
    }

    const driver = this.driverRepository.create(createDriverDto);
    return this.driverRepository.save(driver);
  }
}
