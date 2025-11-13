import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { DateTimeEntity } from './base/dateTimeEntity';
import { RolePermission } from './role-permission.entity';

@Entity('permissions')
export class Permission extends DateTimeEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'varchar', unique: true, length: 150 })
  public name: string;

  @Column({ type: 'text', nullable: true })
  public description: string;

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission
  )
  public rolePermissions: RolePermission[];
}
