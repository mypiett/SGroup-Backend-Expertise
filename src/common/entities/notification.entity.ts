// notification.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Action } from './action.entity';

export enum NotificationType {
  CARD_COMMENT = 'card_comment',
  CARD_ATTACHMENT_ADDED = 'card_attachment_added',
  CARD_DUE_SOON = 'card_due_soon',
}

@Entity('notifications')
@Index('idx_notification_recipient', ['recipient'])
@Index('idx_notification_is_read', ['isRead'])
@Index('idx_notification_recipient_is_read', ['recipient', 'isRead'])
@Index('idx_notification_created_at', ['createdAt'])
@Index('idx_notification_action', ['action'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'jsonb', nullable: true }) // dữ liệu bổ sung liên quan đến thông báo
  data: any;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'uuid' })
  recipientId: string;

  @ManyToOne(() => User, (user) => user.notifications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipientId' })
  recipient: User;

  @Column({ type: 'uuid', nullable: true })
  actionId: string;

  @OneToOne(() => Action, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'actionId' })
  action: Action;
}
