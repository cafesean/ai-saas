import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, publicProcedure } from "../trpc"
import { insertUserSchema, users } from "../../db/schema"
import { db } from "../../db"
import { eq } from "drizzle-orm"

export const userRouter = createTRPCRouter({
  list: publicProcedure
    .query(async () => {
      return await db.select().from(users).orderBy(users.createdAt)
    }),

  create: publicProcedure
    .input(insertUserSchema)
    .mutation(async ({ input }) => {
      try {
        const [user] = await db.insert(users).values(input).returning()
        return user
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
          cause: error,
        })
      }
    }),

  update: publicProcedure
    .input(insertUserSchema.partial().extend({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input
      try {
        const [user] = await db
          .update(users)
          .set(data)
          .where(eq(users.id, id))
          .returning()
        
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          })
        }

        return user
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user",
          cause: error,
        })
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const [user] = await db
          .delete(users)
          .where(eq(users.id, input.id))
          .returning()

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          })
        }

        return user
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete user",
          cause: error,
        })
      }
    }),
}) 