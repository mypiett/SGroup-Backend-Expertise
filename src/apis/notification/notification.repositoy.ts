import { AppDataSource } from '@/config/data-source';
import {
  Notification,
  NotificationType,
} from '@/common/entities/notification.entity';

export class NotificationRepository {
  private notificationRepository = AppDataSource.getRepository(Notification);

  async createNotification(data: {
    type: NotificationType;
    recipientId: string;
    actionId?: string;
    data?: any;
  }): Promise<Notification> {
    const notification = this.notificationRepository.create({
      type: data.type,
      recipientId: data.recipientId,
      actionId: data.actionId,
      data: data.data,
    });
    return this.notificationRepository.save(notification);
  }

  async createNotificationsForUsers(
    userIds: string[],
    notificationData: {
      type: NotificationType;
      actionId?: string;
      data?: any;
    }
  ): Promise<Notification[]> {
    const notifications = userIds.map((userId) =>
      this.notificationRepository.create({
        type: notificationData.type,
        recipientId: userId,
        actionId: notificationData.actionId,
        data: notificationData.data,
      })
    );
    return this.notificationRepository.save(notifications);
  }

  async getNotifications(
    userId: string,
    queryParams: {
      filter?: string;
      field?: string;
      card?: boolean;
      card_fields?: string;
      member?: boolean;
      member_fields?: string;
      memberCreator?: boolean;
      memberCreator_fields?: string;
    }
  ): Promise<Notification[]> {
    const query = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.recipientId = :userId', { userId });

    const {
      filter,
      field,
      card,
      card_fields,
      member,
      member_fields,
      memberCreator,
      memberCreator_fields,
    } = queryParams;

    if (filter === 'read') {
      query.andWhere('notification.isRead = :isRead', { isRead: true });
    } else if (filter === 'unread') {
      query.andWhere('notification.isRead = :isRead', { isRead: false });
    }

    if (field) {
      const fieldsArray = field.split(',').map((f: string) => f.trim());
      const basicFields = fieldsArray.filter(
        (f: string) =>
          !['action', 'recipient', 'card', 'memberCreator'].includes(f)
      );
      if (basicFields.length > 0) {
        query.select(basicFields.map((f: string) => `notification.${f}`));
        if (!basicFields.includes('id')) {
          query.addSelect('notification.id');
        }
      }
    }

    query.leftJoin('notification.action', 'action');
    query.addSelect(['action.id', 'action.type', 'action.date']);

    if (card) {
      query.leftJoin('action.card', 'card');
      if (card_fields) {
        const cardFieldsArray = card_fields
          .split(',')
          .map((f: string) => f.trim());
        query.addSelect(cardFieldsArray.map((f: string) => `card.${f}`));
      } else {
        query.addSelect(['card.id', 'card.title']);
      }
    }

    if (member) {
      query.leftJoin('notification.recipient', 'recipient');
      if (member_fields) {
        const memberFieldsArray = member_fields
          .split(',')
          .map((f: string) => f.trim());
        query.addSelect(memberFieldsArray.map((f: string) => `recipient.${f}`));
      } else {
        query.addSelect(['recipient.id', 'recipient.name', 'recipient.email']);
      }
    }

    if (memberCreator) {
      query.leftJoin('action.user', 'creator');
      if (memberCreator_fields) {
        const creatorFieldsArray = memberCreator_fields
          .split(',')
          .map((f: string) => f.trim());
        query.addSelect(creatorFieldsArray.map((f: string) => `creator.${f}`));
      } else {
        query.addSelect(['creator.id', 'creator.name', 'creator.email']);
      }
    }

    query.orderBy('notification.createdAt', 'DESC');

    return query.getMany();
  }

  async getNotificationById(
    notificationId: string,
    userId: string,
    queryParams: {
      field?: string;
      card?: boolean;
      card_fields?: string;
      member?: boolean;
      member_fields?: string;
      memberCreator?: boolean;
      memberCreator_fields?: string;
    }
  ): Promise<Notification | null> {
    const query = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.id = :notificationId', { notificationId })
      .andWhere('notification.recipientId = :userId', { userId });

    const {
      field,
      card,
      card_fields,
      member,
      member_fields,
      memberCreator,
      memberCreator_fields,
    } = queryParams;

    // Select specific fields
    if (field) {
      const fieldsArray = field.split(',').map((f: string) => f.trim());
      const basicFields = fieldsArray.filter(
        (f: string) =>
          !['action', 'recipient', 'card', 'memberCreator'].includes(f)
      );
      if (basicFields.length > 0) {
        query.select(basicFields.map((f: string) => `notification.${f}`));
        if (!basicFields.includes('id')) {
          query.addSelect('notification.id');
        }
      }
    }

    query.leftJoin('notification.action', 'action');
    query.addSelect(['action.id', 'action.type', 'action.date']);

    if (card) {
      query.leftJoin('action.card', 'card');
      if (card_fields) {
        const cardFieldsArray = card_fields
          .split(',')
          .map((f: string) => f.trim());
        query.addSelect(cardFieldsArray.map((f: string) => `card.${f}`));
      } else {
        query.addSelect(['card.id', 'card.title']);
      }
    }

    if (member) {
      query.leftJoin('notification.recipient', 'recipient');
      if (member_fields) {
        const memberFieldsArray = member_fields
          .split(',')
          .map((f: string) => f.trim());
        query.addSelect(memberFieldsArray.map((f: string) => `recipient.${f}`));
      } else {
        query.addSelect(['recipient.id', 'recipient.name', 'recipient.email']);
      }
    }

    if (memberCreator) {
      query.leftJoin('action.user', 'creator');
      if (memberCreator_fields) {
        const creatorFieldsArray = memberCreator_fields
          .split(',')
          .map((f: string) => f.trim());
        query.addSelect(creatorFieldsArray.map((f: string) => `creator.${f}`));
      } else {
        query.addSelect(['creator.id', 'creator.name', 'creator.email']);
      }
    }

    return query.getOne();
  }

  async updateNotificationReadStatus(
    notificationId: string,
    isRead: boolean
  ): Promise<Notification | null> {
    await this.notificationRepository.update(notificationId, { isRead });
    return this.notificationRepository.findOne({
      where: { id: notificationId },
      relations: ['action', 'recipient'],
    });
  }
}
