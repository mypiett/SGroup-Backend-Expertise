import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from './base.entities';
import { Permission } from './permission.entity';

@Entity({ name: 'roles' })
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => User, (user) => user.role)
  public users: User[];

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable()
  public permissions: Permission[];
}
