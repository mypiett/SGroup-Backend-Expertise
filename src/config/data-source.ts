import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Board } from '@/common/entities/board.entity';
import { BoardMembers } from '@/common/entities/board-member.entity';
import { Card } from '@/common/entities/card.entity';
import { CardMembers } from '@/common/entities/card-members.entity';
import { Comment } from '@/common/entities/comment.entity';
import { List } from '@/common/entities/list.entity';
import { Notification } from '@/common/entities/notification.entity';
import { Permission } from '@/common/entities/permission.entity';
import { RefreshToken } from '@/common/entities/refresh-token.entity';
import { Role } from '@/common/entities/role.entity';
import { RolePermission } from '@/common/entities/role-permission.entity';
import { User } from '@/common/entities/user.entity';
import { Workspace } from '@/common/entities/workspace.entity';
import { WorkspaceMembers } from '@/common/entities/workspace-member.entity';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'postgres',
  synchronize: true, 
  logging: false,
  entities: [
    User,
    Workspace,
    WorkspaceMembers,
    Board,
    List,
    Card,
    CardMembers,
    Comment,
    Notification,
    RefreshToken,
    Role,
    RolePermission,
    Permission,
    BoardMembers,
  ],
  migrations: ['src/migration/**/*.ts'],
  subscribers: [],
  ssl: process.env.DB_HOST?.includes('render.com')
    ? { rejectUnauthorized: false }
    : false,
});

