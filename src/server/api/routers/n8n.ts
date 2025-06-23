import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { db } from "@/db";
import { templates, nodeTypes } from "@/db/schema/n8n";
import { parseWorkflow } from "@/lib/parser/workflow-parser";
import { eq, desc } from "drizzle-orm";

export const n8nRouter = createTRPCRouter({
	// Template procedures
	createTemplate: publicProcedure.input(z.unknown()).mutation(async ({ input }) => {
		const parsedTemplate = await parseWorkflow(input);
		return db
			.insert(templates)
			.values({
				name: "Untitled Template", // Default name since parsedTemplate doesn't have name
				description: undefined, // Default description since parsedTemplate doesn't have description
				flowId: parsedTemplate.templateId || "unknown",
				provider: "n8n", // Default provider since parsedTemplate doesn't have provider
				versionId: parsedTemplate.versionId,
				instanceId: parsedTemplate.instanceId,
				userInputs: parsedTemplate.userInputs,
				workflowJson: parsedTemplate.workflowJson,
				orgId: 1, // Default org for now
			})
			.returning();
	}),

	listTemplates: publicProcedure.query(async () => {
		return db.select().from(templates).orderBy(desc(templates.createdAt));
	}),

	getTemplate: publicProcedure.input(z.string().uuid()).query(async ({ input: uuid }) => {
		const [template] = await db.select().from(templates).where(eq(templates.uuid, uuid)).limit(1);

		if (!template) {
			throw new Error("Template not found");
		}

		return template;
	}),

	// Node type procedures
	listNodeTypes: publicProcedure.query(async () => {
		return db.select().from(nodeTypes).orderBy(desc(nodeTypes.createdAt));
	}),

	createNodeType: publicProcedure
		.input(
			z.object({
				type: z.string(),
				category: z.string(),
				description: z.string().optional(),
			})
		)
		.mutation(async ({ input }) => {
			return db.insert(nodeTypes).values(input).returning();
		}),

	updateNodeType: publicProcedure
		.input(
			z.object({
				uuid: z.string().uuid(),
				type: z.string(),
				category: z.string(),
				description: z.string().optional(),
			})
		)
		.mutation(async ({ input: { uuid, ...data } }) => {
			const [nodeType] = await db.update(nodeTypes).set(data).where(eq(nodeTypes.uuid, uuid)).returning();

			if (!nodeType) {
				throw new Error("Node type not found");
			}

			return nodeType;
		}),

	deleteNodeType: publicProcedure.input(z.string().uuid()).mutation(async ({ input: uuid }) => {
		await db.delete(nodeTypes).where(eq(nodeTypes.uuid, uuid));
		return { success: true };
	}),
});