import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();
import { User } from '../common/entities/user.entity';
import { Board } from '../common/entities/board.entity';
import { Comment } from '../common/entities/comment.entity';
import { List } from '../common/entities/list.entity';
import { Workspace } from '../common/entities/workspace.entity';
import { Card } from '../common/entities/card.entity';
import { Notification } from '../common/entities/notification.entity';
import { Role } from '../common/entities/role.entity';
import { Permission } from '../common/entities/permission.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [
    User,
    Workspace,
    Board,
    Card,
    Comment,
    List,
    Notification,
    Role,
    Permission,
  ],
  migrations: [],
  subscribers: [],
});
