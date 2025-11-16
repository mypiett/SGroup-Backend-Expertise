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
import { Role } from './role.entity';
import { User } from './user.entity';
import { Workspace } from './workspace.entity';

@Entity('workspace_members')
@Unique(['userId', 'workspaceId'])
@Index('IDX_workspace_member_userId', ['userId'])
@Index('IDX_workspace_member_workspaceId', ['workspaceId'])
@Index('IDX_workspace_member_roleId', ['roleId'])
@Index('IDX_workspace_member_workspace_role', ['workspaceId', 'roleId'])
export class WorkspaceMembers extends DateTimeEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'uuid' })
  public userId: string;

  @Column({ type: 'uuid' })
  public workspaceId: string;

  @Column({ type: 'uuid' })
  public roleId: string;

  @ManyToOne(() => Role, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'roleId' })
  public role: Role;

  @ManyToOne(() => User, (user) => user.workspaceMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  public user: User;

  @ManyToOne(() => Workspace, (workspace) => workspace.workspaceMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  public workspace: Workspace;
}
