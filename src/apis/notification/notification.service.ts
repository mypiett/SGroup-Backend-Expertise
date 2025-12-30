import { NotificationRepository } from './notification.repositoy';
import { NotificationType } from '@/common/entities/notification.entity';
import { sseManager } from '@/common/utils/sseManager';

export class NotificationService {
  private notificationRepository = new NotificationRepository();

  async getNotifications(userId: string, query: any): Promise<any> {
    if (!userId) {
      throw new Error('User not authenticated');
    }
    const notifications = await this.notificationRepository.getNotifications(
      userId,
      query
    );
    return notifications;
  }

  async getNotification(
    notificationId: string,
    userId: string,
    query: any
  ): Promise<any> {
    if (!userId) {
      throw new Error('User not authenticated');
    }
    const notification = await this.notificationRepository.getNotificationById(
      notificationId,
      userId,
      query
    );
    if (!notification) {
      throw new Error('Notification not found');
    }
    return notification;
  }

  async updateNotificationReadStatus(
    notificationId: string,
    userId: string,
    isRead: boolean
  ): Promise<any> {
    if (!userId) {
      throw new Error('User not authenticated');
    }
    const notification = await this.notificationRepository.getNotificationById(
      notificationId,
      userId,
      {}
    );
    if (!notification) {
      throw new Error('Notification not found');
    }
    const updatedNotification =
      await this.notificationRepository.updateNotificationReadStatus(
        notificationId,
        isRead
      );
    return updatedNotification;
  }

  async createAndSendNotification(data: {
    type: NotificationType;
    recipientId: string;
    actionId?: string;
    data?: any;
    excludeUserId?: string;
  }): Promise<void> {
    if (data.recipientId === data.excludeUserId) {
      return;
    }

    const notification = await this.notificationRepository.createNotification({
      type: data.type,
      recipientId: data.recipientId,
      actionId: data.actionId,
      data: data.data,
    });

    sseManager.sendToUser(data.recipientId, {
      type: 'new_notification',
      notification: {
        id: notification.id,
        type: notification.type,
        isRead: notification.isRead,
        data: notification.data,
        createdAt: notification.createdAt,
        actionId: notification.actionId,
      },
    });
  }

  async createAndSendNotificationsToUsers(data: {
    type: NotificationType;
    recipientIds: string[];
    actionId?: string;
    notificationData?: any;
    excludeUserId?: string;
  }): Promise<void> {
    const filteredRecipientIds = data.recipientIds.filter(
      (id) => id !== data.excludeUserId
    );

    if (filteredRecipientIds.length === 0) {
      return;
    }

    const notifications =
      await this.notificationRepository.createNotificationsForUsers(
        filteredRecipientIds,
        {
          type: data.type,
          actionId: data.actionId,
          data: data.notificationData,
        }
      );

    notifications.forEach((notification) => {
      sseManager.sendToUser(notification.recipientId, {
        type: 'new_notification',
        notification: {
          id: notification.id,
          type: notification.type,
          isRead: notification.isRead,
          data: notification.data,
          createdAt: notification.createdAt,
          actionId: notification.actionId,
        },
      });
    });
  }
}
