import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { DateTimeEntity } from './base/dateTimeEntity';
import { Board } from './board.entity';
import { Card } from './card.entity';

@Entity('lists')
@Index('idx_list_board_id', ['board'])
@Index('idx_list_archived', ['isArchived'])
@Index('idx_list_board_position', ['board', 'position'])
@Index('idx_list_board_archived', ['board', 'isArchived'])
export class List extends DateTimeEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'float', default: 0 })
  position: number;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @ManyToOne(() => Board, (board) => board.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'boardId' })
  public board: Board;

  @OneToMany(() => Card, (card) => card.list)
  cards: Card[];
}
