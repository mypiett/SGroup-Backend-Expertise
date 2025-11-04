import { Request, Response } from 'express';
import { BoardService } from './board.service';
const boardService = new BoardService();

export class BoardController {
  static async create(req: Request, res: Response) {
    try {
      const board = await boardService.createBoard(req.body);
      return res.status(201).json(board);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async findAll(req: Request, res: Response) {
    try {
      const boards = await boardService.getBoards(
        Number(req.params.workspaceId)
      );
      return res.json(boards);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async findOne(req: Request, res: Response) {
    try {
      const board = await boardService.getBoardById(Number(req.params.id));
      return res.json(board);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const board = await boardService.updateBoard(
        Number(req.params.id),
        req.body
      );
      return res.json(board);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await boardService.deleteBoard(Number(req.params.id));
      return res.json({ message: 'Board deleted' });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}
