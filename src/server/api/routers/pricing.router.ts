import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/db/config';
import { pricings, pricing_roles } from '@/db/schema';
import {
  createPricingSchema,
  updatePricingSchema,
  updatePricingRoleSchema,
} from '@/app/(admin)/pricing/types/schema';
import {
  calculatePricingTotal,
  calculateResourceCount,
} from '@/app/(admin)/pricing/utils/calculations';

// Helper type for pricing role creation
type PricingRoleCreate = {
  pricing_id: number;
  role_id: number;
  level_id: number;
  quantity: number;
  override_price: string | null;
  discount_rate: string | null;
  base_price: string;
  multiplier: string;
  final_price: string;
  created_at: Date;
  updated_at: Date;
};

// Helper type for pricing role update
type PricingRoleUpdate = {
  role_id?: number;
  level_id?: number;
  quantity?: number;
  override_price?: string | null;
  discount_rate?: string | null;
  base_price?: string;
  multiplier?: string;
  final_price?: string;
  updated_at: Date;
};

export const pricingRouter = createTRPCRouter({
  // Queries
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional(),
        cursor: z.number().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { limit = 10, cursor } = input;

      const items = await db.query.pricings.findMany({
        limit: limit + 1,
        offset: cursor,
        with: {
          pricing_roles: {
            with: {
              role: true,
              level: true,
            },
          },
          ratecard: true,
        },
        orderBy: desc(pricings.created_at),
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        items.pop(); // Remove the extra item
        nextCursor = cursor ? cursor + limit : limit;
      }

      return {
        items,
        nextCursor,
      };
    }),

  getByCode: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const pricing = await db.query.pricings.findFirst({
        where: eq(pricings.code, input),
        with: {
          pricing_roles: {
            with: {
              role: true,
              level: true,
            },
          },
          ratecard: true,
        },
      });

      if (!pricing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pricing not found',
        });
      }

      // Cast price fields to number
      pricing.pricing_roles = pricing.pricing_roles.map((role) => ({
        ...role,
        override_price: role.override_price ? role.override_price : null,
        discount_rate: role.discount_rate ? role.discount_rate : null,
        base_price: role.base_price,
        multiplier: role.multiplier,
        final_price: role.final_price,
      }));

      return pricing;
    }),

  // Mutations
  create: publicProcedure
    .input(createPricingSchema)
    .mutation(async ({ input }) => {
      return await db.transaction(async (tx) => {
        // Create pricing
        const [pricing] = await tx
          .insert(pricings)
          .values({
            code: input.code,
            description: input.description,
            customer_id: input.customer_id,
            ratecard_id: input.ratecard_id,
            overall_discounts: input.overall_discounts,
            created_by: 'system', // TODO: Get from auth context
            total_amount: '0', // Will be updated after roles are created
            resource_count: 0,
            created_at: new Date(),
            updated_at: new Date(),
          })
          .returning();

        if (!pricing) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create pricing',
          });
        }

        // Create pricing roles
        if (input.pricing_roles.length > 0) {
          const pricingRolesData: PricingRoleCreate[] = input.pricing_roles.map((role) => ({
            pricing_id: pricing.id,
            role_id: role.role_id,
            level_id: role.level_id,
            quantity: role.quantity,
            override_price: role.override_price ? role.override_price.toString() : null,
            discount_rate: role.discount_rate ? role.discount_rate.toString() : null,
            base_price: '0', // TODO: Get from rate card
            multiplier: '1', // TODO: Get from level
            final_price: '0', // Will be calculated
            created_at: new Date(),
            updated_at: new Date(),
          }));

          await tx.insert(pricing_roles).values(pricingRolesData);
        }

        // Get complete pricing with roles
        const completePricing = await tx.query.pricings.findFirst({
          where: eq(pricings.id, pricing.id),
          with: {
            pricing_roles: {
              with: {
                role: true,
                level: true,
              },
            },
            ratecard: true,
          },
        });

        if (!completePricing) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create pricing',
          });
        }

        // Update totals
        const total_amount = calculatePricingTotal(
          completePricing.pricing_roles.map(role => ({
            id: role.id,
            pricing_id: role.pricing_id ?? pricing.id, // Ensure non-null
            role_id: role.role_id ?? 0, // Ensure non-null
            level_id: role.level_id ?? 0, // Ensure non-null
            quantity: role.quantity,
            base_price: role.base_price,
            multiplier: role.multiplier,
            final_price: role.final_price,
            discount_rate: role.discount_rate ? role.discount_rate : undefined,
            role: role.role ?? { id: 0, name: "" },
            level: role.level ?? { id: 0, name: "" },
          })),
          input.overall_discounts ?? null
        );
        
        const resource_count = calculateResourceCount(
          completePricing.pricing_roles.map(role => ({
            id: role.id,
            pricingId: role.pricing_id ?? pricing.id, // Renamed to match expected type
            roleId: role.role_id ?? 0, // Renamed to match expected type
            levelId: role.level_id ?? 0, // Renamed to match expected type
            quantity: role.quantity,
            base_price: role.base_price,
            multiplier: role.multiplier,
            final_price: role.final_price,
            discountRate: role.discount_rate ? role.discount_rate : undefined, // Renamed to match expected type
            role: role.role ?? { id: 0, name: "" },
            level: role.level ?? { id: 0, name: "" },
          }))
        );

        const [updatedPricing] = await tx
          .update(pricings)
          .set({
            total_amount: total_amount.toString(),
            resource_count,
          })
          .where(eq(pricings.id, pricing.id))
          .returning();

        return {
          ...updatedPricing,
          pricing_roles: completePricing.pricing_roles,
          ratecard: completePricing.ratecard,
        };
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        code: z.string(),
        data: updatePricingSchema,
      })
    )
    .mutation(async ({ input }) => {
      const { code, data } = input;

      const [pricing] = await db
        .update(pricings)
        .set({
          ...data,
          updated_at: new Date(),
        })
        .where(eq(pricings.code, code))
        .returning();

      if (!pricing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pricing not found',
        });
      }

      return pricing;
    }),

  updateRole: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: updatePricingRoleSchema,
      })
    )
    .mutation(async ({ input }) => {
      const { id, data } = input;

      return await db.transaction(async (tx) => {
        // Get current pricing role to preserve existing values
        const currentRole = await tx.query.pricing_roles.findFirst({
          where: eq(pricing_roles.id, id),
          with: {
            role: true,
            level: true,
          }
        });

        if (!currentRole) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Pricing role not found',
          });
        }

        const updateData: PricingRoleUpdate = {
          ...data,
          override_price: data.override_price?.toString() ?? currentRole.override_price,
          discount_rate: data.discount_rate?.toString() ?? currentRole.discount_rate,
          base_price: currentRole.base_price,
          multiplier: currentRole.multiplier,
          final_price: currentRole.final_price,
          updated_at: new Date(),
        };

        const [pricingRole] = await tx
          .update(pricing_roles)
          .set(updateData)
          .where(eq(pricing_roles.id, id))
          .returning();

        if (!pricingRole) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Pricing role not found',
          });
        }

        // Update pricing totals
        const pricing = await tx.query.pricings.findFirst({
          where: eq(pricings.id, pricingRole.pricing_id ?? 0), // Ensure non-null
          with: {
            pricing_roles: {
              with: {
                role: true,
                level: true,
              },
            },
          },
        });

        if (pricing) {
          const total_amount = calculatePricingTotal(
            pricing.pricing_roles.map(role => ({
              id: role.id,
              pricing_id: role.pricing_id ?? 0, // Ensure non-null
              role_id: role.role_id ?? 0, // Ensure non-null
              level_id: role.level_id ?? 0, // Ensure non-null
              quantity: role.quantity,
              base_price: role.base_price,
              multiplier: role.multiplier,
              final_price: role.final_price,
              discount_rate: role.discount_rate ? role.discount_rate : undefined,
              role: role.role ?? { id: 0, name: "" },
              level: role.level ?? { id: 0, name: "" },
            })),
            pricing.overall_discounts as Array<{ rate: number }>
          );
          
          const resource_count = calculateResourceCount(
            pricing.pricing_roles.map(role => ({
              id: role.id,
              pricingId: role.pricing_id ?? 0, // Renamed to match expected type
              roleId: role.role_id ?? 0, // Renamed to match expected type
              levelId: role.level_id ?? 0, // Renamed to match expected type
              quantity: role.quantity,
              base_price: role.base_price,
              multiplier: role.multiplier,
              final_price: role.final_price,
              discountRate: role.discount_rate ? role.discount_rate : undefined, // Renamed to match expected type
              role: role.role ?? { id: 0, name: "" },
              level: role.level ?? { id: 0, name: "" },
            }))
          );

          await tx
            .update(pricings)
            .set({
              total_amount: total_amount.toString(),
              resource_count,
              updated_at: new Date(),
            })
            .where(eq(pricings.id, pricing.id));
        }

        return pricingRole;
      });
    }),

  delete: publicProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      return await db.transaction(async (tx) => {
        // Get pricing first to get the id
        const pricing = await tx.query.pricings.findFirst({
          where: eq(pricings.code, input),
        });

        if (!pricing) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Pricing not found',
          });
        }

        // Delete pricing roles first
        await tx
          .delete(pricing_roles)
          .where(eq(pricing_roles.pricing_id, pricing.id));

        // Delete pricing
        const [deletedPricing] = await tx
          .delete(pricings)
          .where(eq(pricings.code, input))
          .returning();

        return deletedPricing;
      });
    }),
}); 