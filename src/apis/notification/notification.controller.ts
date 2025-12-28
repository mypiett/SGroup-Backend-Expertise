import { StatusCodes } from 'http-status-codes';
import {
  ResponseStatus,
  ServiceResponse,
} from '@/common/models/serviceResponse';
import { Request } from 'express';
import { NotificationService } from './notification.service';

const notificationService = new NotificationService();

export class NotificationController {
  static async getNotifications(req: Request): Promise<ServiceResponse> {
    try {
      const userId = (req as any).user?.userId;
      const query = req.query;
      const notifications = await notificationService.getNotifications(
        userId,
        query
      );
      return new ServiceResponse(
        ResponseStatus.Success,
        'Get notifications successfully',
        notifications,
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

  static async getNotification(req: Request): Promise<ServiceResponse> {
    try {
      const notificationId = req.params.id;
      const userId = (req as any).user?.userId;
      const query = req.query;
      const notification = await notificationService.getNotification(
        notificationId,
        userId,
        query
      );
      return new ServiceResponse(
        ResponseStatus.Success,
        'Get notification successfully',
        notification,
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

  static async updateNotificationReadStatus(
    req: Request
  ): Promise<ServiceResponse> {
    try {
      const notificationId = req.params.id;
      const userId = (req as any).user?.userId;
      const { isRead } = req.body;
      const updatedNotification =
        await notificationService.updateNotificationReadStatus(
          notificationId,
          userId,
          isRead
        );
      return new ServiceResponse(
        ResponseStatus.Success,
        'Update notification read status successfully',
        updatedNotification,
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
