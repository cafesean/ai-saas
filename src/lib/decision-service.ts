// This service is responsible for integrating decision tables with workflows

type DecisionInput = Record<string, any>
type DecisionOutput = Record<string, any>

interface DecisionTable {
  id: string
  name: string
  inputs: InputColumn[]
  outputs: OutputColumn[]
  rules: DecisionRow[]
}

interface InputColumn {
  id: string
  name: string
  type: string
}

interface OutputColumn {
  id: string
  name: string
  type: string
}

interface Condition {
  inputId: string
  operator: string
  value: string
}

interface Outcome {
  outputId: string
  value: string
}

interface DecisionRow {
  id: string
  conditions: Condition[]
  outcomes: Outcome[]
}

class DecisionService {
  private tables: Map<string, DecisionTable> = new Map()

  constructor() {
    // This would typically load tables from a database or API
  }

  // Register a decision table
  registerTable(table: DecisionTable): void {
    this.tables.set(table.id, table)
  }

  // Evaluate inputs against a decision table
  evaluate(tableId: string, inputs: DecisionInput): DecisionOutput {
    const table = this.tables.get(tableId)
    if (!table) {
      throw new Error(`Decision table '${tableId}' not found`)
    }

    // Find the first matching rule
    for (const rule of table.rules) {
      if (this.matchesConditions(rule.conditions, inputs, table.inputs)) {
        return this.extractOutcomes(rule.outcomes, table.outputs)
      }
    }

    // Return default values if no rule matches
    return this.createDefaultOutput(table.outputs)
  }

  // Check if inputs match all conditions in a rule
  private matchesConditions(conditions: Condition[], inputs: DecisionInput, inputColumns: InputColumn[]): boolean {
    for (const condition of conditions) {
      const column = inputColumns.find((col) => col.id === condition.inputId)
      if (!column) continue

      const inputValue = inputs[column.name]
      const conditionValue = this.parseValue(condition.value, column.type)

      if (!this.evaluateCondition(inputValue, condition.operator, conditionValue)) {
        return false
      }
    }
    return true
  }

  // Evaluate a single condition
  private evaluateCondition(inputValue: any, operator: string, conditionValue: any): boolean {
    switch (operator) {
      case "equals":
        return inputValue === conditionValue
      case "not-equals":
        return inputValue !== conditionValue
      case "greater-than":
        return inputValue > conditionValue
      case "less-than":
        return inputValue < conditionValue
      case "contains":
        return inputValue.includes(conditionValue)
      case "starts-with":
        return inputValue.startsWith(conditionValue)
      case "ends-with":
        return inputValue.endsWith(conditionValue)
      default:
        return false
    }
  }

  // Extract outcomes from a rule
  private extractOutcomes(outcomes: Outcome[], outputColumns: OutputColumn[]): DecisionOutput {
    const result: DecisionOutput = {}

    for (const outcome of outcomes) {
      const column = outputColumns.find((col) => col.id === outcome.outputId)
      if (!column) continue

      result[column.name] = this.parseValue(outcome.value, column.type)
    }

    return result
  }

  // Create default output values
  private createDefaultOutput(outputColumns: OutputColumn[]): DecisionOutput {
    const result: DecisionOutput = {}

    for (const column of outputColumns) {
      result[column.name] = this.getDefaultValue(column.type)
    }

    return result
  }

  // Parse value based on column type
  private parseValue(value: string, type: string): any {
    switch (type) {
      case "number":
        return Number(value)
      case "boolean":
        return value.toLowerCase() === "true"
      case "array":
        try {
          return JSON.parse(value)
        } catch {
          return []
        }
      case "object":
        try {
          return JSON.parse(value)
        } catch {
          return {}
        }
      case "date":
        return new Date(value)
      default:
        return value
    }
  }

  // Get default value for a type
  private getDefaultValue(type: string): any {
    switch (type) {
      case "number":
        return 0
      case "boolean":
        return false
      case "array":
        return []
      case "object":
        return {}
      case "date":
        return new Date()
      default:
        return ""
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
      })

      return {
        valid: result["Can Connect"] === true,
        message: result["Message"],
      }
    } catch (error) {
      return {
        valid: false,
        message: `Error validating connection: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }
}

// Export a singleton instance
export const decisionService = new DecisionService()

