import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entities';
import { User } from './user.entity';
import { Board } from '../../common/entities/board.entity';

@Entity({ name: 'workspaces' })
export class Workspace extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.workspaces)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => Board, (board) => board.workspace)
  boards: Board[];
}
