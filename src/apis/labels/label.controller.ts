import { StatusCodes } from 'http-status-codes';
import {
  ResponseStatus,
  ServiceResponse,
} from '@/common/models/serviceResponse';
import { Request } from 'express';
import { LabelService } from './label.service';

const labelService = new LabelService();

export class LabelController {
  static async getLabelsByBoard(req: Request): Promise<ServiceResponse<any>> {
    try {
      const { boardId } = req.params;

      const labels = await labelService.getLabelsByBoard(boardId);

      return new ServiceResponse(
        ResponseStatus.Success,
        'Get labels by board successfully',
        labels,
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

  static async getLabelById(req: Request): Promise<ServiceResponse<any>> {
    try {
      const { id } = req.params;

      const label = await labelService.getLabelById(id);
      return new ServiceResponse(
        ResponseStatus.Success,
        'Get label successfully',
        label,
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

  static async createLabel(req: Request): Promise<ServiceResponse<any>> {
    try {
      const { boardId } = req.params;
      const currentUserId = req.user?.userId;
      const { name, color } = req.body;

      if (!currentUserId) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          'Unauthorized',
          null,
          StatusCodes.UNAUTHORIZED
        );
      }

      if (!boardId || !name || !color) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          'BoardId, name and color are required',
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      const label = await labelService.createLabel(boardId, name, color);

      return new ServiceResponse(
        ResponseStatus.Success,
        'Label created successfully',
        label,
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

  static async updateLabel(req: Request): Promise<ServiceResponse<any>> {
    try {
      const { id } = req.params;
      const { name, color } = req.body;

      const label = await labelService.updateLabel(id, { name, color });

      return new ServiceResponse(
        ResponseStatus.Success,
        'Label updated successfully',
        label,
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

  static async updateLabelField(req: Request): Promise<ServiceResponse<any>> {
    try {
      const { id, field } = req.params;
      const { value } = req.body;

      if (!value) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          'Value is required',
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      const result = await labelService.updateLabelField(id, field, value);

      return new ServiceResponse(
        ResponseStatus.Success,
        'Label field updated successfully',
        result,
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

  static async deleteLabel(req: Request): Promise<ServiceResponse<any>> {
    try {
      const { id } = req.params;

      await labelService.deleteLabel(id);

      return new ServiceResponse(
        ResponseStatus.Success,
        'Label deleted successfully',
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
}
