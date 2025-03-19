import type { InferSelectModel } from 'drizzle-orm';
import type schema from '@/db/schema';

// DB Types
export type DbRule = InferSelectModel<typeof schema.rules>;

export interface RuleView {
  uuid: string;
  name: string;
  description: string | null;
  status: string | null;
}

export function dbToRule(dbRule: DbRule): RuleView {
  return {
    uuid: dbRule.uuid,
    name: dbRule.name,
    description: dbRule.description,
    status: dbRule.status,
  };
}