import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RoutePoint } from './route-point.entity';
import { RouteStop } from './route-stop.entity';

export enum RouteDirection {
  GO = 'GO',
  RETURN = 'RETURN',
}

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ length: 150 })
  name: string;

  @Column({
    type: 'enum',
    enum: RouteDirection,
    default: RouteDirection.GO,
  })
  direction: RouteDirection;

  @Column({ length: 30 })
  color: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'distance_km' })
  distanceKm: number;

  @Column({ type: 'int', name: 'estimated_duration_minutes' })
  estimatedDurationMinutes: number;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @OneToMany(() => RoutePoint, (point) => point.route, { cascade: true })
  points: RoutePoint[];

  @OneToMany(() => RouteStop, (stop) => stop.route, { cascade: true })
  stops: RouteStop[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
