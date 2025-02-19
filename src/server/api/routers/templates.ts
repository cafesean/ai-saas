import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "@/db";
import { templates, insertTemplateSchema } from "@/db/schema/n8n";
import { parseWorkflow } from "@/lib/parser/workflow-parser";
import { and, eq, desc, sql } from 'drizzle-orm';

export const templatesRouter = createTRPCRouter({
	create: publicProcedure.input(z.unknown()).mutation(async ({ input }) => {
		const parsedTemplate = await parseWorkflow(input);
		return db.insert(templates).values(parsedTemplate).returning();
	}),

	list: publicProcedure.query(async () => {
		return db.select().from(templates).orderBy(desc(templates.created_at));
	}),

	get: publicProcedure.input(z.string().uuid()).query(async ({ input: id }) => {
		const [template] = await db.select().from(templates).where(eq(templates.id, id)).limit(1);

		if (!template) {
			throw new Error("Template not found");
		}

		return template;
	}),
});
