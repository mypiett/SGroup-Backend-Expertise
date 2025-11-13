import { Request, Response } from 'express';
import { BoardService } from './board.service';

const boardService = new BoardService();

export class BoardController {
  static async create(req: Request, res: Response) {
    try {
      const board = await boardService.createBoard(req.body);
      return res.status(201).json({
        success: true,
        message: 'Board created successfully',
        data: board,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async findAll(req: Request, res: Response) {
    try {
      const workspaceId = req.params.workspaceId;
      const boards = await boardService.getBoards(workspaceId);
      return res.status(200).json({
        success: true,
        data: boards,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async findOne(req: Request, res: Response) {
    try {
      const board = await boardService.getBoardById(req.params.id);
      return res.status(200).json({
        success: true,
        data: board,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const board = await boardService.updateBoard(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Board updated successfully',
        data: board,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await boardService.deleteBoard(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Board closed successfully',
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async restore(req: Request, res: Response) {
    try {
      const board = await boardService.restoreBoard(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Board restored successfully',
        data: board,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}
