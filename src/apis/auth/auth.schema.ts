import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string(),
  email: z.email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .regex(
      /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number or special character'
    ),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string(),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const ResetPasswordSchema = z.object({
  email: z.email('Invalid email address'),
  code: z.string(),
  newPassword: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .regex(
      /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number or special character'
    ),
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const VerifyEmailSchema = z.object({
  email: z.email('Invalid email address'),
});

export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;
