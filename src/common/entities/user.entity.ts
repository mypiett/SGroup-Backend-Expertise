import {
  Column,
  Entity,
  Index,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { DateTimeEntity } from './base/dateTimeEntity';
import { BoardMembers } from './board-member.entity';
import { Comment } from './comment.entity';
import { Notification } from './notification.entity';
import { WorkspaceMembers } from './workspace-member.entity';
import { Attachment } from './attachment.entity';
import { Card } from './card.entity';

@Entity('users')
@Index('idx_users_email', ['email'])
export class User extends DateTimeEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'varchar', unique: true, length: 255 })
  public email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  public password: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  public name: string;

  @Column({ type: 'text', nullable: true })
  public bio: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  public avatarUrl: string;

  @Column({ type: 'bool', nullable: false, default: false })
  public isActive: boolean;

  @Column({ nullable: true })
  public googleId: string;

  @Column({ type: 'varchar', length: 50, nullable: true, default: 'local' })
  public provider: string;

  @OneToMany(
    () => WorkspaceMembers,
    (workspaceMember) => workspaceMember.workspace
  )
  public workspaceMembers: WorkspaceMembers[];

  @OneToMany(() => BoardMembers, (boardMember) => boardMember.user)
  public boardMembers: BoardMembers[];

  @ManyToMany(() => Card, (card) => card.members)
  public cards: Card[];

  @OneToMany(() => Comment, (comment) => comment.user)
  public comments: Comment[];

  @OneToMany(() => Notification, (notification) => notification.user)
  public notifications: Notification[];

  @OneToMany(() => Attachment, (attachment) => attachment.user)
  public attachments: Attachment[];
}
