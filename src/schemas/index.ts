import { z } from 'zod';

export const roleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().min(1, 'Description is required').max(500).nullable(),
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
  roles: z.array(z.number()).min(1, 'At least one role must be selected'),
});

const levelRateSchema = z.object({
  level_id: z.number().min(1, 'Level is required'),
  monthly_rate: z
    .number()
    .min(0, 'Monthly rate must be greater than or equal to 0')
    .max(1000000, 'Monthly rate must be less than or equal to 1,000,000'),
});

export const rateCardSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().nullable(),
  effective_date: z.date().or(z.string().transform((str) => new Date(str))),
  expire_date: z.date().or(z.string().transform((str) => new Date(str))).nullable(),
  level_rates: z.array(levelRateSchema)
    .min(1, 'At least one level rate must be added')
    .refine(
      (rates) => rates.every((rate) => rate.monthly_rate <= 1000000),
      'Monthly rate must be less than or equal to 1,000,000'
    ),
}).refine(
  (data) => {
    if (!data.expire_date) return true;
    return data.expire_date > data.effective_date;
  },
  {
    message: 'Expire date must be later than effective date',
    path: ['expire_date'], // This will show the error on the expire_date field
  }
);

export type RoleInput = z.infer<typeof roleSchema>;
export type LevelInput = z.infer<typeof levelSchema>;
export type RateCardInput = z.infer<typeof rateCardSchema>;
export type LevelRateInput = z.infer<typeof levelRateSchema>; 