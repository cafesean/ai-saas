import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

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
} from "@/constants/rule";

const newAndCondition = {
  type: RuleTypes.condition,
  field: "",
  value: "",
  operator: RuleOperators[0]?.label,
};

const newOrGroup = {
  type: RuleTypes.conditionGroup,
  logicalOperator: RuleGroupLogicalOperators.OR,
  childrenItems: [],
};

const newAndGroup = {
  type: RuleTypes.conditionGroup,
  logicalOperator: RuleGroupLogicalOperators.AND,
  childrenItems: [],
};

const RuleForm = ({ rule }: { rule?: any }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [flows, setFlows] = useState([
    {
      id: uuidv4(),
      type: RuleTypes.flow,
      childrenItems: [
        {
          id: uuidv4(),
          type: RuleTypes.conditionGroup,
          logicalOperator: RuleGroupLogicalOperators.AND,
          childrenItems: [
            {
              id: uuidv4(),
              ...newAndCondition,
            },
          ],
        },
      ],
    },
  ]);

  const doAddGroupOrCondition = (array: any, id: string, addType: string) => {
    return array.map((item: any) => {
      if (item.id === id) {
        switch (addType) {
          case RuleTypes.condition: {
            return {
              ...item,
              childrenItems: [
                ...item.childrenItems,
                {
                  id: uuidv4(),
                  ...newAndCondition,
                },
              ],
            };
          }
          case RuleTypes.conditionGroup: {
            const hasGroupChildren = item.childrenItems[0]?.childrenItems?.some(
              (item: any) => item.type === RuleTypes.conditionGroup,
            );
            if (hasGroupChildren) {
              return {
                ...item,
                childrenItems: [
                  {
                    ...item.childrenItems[0],
                    childrenItems: [
                      ...item.childrenItems[0].childrenItems,
                      {
                        id: uuidv4(),
                        ...newAndGroup,
                        childrenItems: [
                          {
                            id: uuidv4(),
                            ...newAndCondition,
                          },
                        ],
                      },
                    ],
                  },
                ],
              };
            }
            return {
              ...item,
              childrenItems: [
                {
                  id: uuidv4(),
                  ...newOrGroup,
                  childrenItems: [
                    ...item.childrenItems,
                    {
                      id: uuidv4(),
                      ...newAndGroup,
                      childrenItems: [
                        {
                          id: uuidv4(),
                          ...newAndCondition,
                        },
                      ],
                    },
                  ],
                },
              ],
            };
          }
          default:
            break;
        }
      } else if (item.childrenItems?.length > 0) {
        return {
          ...item,
          childrenItems: doAddGroupOrCondition(item.childrenItems, id, addType),
        };
      }
      return item;
    });
  };

  const handleAddGroupOrCondition = (id: string | null, addType: string) => {
    if (id) {
      setFlows((prev) => {
        return doAddGroupOrCondition(prev, id, addType);
      });
    }
  };

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
              type: RuleTypes.conditionGroup,
              logicalOperator: RuleGroupLogicalOperators.AND,
              childrenItems: [
                {
                  id: uuidv4(),
                  ...newAndCondition,
                },
              ],
            },
          ],
        },
      ];
    });
  };

  const renderFlow = (children: any, flow: any, n: number) => {
    return (
      <div
        className={`col-span-3 ${n == flows.length - 1 ? "mt-4" : ""}`}
        key={`flow-${n}`}
      >
        <div className="font-bold mb-2">Flow {n + 1}</div>
        <div className="min-h-3 bg-gray-100 rounded px-4 py-2">
          <div className="text-sm">Rule Condition</div>
          <div>{children}</div>
          <div
            className="text-blue-600 text-xs mt-2 cursor-pointer"
            onClick={() => {
              handleAddGroupOrCondition(flow.id, RuleTypes.conditionGroup);
            }}
          >
            + Or Condition
          </div>
        </div>
      </div>
    );
  };

  const renderGroup = (children: any, group: any, n: number, parent: any) => {
    const hasGroupChildren = group.childrenItems?.some(
      (item: any) => item.type === RuleTypes.conditionGroup,
    );
    return (
      <div key={`group-${group.id}`}>
        <div className={`${!hasGroupChildren ? "pt-4 pb-2 pl-4" : ""}`}>
          {children}
        </div>
        {!hasGroupChildren && n !== parent?.childrenItems?.length - 1 && (
          <div className="inline-flex items-center relative justify-center w-full">
            <hr className="w-full h-px bg-gray-200 border-0 dark:bg-gray-700" />
            <span className="absolute px-3 text-sm font-bold text-gray-900 -translate-x-1/2 left-1/2 bg-gray-100 dark:text-white dark:bg-gray-900">
              {parent?.logicalOperator}
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
              onChange={(e) => {}}
            />
          </div>
          <div className="col-span-1">
            <label className="text-xs h-4 block">Condition:</label>
            <Select
              value={String(condition.operator ?? "")}
              onValueChange={() => {}}
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
                () => {};
              }}
            />
          </div>
          <div className="col-span-1 flex justify-center items-center">
            <span className="text-sm cursor-pointer">Delete</span>
          </div>
        </div>
        {!last && (
          <div className="text-xs py-4 indent-4 font-bold">
            {parent.logicalOperator}
          </div>
        )}
        {last && (
          <div
            className="text-blue-600 text-xs mt-2 cursor-pointer"
            onClick={() => {
              handleAddGroupOrCondition(parent.id, RuleTypes.condition);
            }}
          >
            + And Condition
          </div>
        )}
      </div>
    );
  };

  const renderFlowOrGroupsOrCondition: any = (
    childrenItems: any[],
    parent: any | null = null,
  ) => {
    return childrenItems.map((childrenItem: any, i: number) => {
      if (childrenItem.type === RuleTypes.flow) {
        const children = renderFlowOrGroupsOrCondition(
          childrenItem.childrenItems,
          childrenItem,
        );
        return renderFlow(children, childrenItem, i);
      } else if (childrenItem.type === RuleTypes.conditionGroup) {
        const children = renderFlowOrGroupsOrCondition(
          childrenItem.childrenItems,
          childrenItem,
        );
        return renderGroup(children, childrenItem, i, parent);
      } else if (childrenItem.type === RuleTypes.condition) {
        return renderCondition(
          childrenItem,
          i,
          parent,
          i === childrenItems.length - 1,
        );
      }
      return null;
    });
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
          {renderFlowOrGroupsOrCondition(flows)}
          <div
            className="text-blue-600 text-sm mt-2 cursor-pointer"
            onClick={() => {
              handleAddFlow();
            }}
          >
            + Flow
          </div>
        </div>
      </div>
    </div>
  );
};

export default RuleForm;
