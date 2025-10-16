import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entities';
import { List } from './list.entity';
import { Workspace } from './workspace.entity';

@Entity({ name: 'boards' })
export class Board extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'cover_url', nullable: true })
  coverUrl: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.boards)
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @OneToMany(() => List, (list) => list.board)
  lists: List[];
}
