import { ZodType, z } from 'zod';

export class UserValidation {
  static readonly REGISTER: ZodType = z.object({
    username: z.string().min(1).max(50),
    password: z.string().min(1).max(50),
    name: z.string().min(1).max(50),
  });

  static readonly LOGIN: ZodType = z.object({
    username: z.string().min(1).max(50),
    password: z.string().min(1).max(50),
  });

  static readonly UPDATE: ZodType = z.object({
    name: z.string().min(1).max(50).optional(),
    password: z.string().min(1).max(50).optional(),
  });
}
