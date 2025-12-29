import { z } from 'zod';

const booleanString = z
  .enum(['true', 'false'])
  .optional()
  .transform((value) => value === 'true');

export const CardIdSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});

export const GetCardSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
  query: z.object({
    fields: z.string().optional(),
    actions: z.string().optional(), // chưa biết implement kịp không :)))
    attachments: booleanString,
    attachment_fields: z.string().optional(),
    members: z.string().optional(),
    member_fields: z.string().optional(),
    checkItemStates: booleanString,
    checklist: booleanString,
    checkItemFields: z.string().optional(),
    list: booleanString,
    board: booleanString,
    board_fields: z.string().optional(),
    // customFieldItems: booleanString,
  }),
});

export const CreateCardSchema = z.object({
  body: z.object({
    listId: z.uuid(),
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().optional(),
    position: z.number().optional(),
    coverUrl: z.url().optional(),
    start: z.string().optional(),
    due: z.string().optional(),
    isCompleted: z.boolean().optional(),
    cardSourceId: z.uuid().optional(),
    keepFromSource: z.string().optional(),
    memberIds: z.array(z.uuid()).optional(),
    labelIds: z.array(z.uuid()).optional(),
  }),
});

export const UpdateCardSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    position: z.number().optional(),
    isArchived: z.boolean().optional(),
    listId: z.uuid().optional(),
    boardId: z.uuid().optional(),
    coverUrl: z.url().optional(),
    start: z.string().optional(),
    due: z.string().optional(),
    isCompleted: z.boolean().optional(),
  }),
});
