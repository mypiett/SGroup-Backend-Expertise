import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entities';
import { List } from './list.entity';
import { Comment } from './comment.entity';

export enum Priority {
  HIGH = 'high',
  PREMIUM = 'premium',
  LOW = 'low',
}

@Entity({ name: 'cards' })
export class Card extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'float' })
  position: number;

  @Column({ type: 'enum', enum: Priority, default: Priority.LOW })
  priority: Priority;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @ManyToOne(() => List, (list) => list.cards)
  @JoinColumn({ name: 'list_id' })
  list: List;

  @OneToMany(() => Comment, (comment) => comment.card)
  comments: Comment[];
}
