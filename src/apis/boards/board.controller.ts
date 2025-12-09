import { Request, Response } from 'express';
import { BoardService } from './board.service';
import {
  ServiceResponse,
  ResponseStatus,
} from '@/common/models/serviceResponse';
import { StatusCodes } from 'http-status-codes';

const boardService = new BoardService();
import { UserService } from '../users/user.service'; // chỉnh đường dẫn cho đúng
const userService = new UserService();

export class BoardController {
  static async create(req: Request): Promise<ServiceResponse<any>> {
    try {
      const { title, workspaceId } = req.body;
      if (!title || !workspaceId) {
        //thêm validate
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
      const workspaceId = req.query.workspaceId as string | undefined; //lấy từ query thay vì params, call kiểu GET /boards?workspaceId=...

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

  static async transferOwnership(req: Request): Promise<ServiceResponse<any>> {
    try {
      const boardId = req.params.id;
      const { newOwnerId } = req.body;

      // Kiểm tra board có tồn tại không
      const board = await boardService.getBoardById(boardId);

      // Kiểm tra người yêu cầu có phải là BOARD_OWNER không
      const currentOwner = await boardService.getBoardOwner(boardId);
      if (currentOwner.userId !== req.user?.userId) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          'Only the current owner can transfer ownership',
          null,
          StatusCodes.FORBIDDEN
        );
      }

      // Kiểm tra xem user mới có tồn tại không
      const newOwner = await userService.findUserById(newOwnerId); // dùng findUserById
      if (!newOwner) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          'New owner not found',
          null,
          StatusCodes.NOT_FOUND
        );
      }

      // Chuyển quyền sở hữu
      const updatedBoard = await boardService.transferOwnership(boardId, newOwnerId);

      return new ServiceResponse(
        ResponseStatus.Success,
        'Ownership transferred successfully',
        updatedBoard,
        StatusCodes.OK
      );
    } catch (error: any) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        error.message || 'Error transferring ownership',
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }

  static async updateSettings(req: Request): Promise<ServiceResponse<any>> {
    try {
      const { id } = req.params;
      const { visibility, permissions } = req.body;


      const validVisibilities = ['private', 'workspace', 'public'];
      if (!validVisibilities.includes(visibility)) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          'Invalid visibility value',
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      // Validate permissions
      if (!Array.isArray(permissions)) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          'Permissions must be an array',
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      // Kiểm tra quyền admin của user
      const userId = req.user?.userId;
      const isAdmin = await boardService.checkBoardAdmin(id, userId);
      if (!isAdmin) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          'User is not an admin of this board',
          null,
          StatusCodes.FORBIDDEN
        );
      }

      const updatedBoard = await boardService.updateBoardSettings(id, visibility, permissions);

      return new ServiceResponse(
        ResponseStatus.Success,
        'Board settings updated successfully',
        updatedBoard,
        StatusCodes.OK
      );
    } catch (error: any) {
      const msg = error.message as string;

      if (msg === 'Board not found') {
        return new ServiceResponse(
          ResponseStatus.Failed,
          msg,
          null,
          StatusCodes.NOT_FOUND
        );
      }

      if (msg === 'User is not a member of the board') {
        return new ServiceResponse(
          ResponseStatus.Failed,
          msg,
          null,
          StatusCodes.FORBIDDEN
        );
      }

      return new ServiceResponse(
        ResponseStatus.Failed,
        msg || 'Error updating board settings',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}
