import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from "../trpc"
import { eq, inArray, desc, asc } from 'drizzle-orm';
import { levels, level_roles, roles } from '@/db/schema';
import { dbToAppLevel, dbToAppRole } from '@/framework/types';
import type { InferSelectModel } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/db/config';
import { TRPCError } from '@trpc/server';

type Role = InferSelectModel<typeof roles>;
type Level = InferSelectModel<typeof levels>;
type LevelRole = InferSelectModel<typeof level_roles>;

const levelSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  code: z.string().min(1),
  roles: z.array(z.number()),
});

export const levelRouter = createTRPCRouter({
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      const levelsWithRoles = await db.query.levels.findMany({
        with: {
          level_roles: {
            with: {
              role: true,
            },
          },
        },
        orderBy: asc(levels.name),
      });

      return levelsWithRoles.map(level => ({
        ...level,
        roles: level.level_roles.map(lr => lr.role),
      }));
    }),

  getById: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const level = await db.query.levels.findFirst({
        where: eq(levels.id, input),
        with: {
          level_roles: {
            with: {
              role: true,
            },
          },
        },
      });

      if (!level) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Level with ID ${input} not found`
        });
      }

      return {
        ...level,
        roles: level.level_roles.map(lr => lr.role),
      };
    }),

  create: publicProcedure
    .input(levelSchema)
    .mutation(async ({ ctx, input }) => {
      const { roles: roleIds, ...levelData } = input;

      return await db.transaction(async (tx) => {
        // Create level
        const [newLevel] = await tx.insert(levels)
          .values({
            ...levelData,
            uuid: uuidv4(),
            created_at: new Date(),
            updated_at: new Date(),
          })
          .returning();

        if (!newLevel) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create level'
          });
        }

        if (roleIds.length > 0) {
          // Create role associations
          await tx.insert(level_roles)
            .values(roleIds.map(roleId => ({
              level_id: newLevel.id,
              role_id: roleId,
            })));
        }

        // Return complete level with roles
        const completeLevel = await tx.query.levels.findFirst({
          where: eq(levels.id, newLevel.id),
          with: {
            level_roles: {
              with: {
                role: true,
              },
            },
          },
        });

        if (!completeLevel) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create level'
          });
        }

        return {
          ...completeLevel,
          roles: completeLevel.level_roles.map(lr => lr.role),
        };
      });
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      data: levelSchema.partial(),
    }))
    .mutation(async ({ input }) => {
      const { data } = input;
      const { roles: roleIds, ...levelData } = data;

      return await db.transaction(async (tx) => {
        // Update level
        const [updatedLevel] = await tx.update(levels)
          .set({
            ...levelData,
            updated_at: new Date(),
          })
          .where(eq(levels.id, input.id))
          .returning();

        if (!updatedLevel) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Level with ID ${input.id} not found`
          });
        }

        // Update role associations if provided
        if (roleIds) {
          // Delete existing associations
          await tx.delete(level_roles)
            .where(eq(level_roles.level_id, updatedLevel.id));

          if (roleIds.length > 0) {
            // Create new associations
            await tx.insert(level_roles)
              .values(roleIds.map(roleId => ({
                level_id: updatedLevel.id,
                role_id: roleId,
              })));
          }
        }

        // Return complete level with roles
        const completeLevel = await tx.query.levels.findFirst({
          where: eq(levels.id, updatedLevel.id),
          with: {
            level_roles: {
              with: {
                role: true,
              },
            },
          },
        });

        if (!completeLevel) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update level'
          });
        }

        return {
          ...completeLevel,
          roles: completeLevel.level_roles.map(lr => lr.role),
        };
      });
    }),

  delete: publicProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return await db.transaction(async (tx) => {
        // Delete role associations first
        await tx.delete(level_roles)
          .where(eq(level_roles.level_id, input));

        // Delete level
        const [level] = await tx.delete(levels)
          .where(eq(levels.id, input))
          .returning();

        if (!level) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Level with ID ${input} not found`
          });
        }

        return level;
      });
    }),

  getByCode: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const level = await db.query.levels.findFirst({
        where: eq(levels.code, input),
        with: {
          level_roles: {
            with: {
              role: true,
            },
          },
        },
      });

      if (!level) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Level with code ${input} not found`
        });
      }

      return {
        ...level,
        roles: level.level_roles.map(lr => lr.role),
      };
    }),
});