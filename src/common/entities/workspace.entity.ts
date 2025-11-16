import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { DateTimeEntity } from './base/dateTimeEntity';
import { Board } from './board.entity';
import { WorkspaceMembers } from './workspace-member.entity';

@Entity('workspaces')
@Index('IDX_workspace_isArchived', ['isArchived'])
@Index('IDX_workspace_isArchived_id', ['isArchived', 'id'])
@Index('IDX_workspace_isArchived_createdAt', ['isArchived', 'createdAt'])
@Index('IDX_workspace_visibility_isArchived', ['visibility', 'isArchived'])
export class Workspace extends DateTimeEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'varchar', length: 255 })
  public title: string;

  @Column({ type: 'varchar', nullable: true })
  public description: string;

  @Column({ type: 'enum', enum: ['private', 'public'], default: 'private' })
  public visibility: 'private' | 'public';

  // archive
  @Column({ type: 'bool', default: false })
  public isArchived: boolean;

  @OneToMany(
    () => WorkspaceMembers,
    (workspaceMember) => workspaceMember.workspace
  )
  public workspaceMembers: WorkspaceMembers[];

  @OneToMany(() => Board, (board) => board.workspace)
  boards: Board[];
}
