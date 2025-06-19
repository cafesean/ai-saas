import type { InferSelectModel } from 'drizzle-orm';
import type { workflows } from '@/db/schema';

// DB Types
export type DbWorkflow = InferSelectModel<typeof workflows>;

export interface WorkflowView {
  uuid: string;
  name: string;
  description: string | null;
  status: string | null;
}

export function dbToWorkflow(dbWorkflow: DbWorkflow): WorkflowView {
  return {
    uuid: dbWorkflow.uuid,
    name: dbWorkflow.name,
    description: dbWorkflow.description,
    status: dbWorkflow.status,
  };
}