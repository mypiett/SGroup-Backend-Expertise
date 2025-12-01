import { z } from 'zod';

export const addMemberToBoardSchema = z.object({
  email: z.email('Invalid email address'),
  roleId: z.uuid(),
});

export type AddBoardMemberInput = z.infer<typeof addMemberToBoardSchema>;
