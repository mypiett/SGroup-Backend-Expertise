import {
  handleServiceResponse,
  validateRequest,
} from '@/common/utils/httpHandlers';
import { Router } from 'express';
import {
  CardIdSchema,
  CreateCardSchema,
  GetCardSchema,
  CardLabelSchema,
  CardMemberSchema,
  UpdateCardSchema,
  AddCommentSchema,
  UpdateCommentSchema,
  DeleteCommentSchema,
  GetActionSchema,
  CreateAttachmentSchema,
  DeleteAttachmentSchema,
  GetAttchmentsSchema,
  GetAnttachmentSchema,
  GetChecklistsSchema,
  CreateChecklistSchema,
  UpdateChecklistSchema,
  DeleteChecklistSchema,
  GetCheckItemsSchema,
  GetCheckItemSchema,
  CreateCheckItemSchema,
  UpdateCheckItemSchema,
  DeleteCheckItemSchema,
} from './card.schema';
import { CardController } from './card.controller';
import { attachmentUpload } from '@/config/multer';

const route = Router();

// Get a card
route.get('/:id', validateRequest(GetCardSchema), async (req, res) => {
  const response = await CardController.getCard(req);
  return handleServiceResponse(response, res);
});

// Create a card
route.post('/', validateRequest(CreateCardSchema), async (req, res) => {
  const response = await CardController.createCard(req);
  return handleServiceResponse(response, res);
});

// Update a card
route.put('/:id', validateRequest(UpdateCardSchema), async (req, res) => {
  const response = await CardController.updateCard(req);
  return handleServiceResponse(response, res);
});

// Delete a card
route.delete('/:id', validateRequest(CardIdSchema), async (req, res) => {
  const response = await CardController.deleteCard(req);
  return handleServiceResponse(response, res);
});

// Add label to card
route.post(
  '/:id/labels/:labelId',
  validateRequest(CardLabelSchema),
  async (req, res) => {
    const response = await CardController.addLabelToCard(req);
    return handleServiceResponse(response, res);
  }
);

// Remove label from card
route.delete(
  '/:id/labels/:labelId',
  validateRequest(CardLabelSchema),
  async (req, res) => {
    const response = await CardController.removeLabelFromCard(req);
    return handleServiceResponse(response, res);
  }
);

// Add member to card
route.post(
  '/:id/members/:memberId',
  validateRequest(CardMemberSchema),
  async (req, res) => {
    const response = await CardController.addMemberToCard(req);
    return handleServiceResponse(response, res);
  }
);

// Remove member from card
route.delete(
  '/:id/members/:memberId',
  validateRequest(CardMemberSchema),
  async (req, res) => {
    const response = await CardController.removeMemberFromCard(req);
    return handleServiceResponse(response, res);
  }
);

// Get actions/comments
route.get(
  '/:id/actions',
  validateRequest(GetActionSchema),
  async (req, res) => {
    const response = await CardController.getActions(req);
    return handleServiceResponse(response, res);
  }
);

// Add comment
route.post(
  '/:id/actions/comments',
  validateRequest(AddCommentSchema),
  async (req, res) => {
    const response = await CardController.addComment(req);
    return handleServiceResponse(response, res);
  }
);

// Update comment
route.put(
  '/:id/actions/:actionId/comments',
  validateRequest(UpdateCommentSchema),
  async (req, res) => {
    const response = await CardController.updateComment(req);
    return handleServiceResponse(response, res);
  }
);

// Delete comment
route.delete(
  '/:id/actions/:actionId/comments',
  validateRequest(DeleteCommentSchema),
  async (req, res) => {
    const response = await CardController.deleteComment(req);
    return handleServiceResponse(response, res);
  }
);

// Create attachment
route.post(
  '/:id/attachments',
  attachmentUpload.single('file'),
  validateRequest(CreateAttachmentSchema),
  async (req, res) => {
    const response = await CardController.createAttachment(req);
    return handleServiceResponse(response, res);
  }
);

// Delete attachment
route.delete(
  '/:id/attachments/:attachmentId',
  validateRequest(DeleteAttachmentSchema),
  async (req, res) => {
    const response = await CardController.deleteAttachment(req);
    return handleServiceResponse(response, res);
  }
);

// Get attachments
route.get(
  '/:id/attachments',
  validateRequest(GetAttchmentsSchema),
  async (req, res) => {
    const response = await CardController.getAttachments(req);
    return handleServiceResponse(response, res);
  }
);

// Get single attachment
route.get(
  '/:id/attachments/:attachmentId',
  validateRequest(GetAnttachmentSchema),
  async (req, res) => {
    const response = await CardController.getAttachment(req);
    return handleServiceResponse(response, res);
  }
);

// Get checklists
route.get(
  '/:id/checklists',
  validateRequest(GetChecklistsSchema),
  async (req, res) => {
    const response = await CardController.getChecklists(req);
    return handleServiceResponse(response, res);
  }
);

// Create checklist
route.post(
  '/:id/checklists',
  validateRequest(CreateChecklistSchema),
  async (req, res) => {
    const response = await CardController.createChecklist(req);
    return handleServiceResponse(response, res);
  }
);

// Update checklist
route.put(
  '/:id/checklists/:checklistId',
  validateRequest(UpdateChecklistSchema),
  async (req, res) => {
    const response = await CardController.updateChecklist(req);
    return handleServiceResponse(response, res);
  }
);

// Delete checklist
route.delete(
  '/:id/checklists/:checklistId',
  validateRequest(DeleteChecklistSchema),
  async (req, res) => {
    const response = await CardController.deleteChecklist(req);
    return handleServiceResponse(response, res);
  }
);

// Get checkItems
route.get(
  '/:id/checklists/:checklistId/checkItems',
  validateRequest(GetCheckItemsSchema),
  async (req, res) => {
    const response = await CardController.getCheckItems(req);
    return handleServiceResponse(response, res);
  }
);

// Get single checkItem
route.get(
  '/:id/checklists/:checklistId/checkItems/:checkItemId',
  validateRequest(GetCheckItemSchema),
  async (req, res) => {
    const response = await CardController.getCheckItem(req);
    return handleServiceResponse(response, res);
  }
);

// Create checkItem
route.post(
  '/:id/checklists/:checklistId/checkItems',
  validateRequest(CreateCheckItemSchema),
  async (req, res) => {
    const response = await CardController.createCheckItem(req);
    return handleServiceResponse(response, res);
  }
);

// Update checkItem
route.put(
  '/:id/checklists/:checklistId/checkItems/:checkItemId',
  validateRequest(UpdateCheckItemSchema),
  async (req, res) => {
    const response = await CardController.updateCheckItem(req);
    return handleServiceResponse(response, res);
  }
);

// Delete checkItem
route.delete(
  '/:id/checklists/:checklistId/checkItems/:checkItemId',
  validateRequest(DeleteCheckItemSchema),
  async (req, res) => {
    const response = await CardController.deleteCheckItem(req);
    return handleServiceResponse(response, res);
  }
);

export default route;
