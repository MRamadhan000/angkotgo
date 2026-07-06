import { Controller, Get } from '@nestjs/common';
import { RouteService } from './route.service';
import { Route } from './route.entity';

@Controller('admin/dashboard/route')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Get()
  async findAll(): Promise<Route[]> {
    return this.routeService.findAll();
  }
}
