import type { InferSelectModel } from 'drizzle-orm';
import type { templates } from '@/db/schema';

// DB Types
export type DbTemplate = InferSelectModel<typeof templates>;

export interface TemplateBlockView {
  uuid: string;
  name: string;
  description: string | null;
  flowId: string;
  userInputs: Record<string, unknown> | null;
}

export function dbToTemplateBlock(dbTemplate: DbTemplate): TemplateBlockView {
  return {
    uuid: dbTemplate.uuid,
    name: dbTemplate.name,
    description: dbTemplate.description,
    flowId: dbTemplate.flowId,
    userInputs: dbTemplate.userInputs,
  };
}