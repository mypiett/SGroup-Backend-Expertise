import { Request, Response } from 'express';
import { BoardService } from './board.service';
import { CreateBoardDto } from './board.dto';

const boardService = new BoardService();

export class BoardController {
  static async createBoard(req: Request, res: Response) {
    try {
      const data: CreateBoardDto = req.body;
      if (!data.name || !data.workspaceId) {
        return res
          .status(400)
          .json({ message: 'Name and workspaceId are required' });
      }

      const board = await boardService.createBoard(data);
      return res.status(201).json(board);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}
