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
import { CardMembers } from './card-members.entity';
import { Comment } from './comment.entity';
import { List } from './list.entity';
import { Board } from './board.entity';

@Entity('cards')
@Index('idx_card_list_id', ['list'])
@Index('idx_card_board_id', ['board'])
@Index('idx_card_archived', ['isArchived'])
@Index('idx_card_list_archived', ['list', 'isArchived'])
@Index('idx_card_board_archived', ['board', 'isArchived'])
@Index('idx_card_position', ['list', 'position'])
@Index('idx_card_board_list', ['board', 'list'])
export class Card extends DateTimeEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'float', default: 0 })
  position: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  coverUrl: string;

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  })
  priority: string;

  @Column({ name: 'dueDate', type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @Column({ type: 'uuid' })
  listId: string;

  @ManyToOne(() => List, (list) => list.cards)
  @JoinColumn({ name: 'listId' })
  list: List;

  @Column({ type: 'uuid' })
  boardId: string;
  @ManyToOne(() => Board, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @OneToMany(() => CardMembers, (cardMember) => cardMember.card)
  public cardMembers: CardMembers[];

  @OneToMany(() => Comment, (comment) => comment.user)
  public comments: Comment[];
}
