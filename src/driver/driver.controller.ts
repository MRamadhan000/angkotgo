import { Controller, Get, Post, Body } from '@nestjs/common';
import { DriverService } from './driver.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { Driver } from './driver.entity';

@Controller('admin/dashboard/driver')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Get()
  async findAll(): Promise<Driver[]> {
    return this.driverService.findAll();
  }

  @Post()
  async create(@Body() createDriverDto: CreateDriverDto): Promise<Driver> {
    return this.driverService.create(createDriverDto);
  }
}
