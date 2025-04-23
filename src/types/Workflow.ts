export interface WorkflowCardProps {
  id?: number | string;
  uuid: string;
  name: string;
  description: string | null;
  type: string | null;
  status: string;
  runs?: {
    count: number;
    lastRunAt?: string | Date | null;
  };
  created?: string;
  lastRun?: string | null;
  nodes?: any[];
  decisionTables?: { id: string; name: string }[];
  updatedAt: Date | string;
}
