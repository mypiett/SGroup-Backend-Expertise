import { z } from 'zod';

export const GetCheckItemsSchema = z.object({
  params: z.object({
    id: z.uuid(),
    checklistId: z.uuid(),
  }),
  query: z.object({
    filter: z.string().optional(),
    field: z.string().optional(),
  }),
});

export const CheckItemIdSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});

export const GetCheckItemSchema = z.object({
  params: z.object({
    id: z.uuid(),
    checklistId: z.uuid(),
    checkItemId: z.uuid(),
  }),
});

export const CreateCheckItemSchema = z.object({
  params: z.object({
    id: z.uuid(),
    checklistId: z.uuid(),
  }),
  body: z.object({
    name: z.string().min(1, 'Name is required').max(255),
    position: z.number().optional(),
    isChecked: z.boolean().optional(),
    due: z.string().optional(),
    dueReminder: z.string().optional(),
  }),
});

export const UpdateCheckItemSchema = z.object({
  params: z.object({
    id: z.uuid(),
    checklistId: z.uuid(),
    checkItemId: z.uuid(),
  }),
  body: z.object({
    name: z.string().min(1, 'Name is required').max(255).optional(),
    position: z.number().optional(),
    isChecked: z.boolean().optional(),
    due: z.string().optional(),
    dueReminder: z.string().optional(),
    checklistId: z.uuid().optional(),
  }),
});

export const DeleteCheckItemSchema = z.object({
  params: z.object({
    id: z.uuid(),
    checklistId: z.uuid(),
    checkItemId: z.uuid(),
  }),
});
