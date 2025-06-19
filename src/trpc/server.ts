import { appRouter } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';

export const api = appRouter.createCaller(await createTRPCContext());