import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Route } from './route.entity';

@Entity('route_points')
export class RoutePoint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  sequence: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @ManyToOne(() => Route, (route) => route.points, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  route: Route;
}
