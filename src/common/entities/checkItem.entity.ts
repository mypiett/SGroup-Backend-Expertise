import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Checklist } from './checklist.entity';

@Entity('checkItems')
@Index('idx_checkItem_checklist_id', ['checklist'])
export class CheckItem {
  @PrimaryGeneratedColumn('uuid')
  public id: string;
  @Column({ type: 'varchar', length: 255 })
  public name: string;
  @Column({ type: 'float', default: 0 })
  public position: number;
  @Column({ type: 'boolean', default: false })
  public isChecked: boolean;

  @Column({ name: 'due', type: 'timestamp', nullable: true })
  public due: Date;
  @Column({ name: 'dueReminder', type: 'timestamp', nullable: true })
  public dueReminder: Date;

  @Column({ type: 'uuid' })
  checklistId: string;
  @ManyToOne(() => Checklist, (checklist) => checklist.checkItems)
  public checklist: Checklist;
}
