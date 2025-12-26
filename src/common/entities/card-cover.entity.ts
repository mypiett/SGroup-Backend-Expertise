import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DateTimeEntity } from './base/dateTimeEntity';
import { Card } from './card.entity';

@Entity('card_covers')
export class CardCover extends DateTimeEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color: string;

  @Column({ type: 'boolean', nullable: true })
  idUploadedBackground: boolean;

  @Column({
    type: 'enum',
    enum: ['normal', 'full'],
    nullable: true,
    default: 'normal',
  })
  size: 'normal' | 'full';

  @Column({
    type: 'enum',
    enum: ['light', 'dark'],
    nullable: true,
    default: 'light',
  })
  brightness: 'light' | 'dark';

  @Column({ type: 'boolean', default: false })
  isTemplate: boolean;

  @OneToMany(() => Card, (card) => card.cover)
  public cards: Card[];
}
