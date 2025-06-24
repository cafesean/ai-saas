// This service is responsible for integrating decision tables with workflows

type DecisionInput = Record<string, any>;
type DecisionOutput = Record<string, any>;

interface DecisionTable {
  uuid: string;
  name: string;
  inputs: InputColumn[];
  outputs: OutputColumn[];
  normalRows: DecisionRow[];
  defaultRows: DecisionRow[];
}

interface Variable {
  uuid: string;
  name: string;
  dataType: string;
}

interface InputColumn {
  uuid: string;
  variable: Variable;
}

interface OutputColumn {
  uuid: string;
  variable: Variable;
}

interface Condition {
  uuid: string;
  dt_row_id: string;
  dt_input_id: string;
  condition: string | null;
  value: string | null;
}

interface Outcome {
  uuid: string;
  dt_row_id: string;
  dt_output_id: string;
  result: string | null;
}

interface DecisionRow {
  uuid: string;
  type: string | null;
  inputConditions: Condition[];
  outputResults: Outcome[];
}

class DecisionService {
  private tables: Map<string, DecisionTable> = new Map();

  constructor() {
    // This would typically load tables from a database or API
  }

  // Register a decision table
  registerTable(table: DecisionTable): void {
    this.tables.set(table.uuid, table);
  }

  // Evaluate inputs against a decision table
  evaluate(tableId: string, inputs: DecisionInput): DecisionOutput {
    const table = this.tables.get(tableId);
    if (!table) {
      throw new Error(`Decision table '${tableId}' not found`);
    }

    // Find the first matching rule
    for (const rule of table.normalRows) {
      if (this.matchesConditions(rule.inputConditions, inputs, table.inputs)) {
        return this.extractOutcomes(rule.outputResults, table.outputs);
      }
    }

    if (table.defaultRows.length > 0 && table.defaultRows[0]) {
      return this.extractOutcomes(table.defaultRows[0].outputResults, table.outputs);
    }

    // Return default values if no rule matches
    return this.createDefaultOutput(table.outputs);
  }

  // Check if inputs match all conditions in a rule
  private matchesConditions(
    conditions: Condition[],
    inputs: DecisionInput,
    inputColumns: InputColumn[],
  ): boolean {
    for (const condition of conditions) {
      const column = inputColumns.find(
        (col) => col.uuid === condition.dt_input_id,
      );
      if (!column) continue;

      const inputValue = inputs[column.variable.name];
      const conditionValue = this.parseValue(
        condition.value || "",
        column.variable.dataType,
      );

      if (
        !this.evaluateCondition(
          inputValue,
          condition.condition || "",
          conditionValue,
          column.variable.dataType,
        )
      ) {
        return false;
      }
    }
    return true;
  }

  // Evaluate a single condition
  private evaluateCondition(
    inputValue: any,
    operator: string,
    conditionValue: any,
    dataType: string,
  ): boolean {
    switch (dataType) {
      case "string":
        return this.evaluateStringCondition(
          inputValue as string,
          operator,
          conditionValue as string,
        );
      case "number":
        return this.evaluateNumberCondition(
          inputValue as number,
          operator,
          conditionValue as number,
        );
      case "boolean":
        return this.evaluateBooleanCondition(
          inputValue as boolean,
          operator,
          conditionValue as boolean,
        );
      default:
        return false;
    }
  }

  private evaluateStringCondition(
    inputValue: string,
    operator: string,
    conditionValue: string,
  ): boolean {
    switch (operator) {
      case "exists":
        return inputValue !== undefined && inputValue !== null;
      case "does not exist":
        return inputValue === undefined || inputValue === null;
      case "is empty":
        return inputValue === "";
      case "is not empty":
        return inputValue !== "";
      case "is equal to":
        return inputValue === conditionValue;
      case "is not equal to":
        return inputValue !== conditionValue;
      case "contains":
        return inputValue.includes(conditionValue);
      case "does not contain":
        return !inputValue.includes(conditionValue);
      case "starts-with":
        return inputValue.startsWith(conditionValue);
      case "ends-with":
        return inputValue.endsWith(conditionValue);
      default:
        return false;
    }
  }

  private evaluateNumberCondition(
    inputValue: number,
    operator: string,
    conditionValue: number,
  ) {
    switch (operator) {
      case "is equal to":
        return inputValue === conditionValue;
      case "is not equal to":
        return inputValue !== conditionValue;
      case "is greater than":
        return inputValue > conditionValue;
      case "is less than":
        return inputValue < conditionValue;
      case "is greater than or equal to":
        return inputValue >= conditionValue;
      case "is less than or equal to":
        return inputValue <= conditionValue;
      default:
        return false;
    }
  }

  private evaluateBooleanCondition(
    inputValue: boolean,
    operator: string,
    conditionValue: boolean,
  ): boolean {
    switch (operator) {
      case "is true":
        return inputValue === true;
      case "is false":
        return inputValue === false;
      case "is equal to":
        return inputValue === conditionValue;
      case "is not equal to":
        return inputValue !== conditionValue;
      default:
        return false;
    }
  }

  // Extract outcomes from a rule
  private extractOutcomes(
    outcomes: Outcome[],
    outputColumns: OutputColumn[],
  ): DecisionOutput {
    const result: DecisionOutput = {};

    for (const outcome of outcomes) {
      const column = outputColumns.find(
        (col) => col.uuid === outcome.dt_output_id,
      );
      if (!column) continue;

      result[column.variable.name] = this.parseValue(
        outcome.result || "",
        column.variable.dataType,
      );
    }

    return result;
  }

  // Create default output values
  private createDefaultOutput(outputColumns: OutputColumn[]): DecisionOutput {
    const result: DecisionOutput = {};

    for (const column of outputColumns) {
      result[column.variable.name] = this.getDefaultValue(
        column.variable.dataType,
      );
    }

    return result;
  }

  // Parse value based on column type
  private parseValue(value: string, type: string): any {
    switch (type) {
      case "number":
        return Number(value);
      case "boolean":
        return value.toLowerCase() === "true";
      case "array":
        try {
          return JSON.parse(value);
        } catch {
          return [];
        }
      case "object":
        try {
          return JSON.parse(value);
        } catch {
          return {};
        }
      case "date":
        return new Date(value);
      default:
        return value;
    }
  }

  // Get default value for a type
  private getDefaultValue(type: string): any {
    switch (type) {
      case "number":
        return 0;
      case "boolean":
        return false;
      case "array":
        return [];
      case "object":
        return {};
      case "date":
        return new Date();
      default:
        return "";
    }
  }

  // Check if a workflow connection is valid
  validateConnection(
    tableId: string,
    sourceNodeType: string,
    targetNodeType: string,
  ): { valid: boolean; message?: string } {
    try {
      const result = this.evaluate(tableId, {
        "Source Node Type": sourceNodeType,
        "Target Node Type": targetNodeType,
      });

      return {
        valid: result["Can Connect"] === true,
        message: result["Message"],
      };
    } catch (error) {
      return {
        valid: false,
        message: `Error validating connection: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }
}

// Export a singleton instance
export const decisionService = new DecisionService();
