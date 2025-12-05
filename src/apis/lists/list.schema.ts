import { z } from 'zod';

// --- List Id Schema ---
export const ListIdSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});

// --- Move List to Board Schema ---
export const MoveListToBoardSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
  body: z.object({
    boardId: z.uuid(),
    position: z.number().int().min(0).optional(),
  }),
});

// --- Move All Cards Schema ---
export const MoveAllCardsSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
  body: z.object({
    targetListId: z.uuid(),
    targetBoardId: z.uuid().optional(),
  }),
});

// --- Copy List Schema ---
export const CopyListSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
  body: z.object({
    targetBoardId: z.uuid(),
    title: z.string().min(1).max(255).optional(),
    position: z.number().int().min(0).optional(),
  }),
});
