import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "@/db";
import { templates, InsertTemplate } from "@/db/schema/n8n";
import { parseWorkflow } from "@/lib/parser/workflow-parser";
import { desc, eq } from "drizzle-orm";
import { widgets } from "@/db/schema";

export const widgetsRouter = createTRPCRouter({
	getActiveWidgetByCode: publicProcedure.input(z.string().min(1)).query(async ({ input: code }) => {
		// const [widget] = await (await db.select().from(widgets).where(eq(widgets.code, code))).with(.limit(1);
    const widget = await db.query.widgets.findFirst({
      where: eq(widgets.code, code),
      with: {
        workflow: {
          with: {
            endpoint: true,
          },
        },
      },
    });
		if (!widget) {
			throw new Error("Widget not found");
		}

		return widget;
	}),
});
