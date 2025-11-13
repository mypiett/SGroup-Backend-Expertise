import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm';

import { DateTimeEntity } from './base/dateTimeEntity';
import { Board } from './board.entity';
import { Role } from './role.entity';
import { User } from './user.entity';

@Entity('board_members')
@Unique(['userId', 'boardId'])
export class BoardMembers extends DateTimeEntity {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column({ type: 'uuid' })
    public userId: string;

    @Column({ type: 'uuid' })
    public boardId: string;

    @Column({ type: 'uuid' })
    public roleId: string;

    @ManyToOne(() => Role, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'roleId' })
    public role: Role;

    @ManyToOne(() => User, (user) => user.boardMembers, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'userId' })
    public user: User;

    @ManyToOne(() => Board, (board) => board.boardMembers, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'boardId' })
    public board: Board;
}
