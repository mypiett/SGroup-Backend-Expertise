import { z } from 'zod';

const booleanString = z
  .enum(['true', 'false'])
  .optional()
  .transform((value) => value === 'true');

const numberString = z
  .string()
  .refine((val) => !isNaN(Number(val)), {
    message: 'Invalid number string',
  })
  .transform((val) => Number(val));

// Card schemas
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

// Label and Member schemas
export const CardLabelSchema = z.object({
  params: z.object({
    id: z.uuid(),
    labelId: z.uuid(),
  }),
});

export const CardMemberSchema = z.object({
  params: z.object({
    id: z.uuid(),
    memberId: z.uuid(),
  }),
});

// Comment schemas
export const CardActionIdSchema = z.object({
  id: z.uuid(),
  actionId: z.uuid(),
});

export const GetActionSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
  query: z.object({
    filter: z.string().optional(),
    page: numberString.optional(),
  }),
});

export const AddCommentSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
  body: z.object({
    text: z.string().min(1, 'Text is required'),
  }),
});

export const UpdateCommentSchema = z.object({
  params: CardActionIdSchema,
  body: z.object({
    text: z.string().min(1, 'Text is required'),
  }),
});

export const DeleteCommentSchema = z.object({
  params: CardActionIdSchema,
});

// Attchment schemas
export const CreateAttachmentSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
  body: z.object({
    url: z.url('Invalid URL').optional(),
    name: z.string().min(1, 'Name is required').max(255),
    file: z.string().optional(),
    // mimeType: z.string().max(50).optional(),
    // bytes: z.number().optional(),
    setCover: booleanString,
  }),
});

export const DeleteAttachmentSchema = z.object({
  params: z.object({
    id: z.uuid(),
    attachmentId: z.uuid(),
  }),
});

export const GetAttchmentsSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
  query: z.object({
    fields: z.string().optional(),
  }),
});

export const GetAnttachmentSchema = z.object({
  params: z.object({
    id: z.uuid(),
    attachmentId: z.uuid(),
  }),
  query: z.object({
    fields: z.string().optional(),
  }),
});

// Checklist schemas
export const GetChecklistsSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
  query: z.object({
    checkItems: booleanString,
    checkItemFields: z.string().optional(),
    filter: z.string().optional(),
    field: z.string().optional(),
  }),
});

export const CreateChecklistSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
  body: z.object({
    name: z.string().min(1, 'Name is required').max(255),
    position: z.number(),
    checklistSourceId: z.uuid().optional(),
  }),
});

export const UpdateChecklistSchema = z.object({
  params: z.object({
    id: z.uuid(),
    checklistId: z.uuid(),
  }),
  body: z.object({
    name: z.string().min(1, 'Name is required').max(255).optional(),
    position: z.number().optional(),
  }),
});

export const DeleteChecklistSchema = z.object({
  params: z.object({
    id: z.uuid(),
    checklistId: z.uuid(),
  }),
});

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
