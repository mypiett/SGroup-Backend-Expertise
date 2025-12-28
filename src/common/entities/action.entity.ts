import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Card } from './card.entity';
import { User } from './user.entity';

export enum ActionType {
  COMMENT_CARD = 'commentCard',
  COPY_CARD = 'copyCard',
  CREATE_CARD = 'createCard',
  UPDATE_CARD = 'updateCard',
  DELETE_CARD = 'deleteCard',
  ADD_MEMBER = 'addMemberToCard',
  REMOVE_MEMBER = 'removeMemberFromCard',
  ADD_LABEL = 'addLabelToCard',
  REMOVE_LABEL = 'removeLabelFromCard',
  ADD_CHECKLIST = 'addChecklistToCard',
  REMOVE_CHECKLIST = 'removeChecklistFromCard',
  CHECK_CHECKITEM = 'checkCheckItem',
  ADD_ATTACHMENT = 'addAttachmentToCard',
  REMOVE_ATTACHMENT = 'removeAttachmentFromCard',
}

@Entity()
@Index('idx_action_type', ['type'])
export class Action {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ActionType,
  })
  type: ActionType;

  @Column({ type: 'jsonb' })
  data: any;

  @CreateDateColumn()
  date: Date;

  @ManyToOne(() => User, (user) => user.actions)
  memberCreator: User;

  @Column({ type: 'uuid', nullable: true })
  cardId: string;
  @ManyToOne(() => Card, (card) => card.actions, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cardId' })
  card: Card;
}
