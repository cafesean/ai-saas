import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "@/db";
import { templates } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { TemplateStatus } from "@/constants/general";
export const templateRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    return db.select().from(templates).orderBy(desc(templates.createdAt));
  }),

  getAllByStatus: publicProcedure
    .input(z.object({ status: z.nativeEnum(TemplateStatus) }))
    .query(async ({ ctx, input }) => {
      return await db.select().from(templates).where(eq(templates.status, input.status));
    }),
});
