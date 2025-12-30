import { z } from 'zod';

const booleanString = z
  .enum(['true', 'false'])
  .optional()
  .transform((value) => value === 'true');

// Card schemas
export const NotificationIdSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});

export const GetNotificationsSchema = z.object({
  query: z.object({
    filter: z.string().optional(), // all là mặc định, read, unread
    field: z.string().optional(),
    card: booleanString,
    card_fields: z.string().optional(),
    member: booleanString,
    member_fields: z.string().optional(),
    memberCreator: booleanString,
    memberCreator_fields: z.string().optional(),
  }),
});

export const GetNotificationSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
  query: z.object({
    field: z.string().optional(),
    card: booleanString,
    card_fields: z.string().optional(),
    member: booleanString,
    member_fields: z.string().optional(),
    memberCreator: booleanString,
    memberCreator_fields: z.string().optional(),
  }),
});

export const UpdateNotificationReadStatusSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
  body: z.object({
    isRead: z.boolean(),
  }),
});
