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

/**
 * @swagger
 * /notifications/stream:
 *   get:
 *     tags:
 *       - Notification
 *     summary: SSE endpoint for real-time notifications
 *     description: |
 *       Server-Sent Events endpoint for receiving real-time notifications.
 *       This endpoint maintains an open connection and pushes notifications as they occur.
 *
 *       **Event Types:**
 *       - `connected`: Initial connection confirmation with clientId
 *       - `notification`: New notification event with notification data
 *
 *       **Usage:**
 *       ```javascript
 *       const eventSource = new EventSource('/api/notifications/stream?token=YOUR_JWT_TOKEN');
 *       eventSource.addEventListener('notification', (e) => {
 *         const data = JSON.parse(e.data);
 *         console.log('New notification:', data);
 *       });
 *       ```
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         description: JWT token (alternative to Authorization header for SSE clients)
 *     responses:
 *       200:
 *         description: SSE stream connected successfully
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   example: notification
 *                 notification:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     type:
 *                       type: string
 *                       enum: [card_comment, card_attachment_added, card_due_soon]
 *                     isRead:
 *                       type: boolean
 *                     data:
 *                       type: object
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: User not authenticated
 */
// SSE endpoint for real-time notifications
route.get('/stream', (req, res) => {
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

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags:
 *       - Notification
 *     summary: Get all notifications for user
 *     description: Retrieve all notifications for the authenticated user with optional filtering
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [all, read, unread]
 *           default: all
 *         description: Filter notifications by read status
 *       - in: query
 *         name: field
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to return (e.g., "id,type,isRead,createdAt")
 *       - in: query
 *         name: card
 *         schema:
 *           type: boolean
 *         description: Include card information
 *       - in: query
 *         name: card_fields
 *         schema:
 *           type: string
 *         description: Comma-separated list of card fields to return
 *       - in: query
 *         name: member
 *         schema:
 *           type: boolean
 *         description: Include recipient member information
 *       - in: query
 *         name: member_fields
 *         schema:
 *           type: string
 *         description: Comma-separated list of member fields to return
 *       - in: query
 *         name: memberCreator
 *         schema:
 *           type: boolean
 *         description: Include action creator information
 *       - in: query
 *         name: memberCreator_fields
 *         schema:
 *           type: string
 *         description: Comma-separated list of memberCreator fields to return
 *     responses:
 *       200:
 *         description: Successfully retrieved notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       type:
 *                         type: string
 *                         enum: [card_comment, card_attachment_added, card_due_soon]
 *                       isRead:
 *                         type: boolean
 *                       data:
 *                         type: object
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */
// Get all notifications for user
route.get('/', validateRequest(GetNotificationsSchema), async (req, res) => {
  const response = await NotificationController.getNotifications(req);
  return handleServiceResponse(response, res);
});

/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     tags:
 *       - Notification
 *     summary: Get a notification by ID
 *     description: Retrieve a specific notification by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Notification ID
 *       - in: query
 *         name: field
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to return
 *       - in: query
 *         name: card
 *         schema:
 *           type: boolean
 *         description: Include card information
 *       - in: query
 *         name: card_fields
 *         schema:
 *           type: string
 *         description: Comma-separated list of card fields to return
 *       - in: query
 *         name: member
 *         schema:
 *           type: boolean
 *         description: Include recipient member information
 *       - in: query
 *         name: member_fields
 *         schema:
 *           type: string
 *         description: Comma-separated list of member fields to return
 *       - in: query
 *         name: memberCreator
 *         schema:
 *           type: boolean
 *         description: Include action creator information
 *       - in: query
 *         name: memberCreator_fields
 *         schema:
 *           type: string
 *         description: Comma-separated list of memberCreator fields to return
 *     responses:
 *       200:
 *         description: Successfully retrieved notification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     type:
 *                       type: string
 *                       enum: [card_comment, card_attachment_added, card_due_soon]
 *                     isRead:
 *                       type: boolean
 *                     data:
 *                       type: object
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Notification not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */
// Get a notification by id
route.get('/:id', validateRequest(GetNotificationSchema), async (req, res) => {
  const response = await NotificationController.getNotification(req);
  return handleServiceResponse(response, res);
});

/**
 * @swagger
 * /notifications/{id}:
 *   put:
 *     tags:
 *       - Notification
 *     summary: Update notification read status
 *     description: Mark a notification as read or unread
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Notification ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isRead
 *             properties:
 *               isRead:
 *                 type: boolean
 *                 description: Set to true to mark as read, false to mark as unread
 *                 example: true
 *     responses:
 *       200:
 *         description: Successfully updated notification read status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     type:
 *                       type: string
 *                     isRead:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Notification not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */
// Update notification read status
route.put(
  '/:id',
  validateRequest(UpdateNotificationReadStatusSchema),
  async (req, res) => {
    const response =
      await NotificationController.updateNotificationReadStatus(req);
    return handleServiceResponse(response, res);
  }
);

export default route;
