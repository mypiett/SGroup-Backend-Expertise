// idBoard,idCard,name,position,archived
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Card } from './card.entity';
import { CheckItem } from './checkItem.entity';

@Entity('checklists')
@Index('idx_checklist_card_id', ['card'])
export class Checklist {
  @PrimaryGeneratedColumn('uuid')
  public id: string;
  @Column({ type: 'varchar', length: 255 })
  public name: string;
  @Column({ type: 'float', default: 0 })
  public position: number;

  @Column({ type: 'uuid' })
  cardId: string;
  @ManyToOne(() => Card, (card) => card.checklists)
  public card: Card;

  @OneToMany(() => CheckItem, (checkItem) => checkItem.checklist)
  public checkItems: CheckItem[];
}
