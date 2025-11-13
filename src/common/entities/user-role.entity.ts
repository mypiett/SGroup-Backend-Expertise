// import {
//     Column,
//     Entity,
//     Index,
//     JoinColumn,
//     ManyToOne,
//     PrimaryGeneratedColumn,
//     Unique,
// } from 'typeorm';

// import { DateTimeEntity } from '@/common/entities/base/dateTimeEntity';
// import { Role } from '@/common/entities/role.entity';
// import { User } from '@/common/entities/user.entity';

// @Entity('user_roles')
// @Unique('UQ_user_role_userId_roleId', ['userId', 'roleId'])
// export class UserRole extends DateTimeEntity {
//     @PrimaryGeneratedColumn('uuid')
//     public id: string;

//     @Column({ type: 'uuid' })
//     @Index('IDX_user_roles_userId')
//     public userId: string;

//     @Column({ type: 'uuid' })
//     @Index('IDX_user_roles_roleId')
//     public roleId: string;

//     @ManyToOne(() => User, (user) => user.userRoles, {
//         onDelete: 'CASCADE',
//     })
//     @JoinColumn({ name: 'userId' })
//     public user: User;

//     @ManyToOne(() => Role, (role) => role.userRoles, {
//         onDelete: 'CASCADE',
//     })
//     @JoinColumn({ name: 'roleId' })
//     public role: Role;
// }
