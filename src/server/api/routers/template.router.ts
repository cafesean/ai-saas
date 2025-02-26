import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "@/db";
import schema from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { TemplateStatus } from "@/constants/general";
export const templateRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    return db.select().from(schema.templates).orderBy(desc(schema.templates.createdAt));
  }),

  getAllByStatus: publicProcedure
    .input(z.object({ status: z.nativeEnum(TemplateStatus) }))
    .query(async ({ ctx, input }) => {
      return await db.select().from(schema.templates).where(eq(schema.templates.status, input.status));
    }),
});
