"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, XCircle, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InputField {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  allowed_values?: string[];
}

interface InputSchemaProps {
  inputSchema?: InputField[];
  modelName?: string;
}

export default function InputSchema({
  inputSchema = [],
  modelName = "Model",
}: InputSchemaProps) {
  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'string':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'number':
      case 'integer':
      case 'float':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'boolean':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'array':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (!inputSchema || inputSchema.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Input Schema</CardTitle>
          <CardDescription>
            Input parameters required for {modelName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Info className="mx-auto h-12 w-12 mb-4" />
            <p>No input schema information available for this model.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Input Schema</CardTitle>
        <CardDescription>
          Input parameters required for {modelName} ({inputSchema.length} fields)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Field Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-[100px]">Required</TableHead>
                <TableHead>Allowed Values</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inputSchema.map((field, index) => (
                <TableRow key={`${field.name}-${index}`}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span>{field.name}</span>
                      {field.required && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="text-destructive text-xs">*</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>This field is required</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={getTypeColor(field.type)}
                    >
                      {field.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {field.required ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {field.allowed_values && field.allowed_values.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {field.allowed_values.slice(0, 3).map((value, valueIndex) => (
                          <Badge 
                            key={valueIndex} 
                            variant="secondary" 
                            className="text-xs"
                          >
                            {value}
                          </Badge>
                        ))}
                        {field.allowed_values.length > 3 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="secondary" className="text-xs">
                                  +{field.allowed_values.length - 3} more
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <div className="space-y-1">
                                  {field.allowed_values.slice(3).map((value, valueIndex) => (
                                    <div key={valueIndex} className="text-xs">{value}</div>
                                  ))}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Any value</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {field.description ? (
                      <span className="text-sm">{field.description}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
} 