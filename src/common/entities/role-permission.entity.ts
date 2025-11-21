import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { DateTimeEntity } from './base/dateTimeEntity';
import { Permission } from './permission.entity';
import { Role } from './role.entity';

@Entity('role_permissions')
@Unique('UQ_role_permission_roleId_permissionId', ['roleId', 'permissionId'])
export class RolePermission extends DateTimeEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'uuid' })
  @Index('IDX_role_permissions_roleId')
  public roleId: string;

  @Column({ type: 'uuid' })
  @Index('IDX_role_permissions_permissionId')
  public permissionId: string;

  @ManyToOne(() => Role, (role) => role.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roleId' })
  public role: Role;

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'permissionId' })
  public permission: Permission;
}
