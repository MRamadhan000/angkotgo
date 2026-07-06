import { Module } from '@nestjs/common';
import { DriverModule } from './driver/driver.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { RouteModule } from './route/route.module';

@Module({
  imports: [
    DriverModule,
    VehicleModule,
    RouteModule,
  ],
})
export class AppModule {}
