import { StatusCodes } from 'http-status-codes';
import {
  ResponseStatus,
  ServiceResponse,
} from '@/common/models/serviceResponse';
import { ListService } from './list.service';

const listService = new ListService();

export class ListController {
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
    boardId: string
  ): Promise<ServiceResponse<any>> {
    try {
      const result = await listService.moveListToBoard(listId, boardId);
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
}
