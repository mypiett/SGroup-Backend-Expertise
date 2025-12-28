import {
  handleServiceResponse,
  validateRequest,
} from '@/common/utils/httpHandlers';
import { Router } from 'express';
import {
  GetNotificationsSchema,
  GetNotificationSchema,
  UpdateNotificationReadStatusSchema,
} from './notification.schema';
import { NotificationController } from './notification.controller';
import { sseManager } from '@/common/utils/sseManager';
import { v4 as uuidv4 } from 'uuid';

const route = Router();

// SSE endpoint for real-time notifications
route.get('/stream', async (req, res) => {
  const userId = (req as any).user?.userId;
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const clientId = uuidv4();
  sseManager.addClient(clientId, userId, res);

  // Keep connection open
  req.on('close', () => {
    sseManager.removeClient(clientId);
  });
});

// Get all notifications for user
route.get('/', validateRequest(GetNotificationsSchema), async (req, res) => {
  const response = await NotificationController.getNotifications(req);
  return handleServiceResponse(response, res);
});

// Get a notification by id
route.get(
  '/:id',
  validateRequest(GetNotificationSchema),
  async (req, res) => {
    const response = await NotificationController.getNotification(req);
    return handleServiceResponse(response, res);
  }
);

// Update notification read status
route.put(
  '/:id',
  validateRequest(UpdateNotificationReadStatusSchema),
  async (req, res) => {
    const response = await NotificationController.updateNotificationReadStatus(
      req
    );
    return handleServiceResponse(response, res);
  }
);

export default route;
