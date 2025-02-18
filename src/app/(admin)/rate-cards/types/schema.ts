import { z } from 'zod';

// Base schemas
export const pricingBaseSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  description: z.string().min(1, 'Description is required'),
  customer_id: z.string().min(1, 'Customer is required'),
  ratecard_id: z.number().positive('Rate card is required'),
  overall_discounts: z.array(
    z.object({
      rate: z.number().min(0).max(1, 'Discount rate must be between 0 and 1'),
    })
  ).optional(),
});

export const pricingRoleBaseSchema = z.object({
  role_id: z.number().positive('Role is required'),
  level_id: z.number().positive('Level is required'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  override_price: z.number().positive('Override price must be greater than 0').optional(),
  discount_rate: z.number().min(0).max(1, 'Discount rate must be between 0 and 1').optional(),
});

// Input schemas
export const createPricingSchema = pricingBaseSchema.extend({
  pricing_roles: z.array(pricingRoleBaseSchema).min(1, 'At least one role is required'),
});

export const updatePricingSchema = pricingBaseSchema.partial();
export const updatePricingRoleSchema = pricingRoleBaseSchema.partial();

// Response schemas
export const pricingRoleSchema = pricingRoleBaseSchema.extend({
  id: z.number(),
  uuid: z.string().uuid(),
  pricing_id: z.number(),
  base_price: z.number(),
  multiplier: z.number(),
  final_price: z.number(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
  role: z.object({
    id: z.number(),
    uuid: z.string().uuid(),
    name: z.string(),
    description: z.string(),
    role_code: z.string(),
  }),
  level: z.object({
    id: z.number(),
    uuid: z.string().uuid(),
    name: z.string(),
    description: z.string(),
    code: z.string(),
  }),
});

export const pricingSchema = pricingBaseSchema.extend({
  id: z.number(),
  uuid: z.string().uuid(),
  created_by: z.string(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
  total_amount: z.number(),
  resource_count: z.number(),
  pricing_roles: z.array(pricingRoleSchema),
  rate_card: z.object({
    id: z.number(),
    uuid: z.string().uuid(),
    name: z.string(),
    description: z.string(),
    effective_date: z.date(),
    expire_date: z.date().nullable(),
  }),
});

// Types
export type PricingBase = z.infer<typeof pricingBaseSchema>;
export type PricingRoleBase = z.infer<typeof pricingRoleBaseSchema>;
export type CreatePricing = z.infer<typeof createPricingSchema>;
export type UpdatePricing = z.infer<typeof updatePricingSchema>;
export type UpdatePricingRole = z.infer<typeof updatePricingRoleSchema>;
export type PricingRole = z.infer<typeof pricingRoleSchema>;
export type Pricing = z.infer<typeof pricingSchema>; 