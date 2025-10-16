import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entities';
import { Board } from './board.entity';
import { Card } from '../cards/card.entity';

@Entity({ name: 'lists' })
export class List extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'float' })
  position: number;

  @ManyToOne(() => Board, (board) => board.lists)
  @JoinColumn({ name: 'board_id' })
  board: Board;

  @OneToMany(() => Card, (card) => card.list)
  cards: Card[];
}
