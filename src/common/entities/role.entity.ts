import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { DateTimeEntity } from './base/dateTimeEntity';
import { RolePermission } from './role-permission.entity';

@Entity('roles')
export class Role extends DateTimeEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'varchar', unique: true, length: 100 })
  public name: string;

  @Column({ type: 'text', nullable: true })
  public description: string;

  // role - permission
  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  public rolePermissions: RolePermission[];
}
