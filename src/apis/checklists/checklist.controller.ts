import { StatusCodes } from 'http-status-codes';
import {
  ServiceResponse,
  ResponseStatus,
} from '@/common/models/serviceResponse';
import { ChecklistService } from './checklist.service';
import { Request } from 'express';

const checklistService = new ChecklistService();

export class ChecklistController {
  static async getByCard(cardId: string) {
    try {
      const data = await checklistService.getByCard(cardId);
      return new ServiceResponse(
        ResponseStatus.Success,
        'Get checklists successfully',
        data,
        StatusCodes.OK
      );
    } catch (e: any) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        e.message,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }

  static async getChecklistById(id: string) {
    try {
      const data = await checklistService.getChecklistById(id);

      return new ServiceResponse(
        ResponseStatus.Success,
        'Get checklist successfully',
        data,
        StatusCodes.OK
      );
    } catch (e: any) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        e.message,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }

  static async create(req: Request) {
    try {
      const { cardId, name } = req.body;
      const data = await checklistService.create(cardId, name);

      return new ServiceResponse(
        ResponseStatus.Success,
        'Checklist created',
        data,
        StatusCodes.CREATED
      );
    } catch (e: any) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        e.message,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }

  static async rename(id: string, name: string) {
    try {
      const data = await checklistService.rename(id, name);
      return new ServiceResponse(
        ResponseStatus.Success,
        'Checklist renamed',
        data,
        StatusCodes.OK
      );
    } catch (e: any) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        e.message,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }

  static async delete(id: string) {
    try {
      await checklistService.delete(id);
      return new ServiceResponse(
        ResponseStatus.Success,
        'Checklist deleted',
        null,
        StatusCodes.OK
      );
    } catch (e: any) {
      return new ServiceResponse(
        ResponseStatus.Failed,
        e.message,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
  }
}
