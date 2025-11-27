import { Request, Response } from 'express';
import { BoardService } from './board.service';
import {
  ServiceResponse,
  ResponseStatus,
} from '@/common/models/serviceResponse';
import { StatusCodes } from 'http-status-codes';
import { AddBoardMemberDto } from './board.dto';

const boardService = new BoardService();

export class BoardController {
  static async create(req: Request): Promise<ServiceResponse<any>> {
    try {
      const { title, workspaceId } = req.body;
      if (!title || !workspaceId) { 
        return new ServiceResponse(
          ResponseStatus.Failed,
          'Title and workspaceId are required',
          null,
          StatusCodes.BAD_REQUEST
        );
      }
      const creatorId = req.user?.userId;
      const board = await boardService.createBoard(req.body, creatorId);
      return new ServiceResponse(
        ResponseStatus.Success,
        'Board created successfully',
        board,
        StatusCodes.CREATED
      );
    } catch (error: any) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        error.message,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }


  static async findAll(req: Request): Promise<ServiceResponse<any>> {
    try {
      const workspaceId = req.query.workspaceId as string | undefined; 

      if (!workspaceId) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          'workspaceId query param is required',
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      const boards = await boardService.getBoards(workspaceId);
      return new ServiceResponse(
        ResponseStatus.Success,
        'Boards retrieved successfully',
        boards,
        StatusCodes.OK
      );
    } catch (error: any) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        error.message,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }


  static async findOne(req: Request): Promise<ServiceResponse<any>> {
    try {
      const board = await boardService.getBoardById(req.params.id);
      return new ServiceResponse(
        ResponseStatus.Success,
        'Board retrieved successfully',
        board,
        StatusCodes.OK
      );
    } catch (error: any) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        error.message,
        null,
        StatusCodes.NOT_FOUND
      );
    }
  }

  static async update(req: Request): Promise<ServiceResponse<any>> {
    try {
      const board = await boardService.updateBoard(req.params.id, req.body);
      return new ServiceResponse(
        ResponseStatus.Success,
        'Board updated successfully',
        board,
        StatusCodes.OK
      );
    } catch (error: any) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        error.message,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }

  static async delete(req: Request): Promise<ServiceResponse<any>> {
    try {
      await boardService.deleteBoard(req.params.id);
      return new ServiceResponse(
        ResponseStatus.Success,
        'Board closed successfully',
        null,
        StatusCodes.OK
      );
    } catch (error: any) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        error.message,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }

  static async restore(req: Request): Promise<ServiceResponse<any>> {
    try {
      const board = await boardService.restoreBoard(req.params.id);
      return new ServiceResponse(
        ResponseStatus.Success,
        'Board restored successfully',
        board,
        StatusCodes.OK
      );
    } catch (error: any) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        error.message,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }

  static async deleteBoardPermanently(req: Request): Promise<ServiceResponse<any>> {
    try {
      const board = await boardService.deleteBoardPermanently(req.params.id);
      return new ServiceResponse(
        ResponseStatus.Success,
        'Board deleted permanently',
        board,
        StatusCodes.OK
      );
    } catch (error: any) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        error.message,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }

}
