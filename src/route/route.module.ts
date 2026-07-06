import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Route } from './route.entity';
import { RoutePoint } from './route-point.entity';
import { RouteStop } from './route-stop.entity';
import { RouteService } from './route.service';
import { RouteController } from './route.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Route, RoutePoint, RouteStop])],
  controllers: [RouteController],
  providers: [RouteService],
  exports: [RouteService],
})
export class RouteModule {}
