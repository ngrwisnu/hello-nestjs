import { ZodType, z } from 'zod';

export class ContactValidation {
  static readonly CREATE: ZodType = z.object({
    first_name: z.string().min(1).max(50),
    last_name: z.string().min(1).max(50).optional(),
    email: z.string().min(1).max(50).email().optional(),
    phone: z.string().min(1).max(20).optional(),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.string().min(1),
    first_name: z.string().min(1).max(50).optional(),
    last_name: z.string().min(1).max(50).optional(),
    email: z.string().min(1).max(50).email().optional(),
    phone: z.string().min(1).max(20).optional(),
  });
}
