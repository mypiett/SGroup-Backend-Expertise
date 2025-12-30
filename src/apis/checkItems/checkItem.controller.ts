import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  ServiceResponse,
  ResponseStatus,
} from '@/common/models/serviceResponse';
import { CheckItemService } from './checkItem.service';

const checkItemService = new CheckItemService();

export class CheckItemController {
  static async getCheckItems(req: Request): Promise<ServiceResponse<any[]>> {
    try {
      const { id: cardId, checklistId } = req.params;

      const checkItems = await checkItemService.getCheckItems(
        cardId,
        checklistId
      );

      return new ServiceResponse(
        ResponseStatus.Success,
        'Get check items successfully',
        checkItems,
        StatusCodes.OK
      );
    } catch (error) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        (error as Error).message,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }

  static async getCheckItem(req: Request): Promise<ServiceResponse<any>> {
    try {
      const { id: cardId, checklistId, checkItemId } = req.params;

      const checkItem = await checkItemService.getCheckItem(
        cardId,
        checklistId,
        checkItemId
      );

      return new ServiceResponse(
        ResponseStatus.Success,
        'Get check item successfully',
        checkItem,
        StatusCodes.OK
      );
    } catch (error) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        (error as Error).message,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }

  static async createCheckItem(req: Request): Promise<ServiceResponse<any>> {
    try {
      const { id: cardId, checklistId } = req.params;
      const { name, position, isChecked, due, dueReminder } = req.body;

      const checkItem = await checkItemService.createCheckItem(
        cardId,
        checklistId,
        {
          name,
          position,
          isChecked,
          due,
          dueReminder,
        }
      );

      return new ServiceResponse(
        ResponseStatus.Success,
        'Check item created successfully',
        checkItem,
        StatusCodes.CREATED
      );
    } catch (error) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        (error as Error).message,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }

  static async updateCheckItem(req: Request): Promise<ServiceResponse<any>> {
    try {
      const { id: cardId, checklistId, checkItemId } = req.params;

      const {
        name,
        position,
        isChecked,
        due,
        dueReminder,
        checklistId: newChecklistId,
      } = req.body;

      const updated = await checkItemService.updateCheckItem(
        cardId,
        checklistId,
        checkItemId,
        {
          name,
          position,
          isChecked,
          due,
          dueReminder,
          checklistId: newChecklistId,
        }
      );

      return new ServiceResponse(
        ResponseStatus.Success,
        'Check item updated successfully',
        updated,
        StatusCodes.OK
      );
    } catch (error) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        (error as Error).message,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }

  static async deleteCheckItem(req: Request): Promise<ServiceResponse<null>> {
    try {
      const { id: cardId, checklistId, checkItemId } = req.params;

      await checkItemService.deleteCheckItem(cardId, checklistId, checkItemId);

      return new ServiceResponse(
        ResponseStatus.Success,
        'Check item deleted successfully',
        null,
        StatusCodes.OK
      );
    } catch (error) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        (error as Error).message,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }

  static async toggleCheckItem(req: Request): Promise<ServiceResponse<any>> {
    try {
      const { id: cardId, checklistId, checkItemId } = req.params;
      const { isChecked } = req.body;

      const updated = await checkItemService.updateCheckItem(
        cardId,
        checklistId,
        checkItemId,
        { isChecked }
      );

      return new ServiceResponse(
        ResponseStatus.Success,
        'Check item toggled successfully',
        updated,
        StatusCodes.OK
      );
    } catch (error) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        (error as Error).message,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }
}
