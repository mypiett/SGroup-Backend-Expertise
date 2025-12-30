import { z } from 'zod';
const uuidSchema = z.string().uuid();

export const GetLabelsByBoardSchema = z.object({
  params: z.object({
    boardId: uuidSchema,
  }),
});

export const CreateLabelSchema = z.object({
  params: z.object({
    boardId: uuidSchema,
  }),
  body: z.object({
    name: z
      .string()
      .min(1, 'Label name is required')
      .max(50, 'Label name must be at most 50 characters'),
    color: z
      .string()
      .min(1, 'Color is required')
      .max(20, 'Color must be at most 20 characters'),
  }),
});

export const GetLabelSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

export const UpdateLabelSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z
    .object({
      name: z.string().min(1).max(50).optional(),
      color: z.string().min(1).max(20).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be updated',
    }),
});

export const DeleteLabelSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});
