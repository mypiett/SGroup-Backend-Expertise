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
import { Board } from './board.entity';
import { Role } from './role.entity';
import { User } from './user.entity';

@Entity('board_members')
@Unique(['userId', 'boardId'])
// ✅ PERFORMANCE INDEXES
@Index('idx_board_member_user_id', ['userId'])
@Index('idx_board_member_board_id', ['boardId'])
@Index('idx_board_member_role_id', ['roleId'])
@Index('idx_board_member_board_role', ['boardId', 'roleId'])
export class BoardMembers extends DateTimeEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'uuid' })
  public userId: string;

  @Column({ type: 'uuid' })
  public boardId: string;

  @Column({ type: 'uuid' })
  public roleId: string;

  @ManyToOne(() => Role, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'roleId' })
  public role: Role;

  @ManyToOne(() => User, (user) => user.boardMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  public user: User;

  @ManyToOne(() => Board, (board) => board.boardMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'boardId' })
  public board: Board;
}
