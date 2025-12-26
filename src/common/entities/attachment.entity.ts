import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { DateTimeEntity } from './base/dateTimeEntity';
import { Card } from './card.entity';
import { User } from './user.entity';

@Entity('attachments')
@Index('idx_attachment_card_id', ['card'])
export class Attachment extends DateTimeEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;
  @Column({ type: 'varchar', length: 255 })
  public name: string;
  @Column({ type: 'varchar', length: 50, nullable: true })
  public mimeType: string;
  @Column({ type: 'int', nullable: true })
  public bytes: number;
  @Column({ type: 'varchar', length: 7, nullable: true })
  public edgeColor: string;
  @Column({ type: 'varchar', length: 500 })
  public url: string;

  @Column({ type: 'uuid' })
  cardId: string;
  @ManyToOne(() => Card, (card) => card.attachments)
  public card: Card;

  @Column({ type: 'uuid' })
  userId: string;
  @ManyToOne(() => User, (user) => user.attachments)
  public user: User;
}
