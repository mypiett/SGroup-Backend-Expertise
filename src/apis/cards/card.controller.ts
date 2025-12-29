import { StatusCodes } from 'http-status-codes';
import {
  ResponseStatus,
  ServiceResponse,
} from '@/common/models/serviceResponse';
import { Request, Response } from 'express';
import { CardService } from './card.service';

const cardService = new CardService();

export class CardController {
  static async getCard(req: Request): Promise<ServiceResponse> {
    try {
      const cardId = req.params.id;
      const query = req.query;
      const card = await cardService.getCard(cardId, query);
      return new ServiceResponse(
        ResponseStatus.Success,
        'Get card successfully',
        card,
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

  static async createCard(req: Request): Promise<ServiceResponse> {
    try {
      const cardData = req.body;
      const newCard = await cardService.createCard(cardData);
      return new ServiceResponse(
        ResponseStatus.Success,
        'Create card successfully',
        newCard,
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

  static async updateCard(req: Request): Promise<ServiceResponse> {
    try {
      const cardId = req.params.id;
      const updateData = req.body;
      const updatedCard = await cardService.updateCard(cardId, updateData);
      return new ServiceResponse(
        ResponseStatus.Success,
        'Update card successfully',
        updatedCard,
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

  static async deleteCard(req: Request): Promise<ServiceResponse> {
    try {
      const cardId = req.params.id;
      await cardService.deleteCard(cardId);
      return new ServiceResponse(
        ResponseStatus.Success,
        'Delete card successfully',
        null,
        StatusCodes.NO_CONTENT
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
