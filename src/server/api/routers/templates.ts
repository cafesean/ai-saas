import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "@/db";
import { templates, InsertTemplate } from "@/db/schema/n8n";
import { parseWorkflow } from "@/lib/parser/workflow-parser";
import { desc, eq } from "drizzle-orm";

export const templatesRouter = createTRPCRouter({
	create: publicProcedure.input(z.unknown()).mutation(async ({ input }) => {
		const parsedTemplate = await parseWorkflow(input);
		return db
			.insert(templates)
			.values({
				name: "Untitled Template", // Default name since parser doesn't return name
				description: undefined, // Default description since parser doesn't return description
				flowId: parsedTemplate.templateId || "unknown",
				provider: "n8n",
				versionId: parsedTemplate.versionId,
				instanceId: parsedTemplate.instanceId,
				userInputs: parsedTemplate.userInputs,
				workflowJson: parsedTemplate.workflowJson,
				orgId: 1, // Default org for now
			})
			.returning();
	}),

	list: publicProcedure.query(async () => {
		return db.select().from(templates).orderBy(desc(templates.createdAt));
	}),

	get: publicProcedure.input(z.string().uuid()).query(async ({ input: uuid }) => {
		const [template] = await db.select().from(templates).where(eq(templates.uuid, uuid)).limit(1);

		if (!template) {
			throw new Error("Template not found");
		}

		return template;
	}),
});
