import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { DateTimeEntity } from './base/dateTimeEntity';
import { BoardMembers } from './board-member.entity';
import { List } from './list.entity';
import { Workspace } from './workspace.entity';

@Entity('boards')
export class Board extends DateTimeEntity {
  // id
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  // title
  @Column({ type: 'varchar', length: 255 })
  public title: string;

  // description
  @Column({ type: 'text', nullable: true })
  public description: string;

  // coverUrl
  @Column({ type: 'varchar', length: 255, nullable: true })
  public coverUrl: string;

  // isClosed
  @Column({ type: 'bool', nullable: false, default: false })
  public isClosed: boolean;

  // visibility nằm trong ['private', 'public', 'workspace']
  @Column({
    type: 'enum',
    enum: ['private', 'public', 'workspace'],
    nullable: false,
    default: 'private',
  })
  public visibility: string;

  // workspace
  @ManyToOne(() => Workspace, (workspace) => workspace.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  public workspace: Workspace;

  // lists
  @OneToMany(() => List, (list) => list.board)
  lists: List[];

  // boardMembers
  @OneToMany(() => BoardMembers, (boardMember) => boardMember.board)
  public boardMembers: BoardMembers[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  public inviteToken: string;
}
