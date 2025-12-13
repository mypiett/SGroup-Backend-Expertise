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

  static async deleteBoardPermanently(
    req: Request
  ): Promise<ServiceResponse<any>> {
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
      const {
        visibility,
        backgroundUrl,
        memberManagePolicy,
        commentPolicy,
        workspaceMembersCanEditAndJoin,
      } = req.body;

      const settings: any = {};

      if (visibility !== undefined) {
        const validVisibilities = ['private', 'workspace', 'public'];
        if (!validVisibilities.includes(visibility)) {
          return new ServiceResponse(
            ResponseStatus.Failed,
            'Invalid visibility value',
            null,
            StatusCodes.BAD_REQUEST
          );
        }
        settings.visibility = visibility;
      }

      if (backgroundUrl !== undefined) {
        if (typeof backgroundUrl !== 'string' || !backgroundUrl.trim()) {
          return new ServiceResponse(
            ResponseStatus.Failed,
            'backgroundUrl must be a non-empty string',
            null,
            StatusCodes.BAD_REQUEST
          );
        }
        settings.backgroundUrl = backgroundUrl;
      }

      if (memberManagePolicy !== undefined) {
        const valid = ['admins_only', 'all_members'];
        if (!valid.includes(memberManagePolicy)) {
          return new ServiceResponse(
            ResponseStatus.Failed,
            'Invalid memberManagePolicy value',
            null,
            StatusCodes.BAD_REQUEST
          );
        }
        settings.memberManagePolicy = memberManagePolicy;
      }

      if (commentPolicy !== undefined) {
        const valid = ['disabled', 'members', 'workspace', 'anyone'];
        if (!valid.includes(commentPolicy)) {
          return new ServiceResponse(
            ResponseStatus.Failed,
            'Invalid commentPolicy value',
            null,
            StatusCodes.BAD_REQUEST
          );
        }
        settings.commentPolicy = commentPolicy;
      }

      if (workspaceMembersCanEditAndJoin !== undefined) {
        if (typeof workspaceMembersCanEditAndJoin !== 'boolean') {
          return new ServiceResponse(
            ResponseStatus.Failed,
            'workspaceMembersCanEditAndJoin must be boolean',
            null,
            StatusCodes.BAD_REQUEST
          );
        }
        settings.workspaceMembersCanEditAndJoin =
          workspaceMembersCanEditAndJoin;
      }

      if (Object.keys(settings).length === 0) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          'No settings provided',
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      const userId = req.user?.userId as string;
      const isAdmin = await boardService.checkBoardAdmin(id, userId);
      if (!isAdmin) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          'User is not an admin of this board',
          null,
          StatusCodes.FORBIDDEN
        );
      }

      const updatedBoard = await boardService.updateBoardSettings(id, settings);

      return new ServiceResponse(
        ResponseStatus.Success,
        'Board settings updated successfully',
        updatedBoard,
        StatusCodes.OK
      );
    } catch (error: any) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        error.message || 'Error updating board settings',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }  

  static async updateCover(req: Request): Promise<ServiceResponse<any>> {
    try {
      const { coverUrl } = req.body;
      const boardId = req.params.id;

      if (!coverUrl) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          'coverUrl is required',
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      const updatedBoard = await boardService.updateBoardCover(boardId, coverUrl);

      return new ServiceResponse(
        ResponseStatus.Success,
        'Board cover updated successfully',
        updatedBoard,
        StatusCodes.OK
      );
    } catch (error: any) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        error.message || 'Error updating board cover',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async getMembers(req: Request): Promise<ServiceResponse<any>> { //Hàm ni dùng để lấy ds thành viên trong board
    try {
      const boardId = req.params.id;
      const members = await boardService.getBoardMembers(boardId);

      return new ServiceResponse(
        ResponseStatus.Success,
        'Board members retrieved successfully',
        members,
        StatusCodes.OK
      );
    } catch (error: any) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        error.message || 'Error retrieving board members',
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async removeMemberFromBoard(
    req: Request
  ): Promise<ServiceResponse<any>> {
    try {
      const boardId = req.params.id;
      const userIdToRemove = req.params.userId;
      const currentUserId = req.user?.userId as string;

      if (!userIdToRemove) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          'userId is required',
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      const result = await boardService.removeMemberFromBoard(
        boardId,
        userIdToRemove,
        currentUserId
      );

      return new ServiceResponse(
        ResponseStatus.Success,
        result.message,
        null,
        StatusCodes.OK
      );
    } catch (error: any) {
      if (
        error.message === 'Board not found' ||
        error.message === 'Member not found in this board'
      ) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          error.message,
          null,
          StatusCodes.NOT_FOUND
        );
      }

      if (
        error.message.includes('You are not a member') ||
        error.message.includes('Only board owner or admin') ||
        error.message.includes('Only board members or admins') ||
        error.message.includes('Cannot remove board owner')
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
        error.message || 'Error removing member',
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }
}
