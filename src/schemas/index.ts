import { z } from 'zod';

export const roleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().min(1, 'Description is required').max(500),
  roleCode: z
    .string()
    .min(1, 'Role code is required')
    .max(10)
    .regex(/^[A-Z0-9]+$/, 'Role code must be uppercase letters and numbers only'),
});

export const levelSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().min(1, 'Description is required').max(500),
  code: z
    .string()
    .min(1, 'Code is required')
    .max(10)
    .regex(/^[A-Z0-9]+$/, 'Code must be uppercase letters and numbers only'),
  roles: z.array(z.string()).min(1, 'At least one role must be selected'),
});

const levelRateSchema = z.object({
  levelId: z.string().min(1, 'Level is required'),
  monthlyRate: z
    .number()
    .min(0, 'Monthly rate must be greater than or equal to 0')
    .max(1000000, 'Monthly rate must be less than or equal to 1,000,000'),
});

export const rateCardSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().min(1, 'Description is required').max(500),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  expireDate: z.string().min(1, 'Expire date is required'),
  levelRates: z.array(levelRateSchema).min(1, 'At least one level rate must be added'),
});

export type RoleInput = z.infer<typeof roleSchema>;
export type LevelInput = z.infer<typeof levelSchema>;
export type RateCardInput = z.infer<typeof rateCardSchema>;
export type LevelRateInput = z.infer<typeof levelRateSchema>; 