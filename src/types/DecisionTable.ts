// Types
export interface InputColumn {
  id?: number;
  uuid: string;
  variable_id: string;
  dt_id?: number | string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface OutputColumn {
  id?: number;
  uuid: string;
  variable_id: string;
  dt_id?: number | string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface Condition {
  id?: number | undefined;
  uuid: string;
  dt_input_id?: number | string;
  dt_row_id?: number | string;
  condition: string;
  value: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface OutputResult {
  id?: number | undefined;
  uuid: string;
  dt_output_id?: number | string;
  dt_row_id?: number | string;
  result: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface DecisionTableRow {
  id?: number | undefined;
  uuid: string;
  dt_id?: number | string;
  order: number;
  decisionTableInputConditions: Condition[];
  decisionTableOutputResults: OutputResult[];
  createdAt?: Date | null;
  updatedAt?: Date | null;
  type?: string;
}

export interface DecisionTable {
  id?: number | undefined;
  uuid: string;
  name: string;
  description: string | null;
  status: string;
  decisionTableRows?: DecisionTableRow[];
  decisionTableInputs?: InputColumn[];
  decisionTableOutputs?: OutputColumn[];
  createdAt?: Date | null;
  updatedAt?: Date | null;
}
