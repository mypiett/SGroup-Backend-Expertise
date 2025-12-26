import { StatusCodes } from 'http-status-codes';
import {
  ResponseStatus,
  ServiceResponse,
} from '@/common/models/serviceResponse';
import { Request, Response } from 'express';
import { ListService } from './list.service';

const listService = new ListService();

export class ListController {
  static async getAllListsByBoard(req: Request) {
    const { boardId } = req.params;
    try {
      const lists = await listService.getAllListsByBoard(boardId);
      return new ServiceResponse(
        ResponseStatus.Success,
        'Get all lists successfully',
        lists,
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

  static async createList(req: Request): Promise<ServiceResponse<any>> {
    try {
      const boardId = req.params.boardId;
      const currentUserId = req.user?.userId;
      const { title } = req.body;
      if (!currentUserId) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          'Unauthorized',
          null,
          StatusCodes.UNAUTHORIZED
        );
      }

      if (!title || !boardId) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          'Title and BoardId are required',
          null,
          StatusCodes.BAD_REQUEST
        );
      }
      const list = await listService.createList(boardId, title, currentUserId);
      return new ServiceResponse(
        ResponseStatus.Success,
        'List created successfully',
        list,
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

  static async editListTitle(
    listId: string,
    title: string
  ): Promise<ServiceResponse<any>> {
    try {
      const result = await listService.editListTitle(listId, title);
      return new ServiceResponse(
        ResponseStatus.Success,
        `Edit list's name successfully`,
        result,
        StatusCodes.OK
      );
    } catch (error) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        error.message,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }

  static async archiveList(listId: string): Promise<ServiceResponse<any>> {
    try {
      const result = await listService.archiveList(listId);
      return new ServiceResponse(
        ResponseStatus.Success,
        'List archived successfully',
        result,
        StatusCodes.OK
      );
    } catch (error) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        error.message,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }

  static async unarchiveList(listId: string): Promise<ServiceResponse<any>> {
    try {
      const result = await listService.unarchiveList(listId);
      return new ServiceResponse(
        ResponseStatus.Success,
        'List unarchived successfully',
        result,
        StatusCodes.OK
      );
    } catch (error) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        error.message,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }

  static async archiveAllCardsInList(
    listId: string
  ): Promise<ServiceResponse<any>> {
    try {
      const result = await listService.archiveAllCardsInList(listId);
      return new ServiceResponse(
        ResponseStatus.Success,
        'All cards archived successfully',
        result,
        StatusCodes.OK
      );
    } catch (error) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        error.message,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }

  static async moveListToBoard(
    listId: string,
    boardId: string,
    position: number
  ): Promise<ServiceResponse<any>> {
    try {
      const result = await listService.moveListToBoard(
        listId,
        boardId,
        position
      );
      return new ServiceResponse(
        ResponseStatus.Success,
        'List moved to board successfully',
        result,
        StatusCodes.OK
      );
    } catch (error) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        error.message,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }

  static async moveAllCardsToAnotherList(
    sourceListId: string,
    targetListId: string,
    targetBoardId?: string
  ): Promise<ServiceResponse<any>> {
    try {
      const result = await listService.moveAllCardsToAnotherList(
        sourceListId,
        targetListId,
        targetBoardId
      );
      return new ServiceResponse(
        ResponseStatus.Success,
        'Cards moved successfully',
        result,
        StatusCodes.OK
      );
    } catch (error) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        error.message,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }

  static async copyListToBoard(
    sourceListId: string,
    targetBoardId: string,
    title?: string,
    position?: number
  ): Promise<ServiceResponse<any>> {
    try {
      const result = await listService.copyListToBoard(
        sourceListId,
        targetBoardId,
        title,
        position
      );
      return new ServiceResponse(
        ResponseStatus.Success,
        'List copied successfully',
        result,
        StatusCodes.CREATED
      );
    } catch (error) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        error.message,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }

  static async reorderList(
    currentListId: string,
    prevListId: string,
    nextListId: string
  ): Promise<ServiceResponse<any>> {
    try {
      const result = await listService.reorderList(
        currentListId,
        prevListId,
        nextListId
      );
      return new ServiceResponse(
        ResponseStatus.Success,
        'Reorder list successfully',
        result,
        StatusCodes.OK
      );
    } catch (error) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        error.message,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }

  static async getAllCardsInList(
    listId: string
  ): Promise<ServiceResponse<any>> {
    try {
      const cards = await listService.getAllCardsInList(listId);
      return new ServiceResponse(
        ResponseStatus.Success,
        'Get all cards in list successfully',
        cards,
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
