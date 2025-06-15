import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

import { Button } from "@/components/form/Button";
import { Input } from "@/components/form/Input";
import {
  Select,
  SelectLabel,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/form/Select2";
import { Textarea } from "@/components/form/Textarea";
import {
  RuleTypes,
  RuleOperators,
  RuleGroupLogicalOperators,
  RuleFlowActionTypes,
} from "@/constants/rule";

const newAndCondition = {
  type: RuleTypes.condition,
  field: "",
  value: "",
  operator: RuleOperators[0]?.operator,
};

const newOrGroup = {
  type: RuleTypes.conditionGroup,
  logicalOperator: RuleGroupLogicalOperators.OR,
  childrenItems: [],
};

const newFlowAction = {
  type: RuleFlowActionTypes[0]?.value,
  content: "",
};

const initialFlows = [
  {
    id: uuidv4(),
    type: RuleTypes.flow,
    childrenItems: [
      {
        id: uuidv4(),
        type: RuleTypes.conditionGroup,
        logicalOperator: RuleGroupLogicalOperators.OR,
        childrenItems: [
          {
            id: uuidv4(),
            ...newAndCondition,
          },
        ],
      },
    ],
    action: {
      id: uuidv4(),
      ...newFlowAction,
    },
  },
];

const RuleForm = ({
  rule,
  handleCreateRule,
  handleUpdateRule,
}: {
  rule?: any;
  handleCreateRule?: (rule: any) => void;
  handleUpdateRule?: (rule: any) => void;
}) => {
  const [name, setName] = useState(rule ? rule?.name : "");
  const [description, setDescription] = useState(rule ? rule?.description : "");
  const [flows, setFlows] = useState<any[]>(rule ? rule.flows : initialFlows);

  const handleAddFlow = () => {
    setFlows((prev) => {
      return [
        ...prev,
        {
          id: uuidv4(),
          type: RuleTypes.flow,
          childrenItems: [
            {
              id: uuidv4(),
              ...newOrGroup,
              childrenItems: [
                {
                  id: uuidv4(),
                  ...newAndCondition,
                },
              ],
            },
          ],
          action: {
            id: uuidv4(),
            ...newFlowAction,
          },
        },
      ];
    });
  };

  const handleAddOrCondition = (flowId: string) => {
    setFlows((prev) => {
      return prev.map((flow) => {
        if (flow.id === flowId) {
          return {
            ...flow,
            childrenItems: [
              ...flow.childrenItems,
              {
                id: uuidv4(),
                ...newOrGroup,
                childrenItems: [
                  {
                    id: uuidv4(),
                    ...newAndCondition,
                  },
                ],
              },
            ],
          };
        }
        return flow;
      });
    });
  };

  const handleAddCondition = (groupId: string) => {
    setFlows((prev) => {
      return prev.map((flow) => {
        if (flow.childrenItems?.length > 0) {
          return {
            ...flow,
            childrenItems: flow.childrenItems.map((group: any) => {
              if (group.id === groupId) {
                return {
                  ...group,
                  childrenItems: [
                    ...group.childrenItems,
                    {
                      id: uuidv4(),
                      ...newAndCondition,
                    },
                  ],
                };
              }
              return group;
            }),
          };
        }
        return flow;
      });
    });
  };

  const handleDeleteCondition = (id: string) => {
    setFlows((prev) => {
      return prev.map((flow) => {
        if (flow.childrenItems?.length > 0) {
          return {
            ...flow,
            childrenItems: flow.childrenItems.map((group: any) => {
              if (group.childrenItems?.length > 0) {
                return {
                  ...group,
                  childrenItems: group.childrenItems.filter(
                    (condition: any) => condition.id !== id,
                  ),
                };
              }
              return group;
            }),
          };
        }
        return flow;
      });
    });
  };

  const handleDeleteConditionGroup = (id: string) => {
    setFlows((prev) => {
      return prev.map((flow) => {
        if (flow.childrenItems?.length > 0) {
          return {
            ...flow,
            childrenItems: flow.childrenItems.filter(
              (group: any) => group.id !== id,
            ),
          };
        }
        return flow;
      });
    });
  };

  const handleDeleteFlow = (id: string) => {
    setFlows((prev) => {
      return prev.filter((flow) => flow.id !== id);
    });
  };

  const handleUpdateConditionFieldValue = (
    id: string,
    field: string,
    value: string,
  ) => {
    setFlows((prev) => {
      return prev.map((flow) => {
        if (flow.childrenItems?.length > 0) {
          return {
            ...flow,
            childrenItems: flow.childrenItems.map((group: any) => {
              if (group.childrenItems?.length > 0) {
                return {
                  ...group,
                  childrenItems: group.childrenItems.map((condition: any) => {
                    if (condition.id === id) {
                      return {
                        ...condition,
                        [field]: value,
                      };
                    }
                    return condition;
                  }),
                };
              }
              return group;
            }),
          };
        }
        return flow;
      });
    });
  };

  const checkConditions = (conditions: any) => {
    let valid = true;
    conditions.forEach((condition: any) => {
      if (!condition.field || !condition.value || !condition.operator) {
        valid = false;
      }
    });
    return valid;
  };

  const handleUpdateFlowAction = (id: string, field: string, value: string) => {
    setFlows((prev) => {
      return prev.map((flow) => {
        if (flow.id === id) {
          return {
            ...flow,
            action: {
              ...flow.action,
              [field]: value,
            },
          };
        }
        return flow;
      });
    });
  };

  const handlePublish = () => {
    if (handleCreateRule) {
      // TODO: publish rule
      if (!name) {
        toast.error("Name is required");
        return;
      }

      const valid = flows.every((flow: any) => {
        return flow.childrenItems.every((group: any) => {
          return checkConditions(group.childrenItems);
        });
      });
      if (!valid) {
        toast.error("All conditions must have a field, value and operator");
        return;
      }

      const validAction = flows.every((flow: any) => {
        return flow.action.type && flow.action.content;
      });
      if (!validAction) {
        toast.error("All flows must have an action");
        return;
      }
      const rule = {
        name,
        description,
        flows,
      };
      handleCreateRule(rule);
    }
  };

  const handleUpdate = () => {
    if (handleUpdateRule) {
      // TODO: update rule
      if (!name) {
        toast.error("Name is required");
        return;
      }
      const valid = flows.every((flow: any) => {
        return flow.childrenItems.every((group: any) => {
          return checkConditions(group.childrenItems);
        });
      });
      if (!valid) {
        toast.error("All conditions must have a field, value and operator");
        return;
      }
      const validAction = flows.every((flow: any) => {
        return flow.action.type && flow.action.content;
      });
      if (!validAction) {
        toast.error("All flows must have an action");
        return;
      }
      const updateRule = {
        id: rule?.id,
        name,
        description,
        flows,
      };
      handleUpdateRule(updateRule);
    }
  };

  const renderFlowActionResult = (flow: any) => {
    switch (flow.action.type) {
      case RuleFlowActionTypes[0]?.value:
        return (
          <div className="col-span-1">
            <Textarea
              label={``}
              value={flow.action.content}
              onChange={(e) => {
                handleUpdateFlowAction(flow.id, "content", e.target.value);
              }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const renderFlow = (children: any, flow: any, n: number) => {
    return (
      <div
        className={`col-span-3 ${n == flows.length - 1 ? "mt-4" : ""}`}
        key={`flow-${n}`}
      >
        <div className="flex justify-between">
          <div className="font-bold mb-2">Flow {n + 1}</div>
          {flows.length > 1 && (
            <div>
              <span
                className="text-sm font-bold text-red-600 cursor-pointer"
                onClick={() => handleDeleteFlow(flow.id)}
              >
                Delete
              </span>
            </div>
          )}
        </div>
        <div className="min-h-3 bg-gray-100 rounded px-4 py-2">
          <div className="text-sm">Rule Condition</div>
          <div>{children}</div>
          <div
            className="text-blue-600 text-xs mt-2 cursor-pointer"
            onClick={() => {
              handleAddOrCondition(flow.id);
            }}
          >
            + Or Condition
          </div>
        </div>
        <div className="min-h-3 bg-gray-100 rounded px-4 py-2 mt-4">
          <div className="text-sm">Rule Action</div>
          <div className="p-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="grid grid-cols-4 col-span-4">
                <div className="col-span-1">
                  <label className="text-xs h-4 block">Action Type</label>
                  <Select
                    value={flow.action.type}
                    onValueChange={(e) => {
                      handleUpdateFlowAction(flow.id, "type", e);
                    }}
                  >
                    <SelectTrigger className="w-full h-8 py-4 bg-white border-2 mt-1 rounded-md">
                      <SelectValue placeholder="Select Condition" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {RuleFlowActionTypes.map((t, i) => (
                        <SelectItem
                          key={`flow-${n}-action-select-${i}`}
                          value={String(t.value)}
                        >
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 col-span-4">
                <div className="col-span-1">{renderFlowActionResult(flow)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGroup = (children: any, group: any, n: number, parent: any) => {
    const last = n == parent.childrenItems?.length - 1;
    const nextId = parent.childrenItems?.[n + 1]?.id;
    return (
      <div key={`group-${group.id}`}>
        <div
          className={`${last ? "border-b-2 pt-4 pb-2 pl-4" : "pt-4 pb-2 pl-4"}`}
        >
          {children}
        </div>
        {!last && (
          <div className="inline-flex items-center relative justify-center w-full group">
            <hr className="w-full h-px bg-gray-200 border-0 dark:bg-gray-700" />
            <span className="absolute px-3 text-sm font-bold text-gray-900 -translate-x-1/2 left-1/2 bg-gray-100 dark:text-white dark:bg-gray-900 group-hover:hidden">
              {group?.logicalOperator}
            </span>
            <span
              className="absolute hidden group-hover:block px-3 text-sm font-bold text-red-600 -translate-x-1/2 left-1/2 bg-gray-100 cursor-pointer"
              onClick={() => handleDeleteConditionGroup(nextId)}
            >
              Delete
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderCondition = (
    condition: any,
    n: number,
    parent: any | null,
    last: boolean = false,
  ) => {
    return (
      <div key={`condition-${n}`}>
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-1">
            <Input
              className="bg-white text-xs"
              label="Parameter:"
              value={condition.field}
              onChange={(e) => {
                handleUpdateConditionFieldValue(
                  condition.id,
                  "field",
                  e.target.value,
                );
              }}
            />
          </div>
          <div className="col-span-1">
            <label className="text-xs h-4 block">Condition:</label>
            <Select
              value={String(condition.operator ?? "")}
              onValueChange={(e) => {
                handleUpdateConditionFieldValue(condition.id, "operator", e);
              }}
            >
              <SelectTrigger className="w-full h-8 py-4 bg-white border-2 mt-1 rounded-md">
                <SelectValue placeholder="Select Condition" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {RuleOperators.map((o, i) => (
                  <SelectItem
                    key={`codnition-${n}-operator${i}`}
                    value={String(o.operator)}
                  >
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-1">
            <Input
              className="bg-white text-xs"
              label="Value:"
              value={condition.value}
              onChange={(e) => {
                handleUpdateConditionFieldValue(
                  condition.id,
                  "value",
                  e.target.value,
                );
              }}
            />
          </div>
          <div className="col-span-1 flex justify-center items-center">
            {parent.childrenItems.length > 1 && (
              <div
                className="text-red-600 text-xs mt-2 cursor-pointer"
                onClick={() => {
                  handleDeleteCondition(condition.id);
                }}
              >
                Delete
              </div>
            )}
          </div>
        </div>
        {!last && (
          <div className="text-xs py-4 indent-4 font-bold">
            {`${RuleGroupLogicalOperators.AND}`}
          </div>
        )}
        {last && (
          <div
            className="text-blue-600 text-xs mt-2 cursor-pointer"
            onClick={() => {
              handleAddCondition(parent.id);
            }}
          >
            + And Condition
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col direct justify-start items-start bg-white p-8 overflow-auto">
      <div className="grid grid-cols-8 gap-4 w-full">
        <h1 className="text-2xl col-span-8 font-bold mb-4">
          {rule ? "Edit Rule" : "Create Rule"}
        </h1>
        <div className="grid grid-cols-3 col-span-8">
          <div className="col-span-1">
            <Input
              label="Rule Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 col-span-8">
          <div className="col-span-1">
            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 col-span-8 border-gray-300 border min-h-4 p-4">
          {flows?.map((flow: any, i: number) => {
            const conditionGroups = flow.childrenItems?.map(
              (group: any, k: number) => {
                const conditions = group.childrenItems?.map(
                  (condition: any, j: number) => {
                    return renderCondition(
                      condition,
                      j,
                      group,
                      j === group.childrenItems?.length - 1,
                    );
                  },
                );
                return renderGroup(conditions, group, k, flow);
              },
            );
            return renderFlow(conditionGroups, flow, i);
          })}
          <div
            className="text-blue-600 text-sm mt-2 cursor-pointer"
            onClick={() => {
              handleAddFlow();
            }}
          >
            + Flow
          </div>
        </div>
        <div className="col-span-8">
          {rule ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleUpdate}
              className="mr-4"
            >
              Update
            </Button>
          ) : (
            <Button type="button" variant="primary" onClick={handlePublish}>
              Publish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RuleForm;
