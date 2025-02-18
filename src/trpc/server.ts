import { appRouter } from '@/server/api/root';
import { createPagesRouterContext } from '@/server/api/trpc';

export const api = appRouter.createCaller(createPagesRouterContext()); 