import { levelRouter } from "@/server/api/routers/level.router";
import { rateCardRouter } from "@/server/api/routers/rateCard.router";
import { roleRouter } from "@/server/api/routers/role.router";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 * The name you use here will be the name you import in your client code.
 */
export const appRouter = createTRPCRouter({
	level: levelRouter,
	rateCard: rateCardRouter,
	role: roleRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
