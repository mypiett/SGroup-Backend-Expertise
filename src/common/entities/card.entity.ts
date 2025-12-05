import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { DateTimeEntity } from './base/dateTimeEntity';
import { CardMembers } from './card-members.entity';
import { Comment } from './comment.entity';
import { List } from './list.entity';

@Entity('cards')
@Index('idx_card_list_id', ['list'])
@Index('idx_card_archived', ['isArchived'])
@Index('idx_card_list_archived', ['list', 'isArchived'])
@Index('idx_card_position', ['list', 'position'])
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

  @ManyToOne(() => List, (list) => list.cards)
  list: List;

  @OneToMany(() => CardMembers, (cardMember) => cardMember.card)
  public cardMembers: CardMembers[];

  @OneToMany(() => Comment, (comment) => comment.user)
  public comments: Comment[];
}
