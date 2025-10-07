import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();
import { User } from '../apis/users/user.entity';
import { Workspace } from '../apis/workspaces/workspace.entity';
import { Board } from '../apis/boards/board.entity';
import { Card } from '../apis/cards/card.entity';
import { Comment } from '../apis/comments/comment.entity';
import { List } from '../apis/lists/list.entity';
import { Notification } from '../apis/notifications/notification.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [User, Workspace, Board, Card, Comment, List, Notification],
  migrations: [],
  subscribers: [],
});
