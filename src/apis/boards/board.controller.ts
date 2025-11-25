import { Request, Response } from 'express';
import { BoardService } from './board.service';
import {
  ServiceResponse,
  ResponseStatus,
} from '@/common/models/serviceResponse';
import { StatusCodes } from 'http-status-codes';

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

  static async closeBoard(req: Request): Promise<ServiceResponse<any>> {
    try {
      const board = await boardService.closeBoard(req.params.id);
      return new ServiceResponse(
        ResponseStatus.Success,
        'Board closed successfully',
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

  static async reopenBoard(req: Request): Promise<ServiceResponse<any>> {
    try {
      const board = await boardService.reopenBoard(req.params.id);
      return new ServiceResponse(
        ResponseStatus.Success,
        'Board reopened successfully',
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

  static async addMemberToBoard(req: Request): Promise<ServiceResponse<any>> {
    try {
      const boardId = req.params.id;
      const currentUserId = req.user?.userId;
      const data = req.body;
      const result = await boardService.addMemberToBoard(
        boardId,
        data,
        currentUserId
      );

      return new ServiceResponse(
        ResponseStatus.Success,
        result.message,
        result,
        StatusCodes.CREATED
      );
    } catch (error: any) {
      if (
        error.message === 'Board not found' ||
        error.message === 'User not found' ||
        error.message === 'Role not found'
      ) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          error.message,
          null,
          StatusCodes.NOT_FOUND
        );
      }

      if (
        error.message.includes('not a board member') ||
        error.message.includes('Only board admin') ||
        error.message.includes('Only board owner') ||
        error.message.includes('already a board member')
      ) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          error.message,
          null,
          StatusCodes.FORBIDDEN
        );
      }

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

static async createLinkShareBoard(
    req: Request
  ): Promise<ServiceResponse<any>> {
    const boardId = req.params.id;
    const currentUserId = req.user?.userId;
    try {
      const link = await boardService.createLinkShareBoard(
        boardId,
        currentUserId
      );
      return new ServiceResponse(
        ResponseStatus.Success,
        'Invite link create successfully',
        link,
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

  static async deleteLinkShareBoard(
    req: Request
  ): Promise<ServiceResponse<any>> {
    const boardId = req.params.id;
    const currentUserId = req.user?.userId;
    try {
      await boardService.deleteLinkShareBoard(boardId, currentUserId);
      return new ServiceResponse(
        ResponseStatus.Success,
        'Invite Link delete successfully',
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

  static async JoinBoardByLink(req: Request): Promise<ServiceResponse<any>> {
    const boardId = req.params.id;
    const inviteToken = req.params.inviteToken;
    const currentUserId = req.user?.userId;
    try {
      const member = await boardService.JoinBoardByLink(
        boardId,
        currentUserId,
        inviteToken
      );
      return new ServiceResponse(
        ResponseStatus.Success,
        'You joined this board successfully',
        member,
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
