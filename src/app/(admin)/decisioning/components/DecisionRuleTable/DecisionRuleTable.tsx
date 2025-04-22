import { useState, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/sample-select";
import { SampleInput } from "@/components/ui/sample-input";
import { SampleButton } from "@/components/ui/sample-button";
import {
  InputColumn,
  OutputColumn,
  DecisionTableRow,
} from "@/types/DecisionTable";
import { DecisionDataTypes } from "@/constants/decisionTable";
import { isPartialBoolean } from "@/utils/func";
import {
  DecisionTableInputNumberOperators,
  DecisionTableInputStringOperators,
  DecisionTableInputBooleanOperators,
} from "@/constants/decisionTable";

const validateValueByDataType = (value: string, dataType: string) => {
  if (value) {
    switch (dataType) {
      case DecisionDataTypes[1]?.value:
        return !isNaN(parseFloat(value)) && isFinite(Number(value));
      case DecisionDataTypes[2]?.value:
        return isPartialBoolean(value);
    }
  }
  return true;
};

const ItemTypes = {
  ROW: "row",
};

// Can draggable row component
const DraggableRow = ({
  row,
  index,
  inputs,
  outputs,
  updateCondition,
  updateOutputResult,
  removeRow,
  moveRow,
}: {
  row: DecisionTableRow;
  index: number;
  inputs: InputColumn[];
  outputs: OutputColumn[];
  updateCondition: (
    rowUUID: string | undefined,
    inputId: number | string | undefined,
    field: string,
    value: string,
  ) => void;
  updateOutputResult: (
    rowUUID: string | undefined,
    outputId: number | string | undefined,
    field: string,
    value: string,
  ) => void;
  removeRow: (rowUUID: string | undefined) => void;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
}) => {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.ROW,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.ROW,
    hover(item: { index: number }, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      // if it is the same item, do nothing
      if (dragIndex === hoverIndex) return;

      // confirm mouse position
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // execute move when mouse over half height
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      // execute move
      moveRow(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  // move the drag and drop reference to the same element
  drag(drop(ref));

  const renderOpearators = (dataType: string) => {
    let operators: { operator: string }[] = [];
    switch (dataType) {
      case DecisionDataTypes[0]?.value:
        operators = DecisionTableInputStringOperators;
        break;
      case DecisionDataTypes[1]?.value:
        operators = DecisionTableInputNumberOperators;
        break;
      case DecisionDataTypes[2]?.value:
        operators = DecisionTableInputBooleanOperators;
        break;
      default:
        return [];
    }
    return (
      <SelectContent>
        {operators.map((c) => (
          <SelectItem key={`condition-${c.operator}`} value={c.operator}>
            {c.operator}
          </SelectItem>
        ))}
      </SelectContent>
    );
  };

  const hideInputValue = (dataType: string, operator?: string) => {
    switch (dataType) {
      case DecisionDataTypes[0]?.value:
        return (
          operator === DecisionTableInputStringOperators[0]?.operator ||
          operator === DecisionTableInputStringOperators[1]?.operator ||
          operator === DecisionTableInputStringOperators[2]?.operator ||
          operator === DecisionTableInputStringOperators[3]?.operator
        );
      case DecisionDataTypes[2]?.value:
        return (
          operator === DecisionTableInputBooleanOperators[0]?.operator ||
          operator === DecisionTableInputBooleanOperators[1]?.operator
        );
      default:
        return false;
    }
  };

  return (
    <TableRow
      ref={ref}
      key={row.uuid}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="cursor-move"
    >
      <TableCell className="border-r font-medium text-center">
        {index + 1}
      </TableCell>

      {inputs.map((input) => {
        const condition = row.decisionTableInputConditions.find(
          (c) => c.dt_input_id === input.uuid,
        );
        return (
          <TableCell
            key={`input-${row.uuid}-${input.uuid}`}
            className="border-r p-0"
          >
            <div className="flex items-center">
              <Select
                value={condition?.condition || "equals"}
                onValueChange={(value) =>
                  updateCondition(row.uuid, input.uuid, "condition", value)
                }
              >
                <SelectTrigger className="w-32 border-0 bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                {renderOpearators(input.dataType)}
              </Select>
              <SampleInput
                value={condition?.value || ""}
                onChange={(e) => {
                  if (validateValueByDataType(e.target.value, input.dataType)) {
                    updateCondition(
                      row.uuid,
                      input.uuid,
                      "value",
                      e.target.value,
                    );
                  }
                }}
                className="flex-1 border-0 border-l"
                placeholder="Enter value"
                disabled={hideInputValue(input.dataType, condition?.condition)}
              />
            </div>
          </TableCell>
        );
      })}

      {outputs.map((output) => {
        const outputResult = row.decisionTableOutputResults.find(
          (o) => o.dt_output_id === output.uuid,
        );
        return (
          <TableCell
            key={`output-${row.uuid}-${output.uuid}`}
            className="border-r p-2"
          >
            <SampleInput
              value={outputResult?.result || ""}
              onChange={(e) => {
                if (validateValueByDataType(e.target.value, output.dataType)) {
                  updateOutputResult(
                    row.uuid,
                    output.uuid,
                    "result",
                    e.target.value,
                  );
                }
              }}
              className="w-full"
              placeholder="Enter value"
            />
          </TableCell>
        );
      })}

      <TableCell>
        <SampleButton
          variant="ghost"
          size="icon"
          onClick={() => removeRow(row.uuid)}
          className="h-7 w-7 text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete Row</span>
        </SampleButton>
      </TableCell>
    </TableRow>
  );
};

const DecisionRuleTable = ({
  inputs,
  outputs,
  rows,
  updateCondition,
  updateOutputResult,
  removeRow,
  updateRowOrder,
}: {
  inputs: InputColumn[];
  outputs: OutputColumn[];
  rows: DecisionTableRow[];
  updateCondition: (
    rowUUID: string | undefined,
    inputId: number | string | undefined,
    field: string,
    value: string,
  ) => void;
  updateOutputResult: (
    rowUUID: string | undefined,
    outputId: number | string | undefined,
    field: string,
    value: string,
  ) => void;
  removeRow: (rowUUID: string | undefined) => void;
  updateRowOrder: (newOrder: DecisionTableRow[]) => void;
}) => {
  const [localRows, setLocalRows] = useState(rows);

  useEffect(() => {
    setLocalRows(rows);
  }, [rows]);

  const moveRow = (dragIndex: number, hoverIndex: number) => {
    const newRows = [...localRows];
    const draggedRow = newRows[dragIndex] as DecisionTableRow;

    // move the row to the new position
    newRows.splice(dragIndex, 1);

    // insert the row to the new position
    newRows.splice(hoverIndex, 0, draggedRow);

    setLocalRows(newRows);
    updateRowOrder(newRows);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <ScrollArea className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[100px] border-r">Rule #</TableHead>

              {inputs.map((input) => (
                <TableHead key={input.uuid} className="border-r min-w-[200px]">
                  <div className="flex flex-col">
                    <div className="font-medium">{input.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {input.dataType}
                    </div>
                  </div>
                </TableHead>
              ))}

              {outputs.map((output) => (
                <TableHead key={output.uuid} className="border-r min-w-[200px]">
                  <div className="flex flex-col">
                    <div className="font-medium">{output.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {output.dataType}
                    </div>
                  </div>
                </TableHead>
              ))}

              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localRows.map((row, index) => (
              <DraggableRow
                key={row.uuid}
                row={row}
                index={index}
                inputs={inputs}
                outputs={outputs}
                updateCondition={updateCondition}
                updateOutputResult={updateOutputResult}
                removeRow={removeRow}
                moveRow={moveRow}
              />
            ))}

            {localRows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={inputs.length + outputs.length + 2}
                  className="text-center py-6 text-muted-foreground"
                >
                  No rules defined yet. Click "Add Rule" to create your first
                  decision rule.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </DndProvider>
  );
};

export default DecisionRuleTable;
