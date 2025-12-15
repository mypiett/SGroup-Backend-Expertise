import { AppDataSource } from '@/config/data-source';
import { Request, Response, NextFunction } from 'express';
import { BoardMembers } from '../entities/board-member.entity';
import { List } from '../entities/list.entity';

export const requireBoardMember =
  () => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.userId;
      const listId = req.params.id;
      if (!listId) {
        return res.status(400).json({ message: 'Missing ListId' });
      }

      const list = await AppDataSource.getRepository(List).findOne({
        where: { id: listId },
        select: ['id', 'boardId'],
      });

      if (!list) {
        return res.status(404).json({ message: 'List not found' });
      }

      const checkRole = await AppDataSource.getRepository(BoardMembers).findOne(
        {
          where: {
            boardId: list.boardId,
            userId,
          },
        }
      );
      if (!checkRole) {
        return res
          .status(403)
          .json({ message: `You are not a member of this board` });
      }
      next();
    } catch (error) {
      return res.status(500).json({ message: 'Authorization failed', error });
    }
  };
