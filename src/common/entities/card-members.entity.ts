// import {
//   Column,
//   Entity,
//   JoinColumn,
//   ManyToOne,
//   PrimaryGeneratedColumn,
//   Unique,
// } from 'typeorm';

// import { DateTimeEntity } from './base/dateTimeEntity';
// import { Card } from './card.entity';
// import { Role } from './role.entity';
// import { User } from './user.entity';

// @Entity('card_members')
// @Unique(['userId', 'cardId'])
// export class CardMembers extends DateTimeEntity {
//   // Trường
//   @PrimaryGeneratedColumn('uuid')
//   public id: string;

//   @Column({ type: 'uuid' })
//   public userId: string;

//   @Column({ type: 'uuid' })
//   public cardId: string;

//   @Column({ type: 'uuid' })
//   public roleId: string;

//   // Quan hệ
//   @ManyToOne(() => Role, { onDelete: 'RESTRICT' }) // Không cho phép xóa role nếu còn người dùng sử dụng
//   @JoinColumn({ name: 'roleId' })
//   public role: Role;

//   @ManyToOne(() => Card, (card) => card.cardMembers, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({ name: 'cardId' })
//   public card: Card;

//   @ManyToOne(() => User, (user) => user.cardMembers, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({ name: 'userId' })
//   public user: User;
// }
