import { ZodType, z } from 'zod';

export class AddressValidation {
  static readonly CREATE: ZodType = z.object({
    address: z.string().min(1).max(255).optional(),
    postal_code: z.number().gte(6).optional(),
    contact_id: z.string().min(1).max(50),
  });

  static readonly GET: ZodType = z.object({
    addressId: z.string().min(1).includes('address', { message: 'Invalid ID' }),
    contactId: z.string().min(1).includes('contact', { message: 'Invalid ID' }),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.string().min(1).includes('address', { message: 'Invalid ID' }),
    address: z.string().min(1).max(255).optional(),
    postal_code: z.number().gte(6).optional(),
    contact_id: z
      .string()
      .min(1)
      .includes('contact', { message: 'Invalid ID' }),
  });

  static readonly REMOVE: ZodType = z.object({
    addressId: z.string().min(1).includes('address', { message: 'Invalid ID' }),
    contactId: z.string().min(1).includes('contact', { message: 'Invalid ID' }),
  });
}
