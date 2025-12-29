import { z } from 'zod';

export const CreateChecklistSchema = z.object({
  body: z.object({
    cardId: z.string().uuid(),
    name: z.string().min(1).max(255),
  }),
});

export const ChecklistIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const EditChecklistNameSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(255),
  }),
});

export const ReorderChecklistSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    prevChecklistId: z.string().uuid().nullable(),
    nextChecklistId: z.string().uuid().nullable(),
  }),
});

export const CopyChecklistSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    targetCardId: z.string().uuid(),
    name: z.string().min(1).max(255).optional(),
  }),
});
