<file_contents>
File: /Volumes/X9/Downloads/ai-model-dashboard (1)/components/lookup-table-editor.tsx
```tsx
"use client"

import { useState, useEffect } from "react"
import { Plus, Save, Play, Settings, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface DimensionBin {
  id: string
  label: string
  binType: "exact" | "range"
  exactValue?: string
  rangeMin?: number
  rangeMax?: number
  isMinInclusive?: boolean
  isMaxInclusive?: boolean
  isValid?: boolean
  validationError?: string
}

interface LookupTableData {
  id?: number
  name: string
  description: string
  inputVariable1: { id: number; name: string; dataType: string }
  inputVariable2?: { id: number; name: string; dataType: string }
  outputVariable: { id: number; name: string; dataType: string }
  dimension1Bins: DimensionBin[]
  dimension2Bins: DimensionBin[]
  cells: Record<string, string>
  status: "draft" | "published" | "deprecated"
}

interface CellValidation {
  isValid: boolean
  error?: string
}

interface LookupTableEditorProps {
  initialData?: Partial<LookupTableData>
  onSave: (data: LookupTableData) => void
  onTest?: (data: LookupTableData) => void
  isLoading?: boolean
}

const mockVariables = [
  { id: 1, name: "Credit Score", dataType: "number" },
  { id: 2, name: "Annual Income", dataType: "number" },
  { id: 3, name: "Age", dataType: "number" },
  { id: 4, name: "Product Type", dataType: "string" },
  { id: 5, name: "Customer Tier", dataType: "string" },
  { id: 6, name: "Risk Level", dataType: "string" },
  { id: 7, name: "Customer Segment", dataType: "string" },
  { id: 8, name: "Base Price", dataType: "number" },
]

export function LookupTableEditor({ initialData, onSave, onTest, isLoading }: LookupTableEditorProps) {
  const [data, setData] = useState<LookupTableData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    inputVariable1: initialData?.inputVariable1 || mockVariables[0],
    inputVariable2: initialData?.inputVariable2,
    outputVariable: initialData?.outputVariable || mockVariables[5],
    dimension1Bins: initialData?.dimension1Bins || [
      {
        id: "row-1",
        label: "Row 1",
        binType: "exact",
        exactValue: "",
        isValid: false,
      },
    ],
    dimension2Bins: initialData?.dimension2Bins || [],
    cells: initialData?.cells || {},
    status: initialData?.status || "draft",
  })

  const [cellValidations, setCellValidations] = useState<Record<string, CellValidation>>({})
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)

  // Validate a dimension bin
  const validateBin = (bin: DimensionBin, variable: { dataType: string }): { isValid: boolean; error?: string } => {
    if (!bin.label.trim()) {
      return { isValid: false, error: "Label is required" }
    }

    if (bin.binType === "exact") {
      if (!bin.exactValue?.trim()) {
        return { isValid: false, error: "Value is required" }
      }
      if (variable.dataType === "number" && isNaN(Number(bin.exactValue))) {
        return { isValid: false, error: "Must be a valid number" }
      }
    } else if (bin.binType === "range") {
      if (bin.rangeMin === undefined || bin.rangeMax === undefined) {
        return { isValid: false, error: "Min and max values are required" }
      }
      if (bin.rangeMin >= bin.rangeMax) {
        return { isValid: false, error: "Min must be less than max" }
      }
    }

    return { isValid: true }
  }

  // Validate a cell value
  const validateCell = (value: string, outputVariable: { dataType: string }): CellValidation => {
    if (!value.trim()) {
      return { isValid: false, error: "Value is required" }
    }

    if (outputVariable.dataType === "number" && isNaN(Number(value))) {
      return { isValid: false, error: "Must be a valid number" }
    }

    return { isValid: true }
  }

  // Update cell validation when cells change
  useEffect(() => {
    const newValidations: Record<string, CellValidation> = {}
    Object.entries(data.cells).forEach(([key, value]) => {
      newValidations[key] = validateCell(value, data.outputVariable)
    })
    setCellValidations(newValidations)
  }, [data.cells, data.outputVariable])

  const addRow = () => {
    const newBin: DimensionBin = {
      id: `row-${Date.now()}`,
      label: `Row ${data.dimension1Bins.length + 1}`,
      binType: data.inputVariable1.dataType === "number" ? "range" : "exact",
      exactValue: data.inputVariable1.dataType === "string" ? "" : undefined,
      rangeMin: data.inputVariable1.dataType === "number" ? 0 : undefined,
      rangeMax: data.inputVariable1.dataType === "number" ? 100 : undefined,
      isMinInclusive: true,
      isMaxInclusive: false,
      isValid: false,
      validationError: "Configuration required",
    }
    setData((prev) => ({ ...prev, dimension1Bins: [...prev.dimension1Bins, newBin] }))
  }

  const addColumn = () => {
    if (!data.inputVariable2) {
      // First column - need to set up 2D mode
      const defaultVariable = mockVariables.find((v) => v.id !== data.inputVariable1.id) || mockVariables[1]
      const newBin: DimensionBin = {
        id: `col-${Date.now()}`,
        label: "Column 1",
        binType: defaultVariable.dataType === "number" ? "range" : "exact",
        exactValue: defaultVariable.dataType === "string" ? "" : undefined,
        rangeMin: defaultVariable.dataType === "number" ? 0 : undefined,
        rangeMax: defaultVariable.dataType === "number" ? 100 : undefined,
        isMinInclusive: true,
        isMaxInclusive: false,
        isValid: false,
        validationError: "Configuration required",
      }
      setData((prev) => ({
        ...prev,
        inputVariable2: defaultVariable,
        dimension2Bins: [newBin],
      }))
    } else {
      const newBin: DimensionBin = {
        id: `col-${Date.now()}`,
        label: `Column ${data.dimension2Bins.length + 1}`,
        binType: data.inputVariable2.dataType === "number" ? "range" : "exact",
        exactValue: data.inputVariable2.dataType === "string" ? "" : undefined,
        rangeMin: data.inputVariable2.dataType === "number" ? 0 : undefined,
        rangeMax: data.inputVariable2.dataType === "number" ? 100 : undefined,
        isMinInclusive: true,
        isMaxInclusive: false,
        isValid: false,
        validationError: "Configuration required",
      }
      setData((prev) => ({ ...prev, dimension2Bins: [...prev.dimension2Bins, newBin] }))
    }
  }

  const removeRow = (binId: string) => {
    setData((prev) => ({
      ...prev,
      dimension1Bins: prev.dimension1Bins.filter((bin) => bin.id !== binId),
      cells: Object.fromEntries(Object.entries(prev.cells).filter(([key]) => !key.startsWith(binId))),
    }))
  }

  const removeColumn = (binId: string) => {
    setData((prev) => {
      const newDimension2Bins = prev.dimension2Bins.filter((bin) => bin.id !== binId)
      const newCells = Object.fromEntries(Object.entries(prev.cells).filter(([key]) => !key.endsWith(`-${binId}`)))

      // If no columns left, switch back to 1D mode
      if (newDimension2Bins.length === 0) {
        return {
          ...prev,
          inputVariable2: undefined,
          dimension2Bins: [],
          cells: Object.fromEntries(Object.entries(newCells).map(([key, value]) => [key.split("-")[0], value])),
        }
      }

      return {
        ...prev,
        dimension2Bins: newDimension2Bins,
        cells: newCells,
      }
    })
  }

  const updateBin = (dimension: 1 | 2, binId: string, updates: Partial<DimensionBin>) => {
    const variable = dimension === 1 ? data.inputVariable1 : data.inputVariable2
    if (!variable) return

    if (dimension === 1) {
      setData((prev) => ({
        ...prev,
        dimension1Bins: prev.dimension1Bins.map((bin) => {
          if (bin.id === binId) {
            const updatedBin = { ...bin, ...updates }
            const validation = validateBin(updatedBin, variable)
            return {
              ...updatedBin,
              isValid: validation.isValid,
              validationError: validation.error,
            }
          }
          return bin
        }),
      }))
    } else {
      setData((prev) => ({
        ...prev,
        dimension2Bins: prev.dimension2Bins.map((bin) => {
          if (bin.id === binId) {
            const updatedBin = { ...bin, ...updates }
            const validation = validateBin(updatedBin, variable)
            return {
              ...updatedBin,
              isValid: validation.isValid,
              validationError: validation.error,
            }
          }
          return bin
        }),
      }))
    }
  }

  const updateCell = (row1BinId: string, row2BinId: string | null, value: string) => {
    const cellKey = row2BinId ? `${row1BinId}-${row2BinId}` : row1BinId
    setData((prev) => ({
      ...prev,
      cells: { ...prev.cells, [cellKey]: value },
    }))
  }

  const getCellValue = (row1BinId: string, row2BinId: string | null) => {
    const cellKey = row2BinId ? `${row1BinId}-${row2BinId}` : row1BinId
    return data.cells[cellKey] || ""
  }

  const getCellValidation = (row1BinId: string, row2BinId: string | null) => {
    const cellKey = row2BinId ? `${row1BinId}-${row2BinId}` : row1BinId
    return cellValidations[cellKey] || { isValid: true }
  }

  const renderBinConfigPopover = (bin: DimensionBin, dimension: 1 | 2) => {
    const variable = dimension === 1 ? data.inputVariable1 : data.inputVariable2
    if (!variable) return null

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-6 w-6 p-0 hover:bg-accent", !bin.isValid && "text-destructive hover:text-destructive")}
          >
            <Settings className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start" side="bottom">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`label-${bin.id}`}>Label</Label>
              <Input
                id={`label-${bin.id}`}
                value={bin.label}
                onChange={(e) => updateBin(dimension, bin.id, { label: e.target.value })}
                placeholder="Enter label"
              />
            </div>

            {variable.dataType === "number" && (
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={bin.binType}
                  onValueChange={(value: "exact" | "range") => updateBin(dimension, bin.id, { binType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exact">Exact Value</SelectItem>
                    <SelectItem value="range">Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {bin.binType === "exact" ? (
              <div className="space-y-2">
                <Label htmlFor={`value-${bin.id}`}>Value</Label>
                <Input
                  id={`value-${bin.id}`}
                  type={variable.dataType === "number" ? "number" : "text"}
                  value={bin.exactValue || ""}
                  onChange={(e) => updateBin(dimension, bin.id, { exactValue: e.target.value })}
                  placeholder={variable.dataType === "number" ? "Enter number" : "Enter text value"}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor={`min-${bin.id}`}>Min Value</Label>
                    <Input
                      id={`min-${bin.id}`}
                      type="number"
                      value={bin.rangeMin ?? ""}
                      onChange={(e) =>
                        updateBin(dimension, bin.id, {
                          rangeMin: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                        })
                      }
                      placeholder="Min"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`max-${bin.id}`}>Max Value</Label>
                    <Input
                      id={`max-${bin.id}`}
                      type="number"
                      value={bin.rangeMax ?? ""}
                      onChange={(e) =>
                        updateBin(dimension, bin.id, {
                          rangeMax: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                        })
                      }
                      placeholder="Max"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`min-inclusive-${bin.id}`} className="text-sm">
                      Min value is inclusive
                    </Label>
                    <Switch
                      id={`min-inclusive-${bin.id}`}
                      checked={bin.isMinInclusive ?? true}
                      onCheckedChange={(checked) => updateBin(dimension, bin.id, { isMinInclusive: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`max-inclusive-${bin.id}`} className="text-sm">
                      Max value is inclusive
                    </Label>
                    <Switch
                      id={`max-inclusive-${bin.id}`}
                      checked={bin.isMaxInclusive ?? false}
                      onCheckedChange={(checked) => updateBin(dimension, bin.id, { isMaxInclusive: checked })}
                    />
                  </div>
                </div>
              </div>
            )}

            {bin.validationError && (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">{bin.validationError}</AlertDescription>
              </Alert>
            )}
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  const is2D = data.inputVariable2 && data.dimension2Bins.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{data.id ? `Edit: ${data.name}` : "New Lookup Table"}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={data.status === "published" ? "default" : "secondary"}>{data.status}</Badge>
            {is2D ? <Badge variant="outline">2D Matrix</Badge> : <Badge variant="outline">1D Lookup</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Play className="h-4 w-4 mr-2" />
                Test
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Test Lookup Table</DialogTitle>
                <DialogDescription>Enter input values to test your lookup table logic</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Test interface will be implemented here</p>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={() => onSave(data)} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter table name"
              />
            </div>
            <div>
              <Label>Output Variable</Label>
              <Select
                value={data.outputVariable.id.toString()}
                onValueChange={(value) => {
                  const variable = mockVariables.find((v) => v.id.toString() === value)
                  if (variable) {
                    setData((prev) => ({ ...prev, outputVariable: variable }))
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockVariables.map((variable) => (
                    <SelectItem key={variable.id} value={variable.id.toString()}>
                      {variable.name} ({variable.dataType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={data.description}
              onChange={(e) => setData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this table does"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Variable Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Input Variables</CardTitle>
          <CardDescription>Configure the variables that will be used as inputs to this lookup table</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Row Variable (Primary Input)</Label>
              <Select
                value={data.inputVariable1.id.toString()}
                onValueChange={(value) => {
                  const variable = mockVariables.find((v) => v.id.toString() === value)
                  if (variable) {
                    setData((prev) => ({
                      ...prev,
                      inputVariable1: variable,
                      dimension1Bins: prev.dimension1Bins.map((bin) => ({
                        ...bin,
                        binType: variable.dataType === "number" ? "range" : "exact",
                        isValid: false,
                        validationError: "Reconfigure after variable change",
                      })),
                    }))
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockVariables.map((variable) => (
                    <SelectItem key={variable.id} value={variable.id.toString()}>
                      {variable.name} ({variable.dataType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {is2D && (
              <div>
                <Label>Column Variable (Secondary Input)</Label>
                <Select
                  value={data.inputVariable2?.id.toString() || ""}
                  onValueChange={(value) => {
                    const variable = mockVariables.find((v) => v.id.toString() === value)
                    if (variable) {
                      setData((prev) => ({
                        ...prev,
                        inputVariable2: variable,
                        dimension2Bins: prev.dimension2Bins.map((bin) => ({
                          ...bin,
                          binType: variable.dataType === "number" ? "range" : "exact",
                          isValid: false,
                          validationError: "Reconfigure after variable change",
                        })),
                      }))
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockVariables
                      .filter((v) => v.id !== data.inputVariable1.id)
                      .map((variable) => (
                        <SelectItem key={variable.id} value={variable.id.toString()}>
                          {variable.name} ({variable.dataType})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Matrix Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lookup Matrix</CardTitle>
              <CardDescription>
                Configure your matrix by adding rows and columns, then fill in the values
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={addRow}>
                <Plus className="h-4 w-4 mr-2" />
                Add Row
              </Button>
              <Button variant="outline" size="sm" onClick={addColumn}>
                <Plus className="h-4 w-4 mr-2" />
                Add Column
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full border-collapse border border-border">
              <thead>
                <tr>
                  <th className="border border-border p-2 bg-muted font-medium text-left min-w-48">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{data.inputVariable1.name}</div>
                        <div className="text-xs text-muted-foreground">({data.inputVariable1.dataType})</div>
                      </div>
                      {is2D && (
                        <div className="text-right">
                          <div className="font-medium">{data.inputVariable2?.name}</div>
                          <div className="text-xs text-muted-foreground">({data.inputVariable2?.dataType})</div>
                        </div>
                      )}
                    </div>
                  </th>
                  {is2D ? (
                    data.dimension2Bins.map((bin) => (
                      <th key={bin.id} className="border border-border p-2 bg-muted font-medium text-center min-w-32">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex-1 text-center">
                            <div className={cn("font-medium", !bin.isValid && "text-destructive")}>{bin.label}</div>
                            {bin.binType === "range" && bin.rangeMin !== undefined && bin.rangeMax !== undefined && (
                              <div className="text-xs text-muted-foreground">
                                {bin.isMinInclusive ? "[" : "("}
                                {bin.rangeMin}, {bin.rangeMax}
                                {bin.isMaxInclusive ? "]" : ")"}
                              </div>
                            )}
                            {bin.binType === "exact" && bin.exactValue && (
                              <div className="text-xs text-muted-foreground">= {bin.exactValue}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {renderBinConfigPopover(bin, 2)}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => removeColumn(bin.id)}
                              disabled={data.dimension2Bins.length === 1}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </th>
                    ))
                  ) : (
                    <th className="border border-border p-2 bg-muted font-medium text-center min-w-32">
                      <div className="font-medium">{data.outputVariable.name}</div>
                      <div className="text-xs text-muted-foreground">({data.outputVariable.dataType})</div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.dimension1Bins.map((row1Bin) => (
                  <tr key={row1Bin.id}>
                    <td className="border border-border p-2 bg-muted font-medium">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <div className={cn("font-medium", !row1Bin.isValid && "text-destructive")}>
                            {row1Bin.label}
                          </div>
                          {row1Bin.binType === "range" &&
                            row1Bin.rangeMin !== undefined &&
                            row1Bin.rangeMax !== undefined && (
                              <div className="text-xs text-muted-foreground">
                                {row1Bin.isMinInclusive ? "[" : "("}
                                {row1Bin.rangeMin}, {row1Bin.rangeMax}
                                {row1Bin.isMaxInclusive ? "]" : ")"}
                              </div>
                            )}
                          {row1Bin.binType === "exact" && row1Bin.exactValue && (
                            <div className="text-xs text-muted-foreground">= {row1Bin.exactValue}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {renderBinConfigPopover(row1Bin, 1)}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeRow(row1Bin.id)}
                            disabled={data.dimension1Bins.length === 1}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </td>
                    {is2D ? (
                      data.dimension2Bins.map((row2Bin) => {
                        const cellValidation = getCellValidation(row1Bin.id, row2Bin.id)
                        return (
                          <td key={row2Bin.id} className="border border-border p-1">
                            <Input
                              value={getCellValue(row1Bin.id, row2Bin.id)}
                              onChange={(e) => updateCell(row1Bin.id, row2Bin.id, e.target.value)}
                              placeholder="Value"
                              className={cn(
                                "border-0 text-center",
                                !cellValidation.isValid && "border-destructive bg-destructive/10",
                              )}
                              title={cellValidation.error}
                            />
                          </td>
                        )
                      })
                    ) : (
                      <td className="border border-border p-1">
                        <Input
                          value={getCellValue(row1Bin.id, null)}
                          onChange={(e) => updateCell(row1Bin.id, null, e.target.value)}
                          placeholder="Value"
                          className={cn(
                            "border-0 text-center",
                            !getCellValidation(row1Bin.id, null).isValid && "border-destructive bg-destructive/10",
                          )}
                          title={getCellValidation(row1Bin.id, null).error}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

```

File: /Volumes/X9/Downloads/ai-model-dashboard (1)/app/decisioning/lookups/page.tsx
```tsx
"use client"

import { useState } from "react"
import { Plus, Search, Filter, Grid, List, Eye, Edit, Trash2, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import Link from "next/link"

// Mock data for development
const mockLookupTables = [
  {
    id: 1,
    uuid: "lookup-1",
    name: "Credit Score Risk Matrix",
    description: "Maps credit scores and income levels to risk categories",
    status: "published",
    version: 2,
    inputVariable1: "Credit Score",
    inputVariable2: "Annual Income",
    outputVariable: "Risk Level",
    dimensions: "2D",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
    createdBy: "John Doe",
  },
  {
    id: 2,
    uuid: "lookup-2",
    name: "Age Group Classification",
    description: "Simple age-based customer segmentation",
    status: "draft",
    version: 1,
    inputVariable1: "Age",
    inputVariable2: null,
    outputVariable: "Customer Segment",
    dimensions: "1D",
    createdAt: "2024-01-18",
    updatedAt: "2024-01-18",
    createdBy: "Jane Smith",
  },
  {
    id: 3,
    uuid: "lookup-3",
    name: "Product Pricing Matrix",
    description: "Determines pricing based on product type and customer tier",
    status: "published",
    version: 1,
    inputVariable1: "Product Type",
    inputVariable2: "Customer Tier",
    outputVariable: "Base Price",
    dimensions: "2D",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-12",
    createdBy: "Mike Johnson",
  },
]

const mockVariables = [
  { id: 1, name: "Credit Score", dataType: "number" },
  { id: 2, name: "Annual Income", dataType: "number" },
  { id: 3, name: "Age", dataType: "number" },
  { id: 4, name: "Product Type", dataType: "string" },
  { id: 5, name: "Customer Tier", dataType: "string" },
  { id: 6, name: "Risk Level", dataType: "string" },
  { id: 7, name: "Customer Segment", dataType: "string" },
  { id: 8, name: "Base Price", dataType: "number" },
]

export default function LookupTablesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newTable, setNewTable] = useState({
    name: "",
    description: "",
    inputVariable1Id: "0",
    inputVariable2Id: "0",
    outputVariableId: "0",
  })

  const filteredTables = mockLookupTables.filter((table) => {
    const matchesSearch =
      table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || table.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "deprecated":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleCreateTable = () => {
    // In a real app, this would call the tRPC mutation
    console.log("Creating lookup table:", newTable)
    setIsCreateDialogOpen(false)
    setNewTable({
      name: "",
      description: "",
      inputVariable1Id: "0",
      inputVariable2Id: "0",
      outputVariableId: "0",
    })
  }

  const TableCard = ({ table }: { table: (typeof mockLookupTables)[0] }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              <Link href={`/decisioning/lookups/${table.uuid}`} className="hover:text-primary transition-colors">
                {table.name}
              </Link>
            </CardTitle>
            <CardDescription className="text-sm">{table.description}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                •••
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/decisioning/lookups/${table.uuid}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/decisioning/lookups/${table.uuid}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Play className="h-4 w-4 mr-2" />
                Test
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(table.status)}>{table.status}</Badge>
            <Badge variant="outline">v{table.version}</Badge>
            <Badge variant="outline">{table.dimensions}</Badge>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <div>
              <strong>Input:</strong> {table.inputVariable1}
              {table.inputVariable2 ? `, ${table.inputVariable2}` : ""}
            </div>
            <div>
              <strong>Output:</strong> {table.outputVariable}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Created by {table.createdBy} • {table.updatedAt}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const TableRow = ({ table }: { table: (typeof mockLookupTables)[0] }) => (
    <div className="flex items-center justify-between p-4 border-b hover:bg-muted/50">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <Link
            href={`/decisioning/lookups/${table.uuid}`}
            className="font-medium hover:text-primary transition-colors"
          >
            {table.name}
          </Link>
          <Badge className={getStatusColor(table.status)} variant="secondary">
            {table.status}
          </Badge>
          <Badge variant="outline">v{table.version}</Badge>
          <Badge variant="outline">{table.dimensions}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{table.description}</p>
        <div className="text-xs text-muted-foreground">
          {table.inputVariable1}
          {table.inputVariable2 ? ` + ${table.inputVariable2}` : ""} → {table.outputVariable}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/decisioning/lookups/${table.uuid}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/decisioning/lookups/${table.uuid}/edit`}>
            <Edit className="h-4 w-4" />
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              •••
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Play className="h-4 w-4 mr-2" />
              Test
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lookup Tables</h1>
          <p className="text-muted-foreground">Create and manage matrix-style lookup tables for decision logic</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Lookup Table
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Lookup Table</DialogTitle>
              <DialogDescription>
                Set up a new matrix-style lookup table to map input values to outputs.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newTable.name}
                  onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                  placeholder="Enter table name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTable.description}
                  onChange={(e) => setNewTable({ ...newTable, description: e.target.value })}
                  placeholder="Describe what this table does"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="input1">Primary Input Variable</Label>
                <Select
                  value={newTable.inputVariable1Id}
                  onValueChange={(value) => setNewTable({ ...newTable, inputVariable1Id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select input variable" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockVariables.map((variable) => (
                      <SelectItem key={variable.id} value={variable.id.toString()}>
                        {variable.name} ({variable.dataType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="input2">Secondary Input Variable (Optional)</Label>
                <Select
                  value={newTable.inputVariable2Id}
                  onValueChange={(value) => setNewTable({ ...newTable, inputVariable2Id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select second input (for 2D matrix)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None (1D lookup)</SelectItem>
                    {mockVariables.map((variable) => (
                      <SelectItem key={variable.id} value={variable.id.toString()}>
                        {variable.name} ({variable.dataType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="output">Output Variable</Label>
                <Select
                  value={newTable.outputVariableId}
                  onValueChange={(value) => setNewTable({ ...newTable, outputVariableId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select output variable" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockVariables.map((variable) => (
                      <SelectItem key={variable.id} value={variable.id.toString()}>
                        {variable.name} ({variable.dataType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTable}>Create Table</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search lookup tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="deprecated">Deprecated</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center border rounded-md">
          <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")}>
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <Tabs value="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Tables ({filteredTables.length})</TabsTrigger>
          <TabsTrigger value="published">
            Published ({filteredTables.filter((t) => t.status === "published").length})
          </TabsTrigger>
          <TabsTrigger value="draft">Drafts ({filteredTables.filter((t) => t.status === "draft").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTables.map((table) => (
                <TableCard key={table.id} table={table} />
              ))}
            </div>
          ) : (
            <Card>
              <div className="divide-y">
                {filteredTables.map((table) => (
                  <TableRow key={table.id} table={table} />
                ))}
              </div>
            </Card>
          )}

          {filteredTables.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No lookup tables found matching your criteria.</p>
              <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Lookup Table
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="published">{/* Similar content filtered for published tables */}</TabsContent>

        <TabsContent value="draft">{/* Similar content filtered for draft tables */}</TabsContent>
      </Tabs>
    </div>
  )
}

```

File: /Volumes/X9/Downloads/ai-model-dashboard (1)/app/decisioning/lookups/[uuid]/page.tsx
```tsx
"use client"

import { Label } from "@/components/ui/label"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, Play, Share, Download, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

// Mock data for the lookup table
const mockLookupTable = {
  id: 1,
  uuid: "lookup-1",
  name: "Credit Score Risk Matrix",
  description: "Maps credit scores and income levels to risk categories for loan approval decisions",
  status: "published",
  version: 2,
  inputVariable1: { id: 1, name: "Credit Score", dataType: "number" },
  inputVariable2: { id: 2, name: "Annual Income", dataType: "number" },
  outputVariable: { id: 6, name: "Risk Level", dataType: "string" },
  createdAt: "2024-01-15",
  updatedAt: "2024-01-20",
  createdBy: "John Doe",
  dimension1Bins: [
    { id: "1", label: "Poor (300-579)", binType: "range", rangeMin: 300, rangeMax: 579 },
    { id: "2", label: "Fair (580-669)", binType: "range", rangeMin: 580, rangeMax: 669 },
    { id: "3", label: "Good (670-739)", binType: "range", rangeMin: 670, rangeMax: 739 },
    { id: "4", label: "Excellent (740+)", binType: "range", rangeMin: 740, rangeMax: 850 },
  ],
  dimension2Bins: [
    { id: "a", label: "Low (<$30k)", binType: "range", rangeMin: 0, rangeMax: 30000 },
    { id: "b", label: "Medium ($30k-$75k)", binType: "range", rangeMin: 30000, rangeMax: 75000 },
    { id: "c", label: "High ($75k-$150k)", binType: "range", rangeMin: 75000, rangeMax: 150000 },
    { id: "d", label: "Very High ($150k+)", binType: "range", rangeMin: 150000, rangeMax: 1000000 },
  ],
  cells: {
    "1-a": "High Risk",
    "1-b": "High Risk",
    "1-c": "Medium Risk",
    "1-d": "Medium Risk",
    "2-a": "High Risk",
    "2-b": "Medium Risk",
    "2-c": "Medium Risk",
    "2-d": "Low Risk",
    "3-a": "Medium Risk",
    "3-b": "Medium Risk",
    "3-c": "Low Risk",
    "3-d": "Low Risk",
    "4-a": "Medium Risk",
    "4-b": "Low Risk",
    "4-c": "Low Risk",
    "4-d": "Very Low Risk",
  },
}

export default function LookupTableDetailPage({ params }: { params: { uuid: string } }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  const getCellValue = (row1BinId: string, row2BinId: string) => {
    const cellKey = `${row1BinId}-${row2BinId}`
    return mockLookupTable.cells[cellKey] || ""
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "deprecated":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderMatrix = () => {
    return (
      <div className="overflow-auto">
        <table className="w-full border-collapse border border-border">
          <thead>
            <tr>
              <th className="border border-border p-3 bg-muted font-medium text-left">
                {mockLookupTable.inputVariable1.name} \ {mockLookupTable.inputVariable2?.name}
              </th>
              {mockLookupTable.dimension2Bins.map((bin) => (
                <th key={bin.id} className="border border-border p-3 bg-muted font-medium text-center min-w-32">
                  {bin.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockLookupTable.dimension1Bins.map((row1Bin) => (
              <tr key={row1Bin.id}>
                <td className="border border-border p-3 bg-muted font-medium">{row1Bin.label}</td>
                {mockLookupTable.dimension2Bins.map((row2Bin) => (
                  <td key={row2Bin.id} className="border border-border p-3 text-center">
                    <Badge variant="outline" className="font-normal">
                      {getCellValue(row1Bin.id, row2Bin.id)}
                    </Badge>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{mockLookupTable.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getStatusColor(mockLookupTable.status)}>{mockLookupTable.status}</Badge>
              <Badge variant="outline">v{mockLookupTable.version}</Badge>
              <Badge variant="outline">2D Matrix</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Play className="h-4 w-4 mr-2" />
            Test
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/decisioning/lookups/${params.uuid}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Share className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Export
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="matrix">Matrix View</TabsTrigger>
          <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
          <TabsTrigger value="history">Version History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{mockLookupTable.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Matrix Preview</CardTitle>
                  <CardDescription>A preview of your lookup matrix</CardDescription>
                </CardHeader>
                <CardContent>{renderMatrix()}</CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Variables</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Input Variables</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{mockLookupTable.inputVariable1.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {mockLookupTable.inputVariable1.dataType}
                        </Badge>
                      </div>
                      {mockLookupTable.inputVariable2 && (
                        <div className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm">{mockLookupTable.inputVariable2.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {mockLookupTable.inputVariable2.dataType}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Output Variable</Label>
                    <div className="flex items-center justify-between p-2 bg-muted rounded mt-2">
                      <span className="text-sm">{mockLookupTable.outputVariable.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {mockLookupTable.outputVariable.dataType}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span>{mockLookupTable.createdAt}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Updated</span>
                    <span>{mockLookupTable.updatedAt}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Created by</span>
                    <span>{mockLookupTable.createdBy}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dimensions</span>
                    <span>
                      {mockLookupTable.dimension1Bins.length} × {mockLookupTable.dimension2Bins.length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="matrix" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lookup Matrix</CardTitle>
              <CardDescription>
                Complete matrix showing all input combinations and their corresponding outputs
              </CardDescription>
            </CardHeader>
            <CardContent>{renderMatrix()}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dimensions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rows ({mockLookupTable.inputVariable1.name})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockLookupTable.dimension1Bins.map((bin) => (
                    <div key={bin.id} className="flex items-center justify-between p-3 border rounded">
                      <span className="font-medium">{bin.label}</span>
                      <Badge variant="outline">
                        {bin.binType === "range" ? `${bin.rangeMin} - ${bin.rangeMax}` : bin.label}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Columns ({mockLookupTable.inputVariable2?.name})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockLookupTable.dimension2Bins.map((bin) => (
                    <div key={bin.id} className="flex items-center justify-between p-3 border rounded">
                      <span className="font-medium">{bin.label}</span>
                      <Badge variant="outline">
                        {bin.binType === "range" ? `${bin.rangeMin} - ${bin.rangeMax}` : bin.label}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
              <CardDescription>Track changes and versions of this lookup table</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <div className="font-medium">Version 2 (Current)</div>
                    <div className="text-sm text-muted-foreground">Published on {mockLookupTable.updatedAt}</div>
                  </div>
                  <Badge>Current</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <div className="font-medium">Version 1</div>
                    <div className="text-sm text-muted-foreground">Published on 2024-01-15</div>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

```

File: /Volumes/X9/Downloads/ai-model-dashboard (1)/app/decisioning/page.tsx
```tsx
"use client"

import { useState } from "react"
import {
  ArrowLeft,
  Clock,
  Filter,
  Grid3X3,
  MoreHorizontal,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  GitBranch,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function DecisioningPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newTableName, setNewTableName] = useState("")
  const [newTableDescription, setNewTableDescription] = useState("")

  const createDecisionTable = () => {
    // In a real app, this would create a new decision table and redirect to it
    // For now, we'll just close the dialog
    setIsCreateDialogOpen(false)
    setNewTableName("")
    setNewTableDescription("")
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-xl font-semibold">Decisioning</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Decision Table
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Decision Table</DialogTitle>
                <DialogDescription>
                  Create a new decision table to use in your workflows for validating connections and making decisions.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Table Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter table name"
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Enter table description"
                    value={newTableDescription}
                    onChange={(e) => setNewTableDescription(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="active">Active</Label>
                  <Switch id="active" defaultChecked />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createDecisionTable} disabled={!newTableName} asChild>
                  <Link href={`/decisioning/${encodeURIComponent(newTableName.toLowerCase().replace(/\s+/g, "-"))}`}>
                    Create Table
                  </Link>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Decision Tables</h2>
            <p className="text-muted-foreground">Manage decision rules and validations for your workflows</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search tables..." className="w-full pl-8" />
            </div>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Tables</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {decisionTables.map((table) => (
                <DecisionTableCard key={table.id} table={table} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active" className="mt-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {decisionTables
                .filter((table) => table.active)
                .map((table) => (
                  <DecisionTableCard key={table.id} table={table} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="inactive" className="mt-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {decisionTables
                .filter((table) => !table.active)
                .map((table) => (
                  <DecisionTableCard key={table.id} table={table} />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

interface DecisionTableCardProps {
  table: {
    id: string
    name: string
    description: string
    active: boolean
    lastUpdated: string
    rows: number
    usedIn: {
      id: string
      name: string
    }[]
  }
}

function DecisionTableCard({ table }: DecisionTableCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Link href={`/decisioning/${table.id}`} className="hover:text-primary transition-colors">
              <h3 className="font-medium">{table.name}</h3>
            </Link>
            <Badge variant={table.active ? "default" : "secondary"} className="text-xs h-5">
              {table.active ? (
                <>
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Active
                </>
              ) : (
                <>
                  <XCircle className="mr-1 h-3 w-3" /> Inactive
                </>
              )}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                  <span className="sr-only">More Options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/decisioning/${table.id}`}>Edit Table</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem>Export</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Delete Table</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{table.description}</p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-xs text-muted-foreground">
            <Grid3X3 className="mr-1 h-3 w-3" />
            <span>{table.rows} rows</span>
          </div>

          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" />
            <span>Updated {table.lastUpdated}</span>
          </div>
        </div>

        {table.usedIn.length > 0 && (
          <div className="border-t pt-3">
            <h4 className="text-xs text-muted-foreground mb-2">Used in workflows:</h4>
            <div className="flex flex-wrap gap-2">
              {table.usedIn.map((workflow) => (
                <Badge key={workflow.id} variant="outline" className="text-xs flex items-center">
                  <GitBranch className="h-3 w-3 mr-1" />
                  {workflow.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

// Sample data
const decisionTables = [
  {
    id: "node-connection-rules",
    name: "Node Connection Rules",
    description: "Defines valid connections between different node types in workflows",
    active: true,
    lastUpdated: "2 days ago",
    rows: 12,
    usedIn: [
      { id: "customer-support-workflow", name: "Customer Support" },
      { id: "fraud-detection-pipeline", name: "Fraud Detection" },
    ],
  },
  {
    id: "model-compatibility",
    name: "Model Compatibility",
    description: "Defines which AI models can be used with specific data types",
    active: true,
    lastUpdated: "1 week ago",
    rows: 8,
    usedIn: [
      { id: "customer-support-workflow", name: "Customer Support" },
      { id: "content-moderation", name: "Content Moderation" },
    ],
  },
  {
    id: "data-transformation-rules",
    name: "Data Transformation Rules",
    description: "Rules for transforming data between different formats",
    active: true,
    lastUpdated: "3 days ago",
    rows: 15,
    usedIn: [{ id: "document-processing", name: "Document Processing" }],
  },
  {
    id: "approval-levels",
    name: "Approval Levels",
    description: "Decision matrix for determining approval levels based on risk scores",
    active: false,
    lastUpdated: "1 month ago",
    rows: 5,
    usedIn: [],
  },
  {
    id: "feature-flags",
    name: "Feature Flags",
    description: "Configuration for enabling/disabling features based on conditions",
    active: true,
    lastUpdated: "5 days ago",
    rows: 7,
    usedIn: [{ id: "customer-churn-prediction", name: "Customer Churn" }],
  },
  {
    id: "scoring-thresholds",
    name: "Scoring Thresholds",
    description: "Thresholds for determining actions based on model scores",
    active: true,
    lastUpdated: "1 day ago",
    rows: 9,
    usedIn: [
      { id: "lead-scoring", name: "Lead Scoring" },
      { id: "customer-churn-prediction", name: "Customer Churn" },
    ],
  },
]

```

File: /Volumes/X9/Downloads/ai-model-dashboard (1)/lib/permission-service.ts
```typescript
// Types for RBAC and permissions
export type PermissionLevel = "view" | "edit" | "admin" | "none"
export type ResourceType = "model" | "workflow" | "decision_table" | "knowledge_base" | "document" | "widget"
export type ScopeType = "organization" | "group" | "role" | "user"

export interface Permission {
  id: string
  resourceType: ResourceType
  resourceId: string
  scopeType: ScopeType
  scopeId: string
  level: PermissionLevel
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  name: string
  description: string
  organizationId: string
  isDefault: boolean
  permissions: Permission[]
}

export interface Group {
  id: string
  name: string
  description: string
  organizationId: string
  permissions: Permission[]
}

export interface Organization {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  settings: Record<string, any>
  permissions: Permission[]
}

export interface User {
  id: string
  email: string
  name: string
  organizationId: string
  roleIds: string[]
  groupIds: string[]
  permissions: Permission[]
}

class PermissionService {
  private organizations: Map<string, Organization> = new Map()
  private roles: Map<string, Role> = new Map()
  private groups: Map<string, Group> = new Map()
  private users: Map<string, User> = new Map()
  private permissions: Map<string, Permission> = new Map()

  // Check if a user has permission for a resource
  async hasPermission(
    userId: string,
    resourceType: ResourceType,
    resourceId: string,
    requiredLevel: PermissionLevel,
  ): Promise<boolean> {
    const user = await this.getUser(userId)
    if (!user) return false

    // Check direct user permissions
    const userPermission = this.findPermission(user.permissions, resourceType, resourceId)
    if (this.hasRequiredLevel(userPermission?.level, requiredLevel)) {
      return true
    }

    // Check role permissions
    const userRoles = await Promise.all(user.roleIds.map((roleId) => this.getRole(roleId)))
    for (const role of userRoles) {
      if (!role) continue
      const rolePermission = this.findPermission(role.permissions, resourceType, resourceId)
      if (this.hasRequiredLevel(rolePermission?.level, requiredLevel)) {
        return true
      }
    }

    // Check group permissions
    const userGroups = await Promise.all(user.groupIds.map((groupId) => this.getGroup(groupId)))
    for (const group of userGroups) {
      if (!group) continue
      const groupPermission = this.findPermission(group.permissions, resourceType, resourceId)
      if (this.hasRequiredLevel(groupPermission?.level, requiredLevel)) {
        return true
      }
    }

    // Check organization permissions
    const organization = await this.getOrganization(user.organizationId)
    if (organization) {
      const orgPermission = this.findPermission(organization.permissions, resourceType, resourceId)
      if (this.hasRequiredLevel(orgPermission?.level, requiredLevel)) {
        return true
      }
    }

    return false
  }

  // Check if a resource can be used in a workflow
  async canUseInWorkflow(userId: string, resourceType: ResourceType, resourceId: string): Promise<boolean> {
    // To use a resource in a workflow, user needs at least 'view' permission
    return this.hasPermission(userId, resourceType, resourceId, "view")
  }

  // Check if a resource can be used in a decision table
  async canUseInDecisionTable(userId: string, resourceType: ResourceType, resourceId: string): Promise<boolean> {
    // To use a resource in a decision table, user needs at least 'view' permission
    return this.hasPermission(userId, resourceType, resourceId, "view")
  }

  // Get resources that a user can access
  async getAccessibleResources(
    userId: string,
    resourceType: ResourceType,
    level: PermissionLevel = "view",
  ): Promise<string[]> {
    const user = await this.getUser(userId)
    if (!user) return []

    const accessibleIds = new Set<string>()

    // Check direct user permissions
    user.permissions
      .filter((p) => p.resourceType === resourceType && this.hasRequiredLevel(p.level, level))
      .forEach((p) => accessibleIds.add(p.resourceId))

    // Check role permissions
    const userRoles = await Promise.all(user.roleIds.map((roleId) => this.getRole(roleId)))
    userRoles.forEach((role) => {
      if (!role) return
      role.permissions
        .filter((p) => p.resourceType === resourceType && this.hasRequiredLevel(p.level, level))
        .forEach((p) => accessibleIds.add(p.resourceId))
    })

    // Check group permissions
    const userGroups = await Promise.all(user.groupIds.map((groupId) => this.getGroup(groupId)))
    userGroups.forEach((group) => {
      if (!group) return
      group.permissions
        .filter((p) => p.resourceType === resourceType && this.hasRequiredLevel(p.level, level))
        .forEach((p) => accessibleIds.add(p.resourceId))
    })

    // Check organization permissions
    const organization = await this.getOrganization(user.organizationId)
    if (organization) {
      organization.permissions
        .filter((p) => p.resourceType === resourceType && this.hasRequiredLevel(p.level, level))
        .forEach((p) => accessibleIds.add(p.resourceId))
    }

    return Array.from(accessibleIds)
  }

  // Grant permission to a scope (organization, group, role, or user)
  async grantPermission(
    scopeType: ScopeType,
    scopeId: string,
    resourceType: ResourceType,
    resourceId: string,
    level: PermissionLevel,
  ): Promise<Permission> {
    const permissionId = `${scopeType}_${scopeId}_${resourceType}_${resourceId}`

    const permission: Permission = {
      id: permissionId,
      resourceType,
      resourceId,
      scopeType,
      scopeId,
      level,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.permissions.set(permissionId, permission)

    // Update the scope's permissions
    switch (scopeType) {
      case "organization":
        await this.addPermissionToOrganization(scopeId, permission)
        break
      case "group":
        await this.addPermissionToGroup(scopeId, permission)
        break
      case "role":
        await this.addPermissionToRole(scopeId, permission)
        break
      case "user":
        await this.addPermissionToUser(scopeId, permission)
        break
    }

    return permission
  }

  // Revoke permission from a scope
  async revokePermission(
    scopeType: ScopeType,
    scopeId: string,
    resourceType: ResourceType,
    resourceId: string,
  ): Promise<boolean> {
    const permissionId = `${scopeType}_${scopeId}_${resourceType}_${resourceId}`

    if (!this.permissions.has(permissionId)) {
      return false
    }

    this.permissions.delete(permissionId)

    // Remove the permission from the scope
    switch (scopeType) {
      case "organization":
        await this.removePermissionFromOrganization(scopeId, permissionId)
        break
      case "group":
        await this.removePermissionFromGroup(scopeId, permissionId)
        break
      case "role":
        await this.removePermissionFromRole(scopeId, permissionId)
        break
      case "user":
        await this.removePermissionFromUser(scopeId, permissionId)
        break
    }

    return true
  }

  // Helper methods
  private findPermission(
    permissions: Permission[],
    resourceType: ResourceType,
    resourceId: string,
  ): Permission | undefined {
    return permissions.find((p) => p.resourceType === resourceType && p.resourceId === resourceId)
  }

  private hasRequiredLevel(actualLevel: PermissionLevel | undefined, requiredLevel: PermissionLevel): boolean {
    if (!actualLevel || actualLevel === "none") return false
    if (actualLevel === "admin") return true
    if (actualLevel === "edit" && (requiredLevel === "edit" || requiredLevel === "view")) return true
    if (actualLevel === "view" && requiredLevel === "view") return true
    return false
  }

  // CRUD operations for entities
  async getUser(userId: string): Promise<User | undefined> {
    return this.users.get(userId)
  }

  async getRole(roleId: string): Promise<Role | undefined> {
    return this.roles.get(roleId)
  }

  async getGroup(groupId: string): Promise<Group | undefined> {
    return this.groups.get(groupId)
  }

  async getOrganization(orgId: string): Promise<Organization | undefined> {
    return this.organizations.get(orgId)
  }

  private async addPermissionToOrganization(orgId: string, permission: Permission): Promise<void> {
    const org = await this.getOrganization(orgId)
    if (org) {
      org.permissions.push(permission)
      this.organizations.set(orgId, org)
    }
  }

  private async addPermissionToGroup(groupId: string, permission: Permission): Promise<void> {
    const group = await this.getGroup(groupId)
    if (group) {
      group.permissions.push(permission)
      this.groups.set(groupId, group)
    }
  }

  private async addPermissionToRole(roleId: string, permission: Permission): Promise<void> {
    const role = await this.getRole(roleId)
    if (role) {
      role.permissions.push(permission)
      this.roles.set(roleId, role)
    }
  }

  private async addPermissionToUser(userId: string, permission: Permission): Promise<void> {
    const user = await this.getUser(userId)
    if (user) {
      user.permissions.push(permission)
      this.users.set(userId, user)
    }
  }

  private async removePermissionFromOrganization(orgId: string, permissionId: string): Promise<void> {
    const org = await this.getOrganization(orgId)
    if (org) {
      org.permissions = org.permissions.filter((p) => p.id !== permissionId)
      this.organizations.set(orgId, org)
    }
  }

  private async removePermissionFromGroup(groupId: string, permissionId: string): Promise<void> {
    const group = await this.getGroup(groupId)
    if (group) {
      group.permissions = group.permissions.filter((p) => p.id !== permissionId)
      this.groups.set(groupId, group)
    }
  }

  private async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    const role = await this.getRole(roleId)
    if (role) {
      role.permissions = role.permissions.filter((p) => p.id !== permissionId)
      this.roles.set(roleId, role)
    }
  }

  private async removePermissionFromUser(userId: string, permissionId: string): Promise<void> {
    const user = await this.getUser(userId)
    if (user) {
      user.permissions = user.permissions.filter((p) => p.id !== permissionId)
      this.users.set(userId, user)
    }
  }

  // Check if a permission change would affect workflow or decision table usage
  async checkPermissionChangeImpact(
    scopeType: ScopeType,
    scopeId: string,
    resourceType: ResourceType,
    resourceId: string,
    newLevel: PermissionLevel,
  ): Promise<{
    workflowsAffected: string[]
    decisionTablesAffected: string[]
  }> {
    // This would be a complex operation in a real system
    // For now, we'll return a mock response
    return {
      workflowsAffected: [],
      decisionTablesAffected: [],
    }
  }
}

// Export a singleton instance
export const permissionService = new PermissionService()

```

File: /Volumes/X9/Downloads/ai-model-dashboard (1)/lib/api/routers/lookup-table.ts
```typescript
import { z } from "zod"
import { eq, and, desc } from "drizzle-orm"
import { createTRPCRouter, protectedProcedure } from "../trpc"
import { lookupTables, lookupTableDimensionBins, lookupTableCells } from "@/lib/db/schema/lookup-table"
import { TRPCError } from "@trpc/server"

const createLookupTableSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  outputVariableId: z.number(),
  inputVariable1Id: z.number(),
  inputVariable2Id: z.number().optional(),
  dimensionBins: z.array(
    z.object({
      dimension: z.number().min(1).max(2),
      binIndex: z.number(),
      label: z.string(),
      binType: z.enum(["exact", "range"]),
      exactValue: z.string().optional(),
      rangeMin: z.number().optional(),
      rangeMax: z.number().optional(),
      isMinInclusive: z.boolean().default(true),
      isMaxInclusive: z.boolean().default(false),
    }),
  ),
  cells: z.array(
    z.object({
      row1BinIndex: z.number(),
      row2BinIndex: z.number().optional(),
      outputValue: z.string(),
    }),
  ),
})

const updateLookupTableSchema = createLookupTableSchema.extend({
  id: z.number(),
})

export const lookupTableRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["draft", "published", "deprecated"]).optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(lookupTables.tenantId, ctx.tenantId)]

      if (input.status) {
        conditions.push(eq(lookupTables.status, input.status))
      }

      const tables = await ctx.db
        .select()
        .from(lookupTables)
        .where(and(...conditions))
        .orderBy(desc(lookupTables.updatedAt))

      return tables.filter(
        (table) =>
          !input.search ||
          table.name.toLowerCase().includes(input.search.toLowerCase()) ||
          table.description?.toLowerCase().includes(input.search.toLowerCase()),
      )
    }),

  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
    const table = await ctx.db.query.lookupTables.findFirst({
      where: and(eq(lookupTables.id, input.id), eq(lookupTables.tenantId, ctx.tenantId)),
      with: {
        dimensionBins: {
          orderBy: [lookupTableDimensionBins.dimension, lookupTableDimensionBins.binIndex],
        },
        cells: true,
      },
    })

    if (!table) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Lookup table not found",
      })
    }

    return table
  }),

  getByUuid: protectedProcedure.input(z.object({ uuid: z.string() })).query(async ({ ctx, input }) => {
    const table = await ctx.db.query.lookupTables.findFirst({
      where: and(eq(lookupTables.uuid, input.uuid), eq(lookupTables.tenantId, ctx.tenantId)),
      with: {
        dimensionBins: {
          orderBy: [lookupTableDimensionBins.dimension, lookupTableDimensionBins.binIndex],
        },
        cells: true,
      },
    })

    if (!table) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Lookup table not found",
      })
    }

    return table
  }),

  create: protectedProcedure.input(createLookupTableSchema).mutation(async ({ ctx, input }) => {
    return await ctx.db.transaction(async (tx) => {
      // Create the lookup table
      const [newTable] = await tx
        .insert(lookupTables)
        .values({
          tenantId: ctx.tenantId,
          name: input.name,
          description: input.description,
          outputVariableId: input.outputVariableId,
          inputVariable1Id: input.inputVariable1Id,
          inputVariable2Id: input.inputVariable2Id,
          createdBy: ctx.userId,
          updatedBy: ctx.userId,
        })
        .returning()

      if (!newTable) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create lookup table",
        })
      }

      // Create dimension bins
      const binInserts = input.dimensionBins.map((bin) => ({
        tenantId: ctx.tenantId,
        lookupTableId: newTable.id,
        dimension: bin.dimension,
        binIndex: bin.binIndex,
        label: bin.label,
        binType: bin.binType,
        exactValue: bin.exactValue,
        rangeMin: bin.rangeMin?.toString(),
        rangeMax: bin.rangeMax?.toString(),
        isMinInclusive: bin.isMinInclusive,
        isMaxInclusive: bin.isMaxInclusive,
      }))

      const createdBins = await tx.insert(lookupTableDimensionBins).values(binInserts).returning()

      // Create a mapping from bin index to bin ID for cell creation
      const binIndexToId = new Map<string, number>()
      createdBins.forEach((bin) => {
        const key = `${bin.dimension}-${bin.binIndex}`
        binIndexToId.set(key, bin.id)
      })

      // Create cells
      const cellInserts = input.cells.map((cell) => ({
        tenantId: ctx.tenantId,
        lookupTableId: newTable.id,
        row1BinId: binIndexToId.get(`1-${cell.row1BinIndex}`)!,
        row2BinId: cell.row2BinIndex ? binIndexToId.get(`2-${cell.row2BinIndex}`) : null,
        outputValue: cell.outputValue,
      }))

      await tx.insert(lookupTableCells).values(cellInserts)

      return newTable
    })
  }),

  update: protectedProcedure.input(updateLookupTableSchema).mutation(async ({ ctx, input }) => {
    return await ctx.db.transaction(async (tx) => {
      // Update the lookup table
      const [updatedTable] = await tx
        .update(lookupTables)
        .set({
          name: input.name,
          description: input.description,
          outputVariableId: input.outputVariableId,
          inputVariable1Id: input.inputVariable1Id,
          inputVariable2Id: input.inputVariable2Id,
          updatedBy: ctx.userId,
          updatedAt: new Date(),
        })
        .where(and(eq(lookupTables.id, input.id), eq(lookupTables.tenantId, ctx.tenantId)))
        .returning()

      if (!updatedTable) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lookup table not found",
        })
      }

      // Delete existing bins and cells
      await tx.delete(lookupTableCells).where(eq(lookupTableCells.lookupTableId, input.id))

      await tx.delete(lookupTableDimensionBins).where(eq(lookupTableDimensionBins.lookupTableId, input.id))

      // Recreate bins and cells (same logic as create)
      const binInserts = input.dimensionBins.map((bin) => ({
        tenantId: ctx.tenantId,
        lookupTableId: updatedTable.id,
        dimension: bin.dimension,
        binIndex: bin.binIndex,
        label: bin.label,
        binType: bin.binType,
        exactValue: bin.exactValue,
        rangeMin: bin.rangeMin?.toString(),
        rangeMax: bin.rangeMax?.toString(),
        isMinInclusive: bin.isMinInclusive,
        isMaxInclusive: bin.isMaxInclusive,
      }))

      const createdBins = await tx.insert(lookupTableDimensionBins).values(binInserts).returning()

      const binIndexToId = new Map<string, number>()
      createdBins.forEach((bin) => {
        const key = `${bin.dimension}-${bin.binIndex}`
        binIndexToId.set(key, bin.id)
      })

      const cellInserts = input.cells.map((cell) => ({
        tenantId: ctx.tenantId,
        lookupTableId: updatedTable.id,
        row1BinId: binIndexToId.get(`1-${cell.row1BinIndex}`)!,
        row2BinId: cell.row2BinIndex ? binIndexToId.get(`2-${cell.row2BinIndex}`) : null,
        outputValue: cell.outputValue,
      }))

      await tx.insert(lookupTableCells).values(cellInserts)

      return updatedTable
    })
  }),

  publish: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const [updatedTable] = await ctx.db
      .update(lookupTables)
      .set({
        status: "published",
        version: lookupTables.version + 1,
        updatedBy: ctx.userId,
        updatedAt: new Date(),
      })
      .where(and(eq(lookupTables.id, input.id), eq(lookupTables.tenantId, ctx.tenantId)))
      .returning()

    if (!updatedTable) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Lookup table not found",
      })
    }

    return updatedTable
  }),

  deprecate: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const [updatedTable] = await ctx.db
      .update(lookupTables)
      .set({
        status: "deprecated",
        updatedBy: ctx.userId,
        updatedAt: new Date(),
      })
      .where(and(eq(lookupTables.id, input.id), eq(lookupTables.tenantId, ctx.tenantId)))
      .returning()

    if (!updatedTable) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Lookup table not found",
      })
    }

    return updatedTable
  }),

  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    return await ctx.db.transaction(async (tx) => {
      // Delete cells first
      await tx.delete(lookupTableCells).where(eq(lookupTableCells.lookupTableId, input.id))

      // Delete dimension bins
      await tx.delete(lookupTableDimensionBins).where(eq(lookupTableDimensionBins.lookupTableId, input.id))

      // Delete the table
      const [deletedTable] = await tx
        .delete(lookupTables)
        .where(and(eq(lookupTables.id, input.id), eq(lookupTables.tenantId, ctx.tenantId)))
        .returning()

      if (!deletedTable) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lookup table not found",
        })
      }

      return deletedTable
    })
  }),
})

```

File: /Volumes/X9/Downloads/ai-model-dashboard (1)/lib/model-service.ts
```typescript
// lib/model-service.ts

// Sample model data
const models = [
  {
    id: "model_1",
    name: "Microfinance Risk Predictor v3",
    version: "3.2.1",
    status: "champion",
    lastUpdate: "2 days ago",
    inferences: 1243567,
    creator: "Ahmed Al-Mansouri",
    description: "Predicts risk levels for microfinance loan applications",
    type: "Classification",
    framework: "PyTorch",
    accuracy: "91.2%",
    features: [
      { name: "income", type: "numeric", description: "Monthly income in local currency" },
      { name: "loan_amount", type: "numeric", description: "Requested loan amount" },
      { name: "loan_term", type: "numeric", description: "Loan term in months" },
      { name: "age", type: "numeric", description: "Applicant age in years" },
      { name: "employment_years", type: "numeric", description: "Years at current employment" },
      { name: "previous_loans", type: "numeric", description: "Number of previous loans" },
      { name: "credit_score", type: "numeric", description: "Internal credit score (0-100)" },
    ],
    recentInferences: [
      { id: "inf_1", timestamp: "2 hours ago", result: "Low Risk", confidence: 0.92 },
      { id: "inf_2", timestamp: "5 hours ago", result: "Medium Risk", confidence: 0.78 },
      { id: "inf_3", timestamp: "1 day ago", result: "High Risk", confidence: 0.95 },
    ],
  },
  {
    id: "model_2",
    name: "SME Fraud Detection Engine",
    version: "2.4.0",
    status: "challenger",
    lastUpdate: "5 days ago",
    inferences: 3456789,
    creator: "Fatima Al-Zahrani",
    description: "Detects potential fraud in SME transactions",
    type: "Classification",
    framework: "TensorFlow",
    accuracy: "94.5%",
    features: [
      { name: "transaction_amount", type: "numeric", description: "Transaction amount" },
      { name: "transaction_time", type: "datetime", description: "Time of transaction" },
      { name: "merchant_category", type: "categorical", description: "Merchant category code" },
      { name: "location", type: "categorical", description: "Transaction location" },
      { name: "device_id", type: "categorical", description: "Device used for transaction" },
    ],
    recentInferences: [
      { id: "inf_4", timestamp: "1 hour ago", result: "Not Fraud", confidence: 0.97 },
      { id: "inf_5", timestamp: "3 hours ago", result: "Fraud", confidence: 0.89 },
    ],
  },
  {
    id: "model_3",
    name: "Telecom Churn Predictor",
    version: "1.8.5",
    status: "champion",
    lastUpdate: "1 week ago",
    inferences: 876543,
    creator: "Mohammed Al-Otaibi",
    description: "Predicts customer churn for telecom services",
    type: "Classification",
    framework: "scikit-learn",
    accuracy: "87.9%",
    features: [
      { name: "monthly_charges", type: "numeric", description: "Monthly charges" },
      { name: "tenure", type: "numeric", description: "Months as a customer" },
      { name: "contract_type", type: "categorical", description: "Type of contract" },
      { name: "payment_method", type: "categorical", description: "Payment method" },
      { name: "service_usage", type: "numeric", description: "Service usage metrics" },
    ],
    recentInferences: [],
  },
  {
    id: "model_4",
    name: "Salary Prediction Model",
    version: "2.1.3",
    status: "challenger",
    lastUpdate: "3 days ago",
    inferences: 543210,
    creator: "Saeed Al-Ghamdi",
    description: "Predicts salary ranges based on job attributes",
    type: "Regression",
    framework: "XGBoost",
    accuracy: "89.7%",
    features: [
      { name: "experience", type: "numeric", description: "Years of experience" },
      { name: "education", type: "categorical", description: "Education level" },
      { name: "skills", type: "array", description: "List of skills" },
      { name: "location", type: "categorical", description: "Job location" },
      { name: "industry", type: "categorical", description: "Industry sector" },
    ],
    recentInferences: [],
  },
  {
    id: "model_5",
    name: "Mortgage Default Predictor",
    version: "4.0.2",
    status: "challenger",
    lastUpdate: "1 day ago",
    inferences: 987654,
    creator: "Aisha Al-Farsi",
    description: "Predicts likelihood of mortgage default",
    type: "Classification",
    framework: "LightGBM",
    accuracy: "92.8%",
    features: [
      { name: "loan_to_value", type: "numeric", description: "Loan to value ratio" },
      { name: "debt_to_income", type: "numeric", description: "Debt to income ratio" },
      { name: "credit_score", type: "numeric", description: "Credit score" },
      { name: "employment_status", type: "categorical", description: "Employment status" },
      { name: "property_type", type: "categorical", description: "Type of property" },
    ],
    recentInferences: [],
  },
]

export async function getModels() {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return models
}

export async function getModelById(id: string) {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const model = models.find((m) => m.id === id)
  if (!model) {
    throw new Error(`Model with ID ${id} not found`)
  }

  return model
}

export async function updateModel(id: string, data: any) {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const modelIndex = models.findIndex((m) => m.id === id)
  if (modelIndex === -1) {
    throw new Error(`Model with ID ${id} not found`)
  }

  // Update the model in the array (in a real app, this would be a database update)
  models[modelIndex] = { ...models[modelIndex], ...data }

  return models[modelIndex]
}

export async function deleteModel(id: string) {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const modelIndex = models.findIndex((m) => m.id === id)
  if (modelIndex === -1) {
    throw new Error(`Model with ID ${id} not found`)
  }

  // Delete the model from the array (in a real app, this would be a database delete)
  models.splice(modelIndex, 1)

  return
}

```

File: /Volumes/X9/Downloads/ai-model-dashboard (1)/lib/db/schema/lookup-table.ts
```typescript
import {
  pgTable,
  bigserial,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const lookupTables = pgTable(
  "lookup_tables",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    uuid: uuid("uuid").defaultRandom().unique().notNull(),
    tenantId: varchar("tenant_id", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    outputVariableId: bigserial("output_variable_id", { mode: "number" }).notNull(),
    inputVariable1Id: bigserial("input_variable_1_id", { mode: "number" }).notNull(),
    inputVariable2Id: bigserial("input_variable_2_id", { mode: "number" }), // Optional for 1D tables
    status: varchar("status", { length: 50 }).notNull().default("draft"), // draft, published, deprecated
    version: integer("version").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdBy: varchar("created_by", { length: 255 }).notNull(),
    updatedBy: varchar("updated_by", { length: 255 }).notNull(),
  },
  (table) => ({
    tenantNameIdx: uniqueIndex("lookup_tables_tenant_name_idx").on(table.tenantId, table.name),
    tenantIdIdx: index("lookup_tables_tenant_id_idx").on(table.tenantId),
  }),
)

export const lookupTableDimensionBins = pgTable(
  "lookup_table_dimension_bins",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    uuid: uuid("uuid").defaultRandom().unique().notNull(),
    tenantId: varchar("tenant_id", { length: 255 }).notNull(),
    lookupTableId: bigserial("lookup_table_id", { mode: "number" }).notNull(),
    dimension: integer("dimension").notNull(), // 1 for rows, 2 for columns
    binIndex: integer("bin_index").notNull(), // Order within the dimension
    label: varchar("label", { length: 255 }).notNull(),
    binType: varchar("bin_type", { length: 50 }).notNull(), // 'exact', 'range'
    exactValue: text("exact_value"), // For categorical values
    rangeMin: decimal("range_min", { precision: 15, scale: 6 }), // For numeric ranges
    rangeMax: decimal("range_max", { precision: 15, scale: 6 }), // For numeric ranges
    isMinInclusive: boolean("is_min_inclusive").default(true),
    isMaxInclusive: boolean("is_max_inclusive").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    lookupTableIdx: index("dimension_bins_lookup_table_idx").on(table.lookupTableId),
    tenantIdIdx: index("dimension_bins_tenant_id_idx").on(table.tenantId),
  }),
)

export const lookupTableCells = pgTable(
  "lookup_table_cells",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    uuid: uuid("uuid").defaultRandom().unique().notNull(),
    tenantId: varchar("tenant_id", { length: 255 }).notNull(),
    lookupTableId: bigserial("lookup_table_id", { mode: "number" }).notNull(),
    row1BinId: bigserial("row_1_bin_id", { mode: "number" }).notNull(),
    row2BinId: bigserial("row_2_bin_id", { mode: "number" }), // Optional for 1D tables
    outputValue: text("output_value").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    lookupTableIdx: index("cells_lookup_table_idx").on(table.lookupTableId),
    tenantIdIdx: index("cells_tenant_id_idx").on(table.tenantId),
  }),
)

// Relations
export const lookupTablesRelations = relations(lookupTables, ({ many }) => ({
  dimensionBins: many(lookupTableDimensionBins),
  cells: many(lookupTableCells),
}))

export const lookupTableDimensionBinsRelations = relations(lookupTableDimensionBins, ({ one, many }) => ({
  lookupTable: one(lookupTables, {
    fields: [lookupTableDimensionBins.lookupTableId],
    references: [lookupTables.id],
  }),
  cellsAsRow1: many(lookupTableCells, { relationName: "row1Bin" }),
  cellsAsRow2: many(lookupTableCells, { relationName: "row2Bin" }),
}))

export const lookupTableCellsRelations = relations(lookupTableCells, ({ one }) => ({
  lookupTable: one(lookupTables, {
    fields: [lookupTableCells.lookupTableId],
    references: [lookupTables.id],
  }),
  row1Bin: one(lookupTableDimensionBins, {
    fields: [lookupTableCells.row1BinId],
    references: [lookupTableDimensionBins.id],
    relationName: "row1Bin",
  }),
  row2Bin: one(lookupTableDimensionBins, {
    fields: [lookupTableCells.row2BinId],
    references: [lookupTableDimensionBins.id],
    relationName: "row2Bin",
  }),
}))

```

File: /Volumes/X9/Downloads/ai-model-dashboard (1)/lib/decision-service.ts
```typescript
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

```

File: /Volumes/X9/Downloads/ai-model-dashboard (1)/package.json
```json
{
  "name": "my-v0-project",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@aws-sdk/client-rds-data": "latest",
    "@cloudflare/workers-types": "latest",
    "@electric-sql/pglite": "latest",
    "@hookform/resolvers": "^3.9.1",
    "@libsql/client": "latest",
    "@libsql/client-wasm": "latest",
    "@neondatabase/serverless": "latest",
    "@op-engineering/op-sqlite": "latest",
    "@opentelemetry/api": "latest",
    "@planetscale/database": "latest",
    "@prisma/client": "latest",
    "@radix-ui/react-accordion": "1.2.2",
    "@radix-ui/react-alert-dialog": "1.1.4",
    "@radix-ui/react-aspect-ratio": "1.1.1",
    "@radix-ui/react-avatar": "1.1.2",
    "@radix-ui/react-checkbox": "1.1.3",
    "@radix-ui/react-collapsible": "1.1.2",
    "@radix-ui/react-context-menu": "2.2.4",
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-dropdown-menu": "2.1.4",
    "@radix-ui/react-hover-card": "1.1.4",
    "@radix-ui/react-label": "2.1.1",
    "@radix-ui/react-menubar": "1.1.4",
    "@radix-ui/react-navigation-menu": "1.2.3",
    "@radix-ui/react-popover": "latest",
    "@radix-ui/react-progress": "1.1.1",
    "@radix-ui/react-radio-group": "1.2.2",
    "@radix-ui/react-scroll-area": "1.2.2",
    "@radix-ui/react-select": "2.1.4",
    "@radix-ui/react-separator": "1.1.1",
    "@radix-ui/react-slider": "1.2.2",
    "@radix-ui/react-slot": "1.1.1",
    "@radix-ui/react-switch": "1.1.2",
    "@radix-ui/react-tabs": "1.1.2",
    "@radix-ui/react-toast": "1.2.4",
    "@radix-ui/react-toggle": "1.1.1",
    "@radix-ui/react-toggle-group": "1.1.1",
    "@radix-ui/react-tooltip": "1.1.6",
    "@tidbcloud/serverless": "latest",
    "@trpc/server": "latest",
    "@types/better-sqlite3": "latest",
    "@types/pg": "latest",
    "@types/sql.js": "latest",
    "@upstash/redis": "latest",
    "@vercel/postgres": "latest",
    "@xata.io/client": "latest",
    "autoprefixer": "^10.4.20",
    "better-sqlite3": "latest",
    "bun-types": "latest",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "1.0.4",
    "date-fns": "4.1.0",
    "drizzle-orm": "latest",
    "embla-carousel-react": "8.5.1",
    "expo-sqlite": "latest",
    "gel": "latest",
    "input-otp": "1.4.1",
    "knex": "latest",
    "kysely": "latest",
    "lucide-react": "^0.454.0",
    "mysql2": "latest",
    "next": "15.2.4",
    "next-themes": "latest",
    "pg": "latest",
    "postgres": "latest",
    "react": "^19",
    "react-day-picker": "8.10.1",
    "react-dom": "^19",
    "react-hook-form": "^7.54.1",
    "react-resizable-panels": "^2.1.7",
    "reactflow": "latest",
    "recharts": "2.15.0",
    "sonner": "^1.7.1",
    "sql.js": "latest",
    "sqlite3": "latest",
    "tailwind-merge": "^2.5.5",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.9.6",
    "zod": "latest"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "postcss": "^8.5",
    "tailwindcss": "^3.4.17",
    "typescript": "^5"
  }
}
```

File: /Volumes/X9/Downloads/ai-model-dashboard (1)/lib/db/schema/decision-table.ts
```typescript
import {
  pgTable,
  bigserial,
  uuid,
  bigint,
  varchar,
  text,
  integer,
  timestamp,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core"

export const decisionTables = pgTable(
  "decision_tables",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    uuid: uuid("uuid").defaultRandom().unique().notNull(),
    tenantId: bigint("tenant_id", { mode: "number" }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 50 }).default("draft").notNull(), // draft, published, deprecated
    version: integer("version").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdBy: bigint("created_by", { mode: "number" }).notNull(),
    updatedBy: bigint("updated_by", { mode: "number" }).notNull(),
  },
  (table) => ({
    tenantNameIdx: uniqueIndex("decision_tables_tenant_name_idx").on(table.tenantId, table.name),
  }),
)

export const decisionTableInputs = pgTable("decision_table_inputs", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  decisionTableId: bigint("decision_table_id", { mode: "number" })
    .references(() => decisionTables.id, { onDelete: "cascade" })
    .notNull(),
  variableId: bigint("variable_id", { mode: "number" }).notNull(), // references variables table
  label: varchar("label", { length: 255 }).notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const decisionTableOutputs = pgTable("decision_table_outputs", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  decisionTableId: bigint("decision_table_id", { mode: "number" })
    .references(() => decisionTables.id, { onDelete: "cascade" })
    .notNull(),
  variableId: bigint("variable_id", { mode: "number" }).notNull(), // references variables table
  label: varchar("label", { length: 255 }).notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const decisionTableRules = pgTable("decision_table_rules", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  decisionTableId: bigint("decision_table_id", { mode: "number" })
    .references(() => decisionTables.id, { onDelete: "cascade" })
    .notNull(),
  order: integer("order").notNull(),
  description: text("description"),
  isFallback: boolean("is_fallback").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const decisionTableConditions = pgTable("decision_table_conditions", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  ruleId: bigint("rule_id", { mode: "number" })
    .references(() => decisionTableRules.id, { onDelete: "cascade" })
    .notNull(),
  inputId: bigint("input_id", { mode: "number" })
    .references(() => decisionTableInputs.id, { onDelete: "cascade" })
    .notNull(),
  operator: varchar("operator", { length: 50 }).notNull(), // equals, not_equals, greater_than, less_than, between, contains, starts_with, ends_with, in_list, not_in_list
  value: text("value"), // JSON string for complex values
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const decisionTableOutcomes = pgTable("decision_table_outcomes", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  ruleId: bigint("rule_id", { mode: "number" })
    .references(() => decisionTableRules.id, { onDelete: "cascade" })
    .notNull(),
  outputId: bigint("output_id", { mode: "number" })
    .references(() => decisionTableOutputs.id, { onDelete: "cascade" })
    .notNull(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export type DecisionTable = typeof decisionTables.$inferSelect
export type DecisionTableInput = typeof decisionTableInputs.$inferSelect
export type DecisionTableOutput = typeof decisionTableOutputs.$inferSelect
export type DecisionTableRule = typeof decisionTableRules.$inferSelect
export type DecisionTableCondition = typeof decisionTableConditions.$inferSelect
export type DecisionTableOutcome = typeof decisionTableOutcomes.$inferSelect

```

File: /Volumes/X9/Downloads/ai-model-dashboard (1)/app/decisioning/lookups/[uuid]/edit/page.tsx
```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LookupTableEditor } from "@/components/lookup-table-editor"

// Mock data for editing
const mockLookupTableData = {
  id: 1,
  name: "Credit Score Risk Matrix",
  description: "Maps credit scores and income levels to risk categories for loan approval decisions",
  inputVariable1: { id: 1, name: "Credit Score", dataType: "number" },
  inputVariable2: { id: 2, name: "Annual Income", dataType: "number" },
  outputVariable: { id: 6, name: "Risk Level", dataType: "string" },
  dimension1Bins: [
    {
      id: "1",
      label: "Poor (300-579)",
      binType: "range" as const,
      rangeMin: 300,
      rangeMax: 579,
      isMinInclusive: true,
      isMaxInclusive: false,
    },
    {
      id: "2",
      label: "Fair (580-669)",
      binType: "range" as const,
      rangeMin: 580,
      rangeMax: 669,
      isMinInclusive: true,
      isMaxInclusive: false,
    },
    {
      id: "3",
      label: "Good (670-739)",
      binType: "range" as const,
      rangeMin: 670,
      rangeMax: 739,
      isMinInclusive: true,
      isMaxInclusive: false,
    },
    {
      id: "4",
      label: "Excellent (740+)",
      binType: "range" as const,
      rangeMin: 740,
      rangeMax: 850,
      isMinInclusive: true,
      isMaxInclusive: true,
    },
  ],
  dimension2Bins: [
    {
      id: "a",
      label: "Low (<$30k)",
      binType: "range" as const,
      rangeMin: 0,
      rangeMax: 30000,
      isMinInclusive: true,
      isMaxInclusive: false,
    },
    {
      id: "b",
      label: "Medium ($30k-$75k)",
      binType: "range" as const,
      rangeMin: 30000,
      rangeMax: 75000,
      isMinInclusive: true,
      isMaxInclusive: false,
    },
    {
      id: "c",
      label: "High ($75k-$150k)",
      binType: "range" as const,
      rangeMin: 75000,
      rangeMax: 150000,
      isMinInclusive: true,
      isMaxInclusive: false,
    },
    {
      id: "d",
      label: "Very High ($150k+)",
      binType: "range" as const,
      rangeMin: 150000,
      rangeMax: 1000000,
      isMinInclusive: true,
      isMaxInclusive: true,
    },
  ],
  cells: {
    "1-a": "High Risk",
    "1-b": "High Risk",
    "1-c": "Medium Risk",
    "1-d": "Medium Risk",
    "2-a": "High Risk",
    "2-b": "Medium Risk",
    "2-c": "Medium Risk",
    "2-d": "Low Risk",
    "3-a": "Medium Risk",
    "3-b": "Medium Risk",
    "3-c": "Low Risk",
    "3-d": "Low Risk",
    "4-a": "Medium Risk",
    "4-b": "Low Risk",
    "4-c": "Low Risk",
    "4-d": "Very Low Risk",
  },
  status: "published" as const,
}

export default function EditLookupTablePage({ params }: { params: { uuid: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async (data: any) => {
    setIsLoading(true)
    try {
      // In a real app, this would call the tRPC mutation
      console.log("Saving lookup table:", data)
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
      router.push(`/decisioning/lookups/${params.uuid}`)
    } catch (error) {
      console.error("Failed to save lookup table:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTest = (data: any) => {
    console.log("Testing lookup table:", data)
    // Test logic would go here
  }

  return (
    <div className="container mx-auto py-6">
      <LookupTableEditor
        initialData={mockLookupTableData}
        onSave={handleSave}
        onTest={handleTest}
        isLoading={isLoading}
      />
    </div>
  )
}

```

File: /Volumes/X9/Downloads/ai-model-dashboard (1)/styles/globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: Arial, Helvetica, sans-serif;
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --radius: 0.5rem;
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

```

File: /Volumes/X9/Downloads/ai-model-dashboard (1)/hooks/use-toast.ts
```typescript
"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }

```

File: /Volumes/X9/Downloads/ai-model-dashboard (1)/tailwind.config.ts
```typescript
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          border: "hsl(var(--sidebar-border))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

```

File: /Volumes/X9/Downloads/ai-model-dashboard (1)/app/decisioning/loading.tsx
```tsx
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-24" />
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-40" />
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>

          <div className="w-full md:w-64">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <Skeleton className="h-10 w-60" />

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-44 w-full" />
            ))}
        </div>
      </main>
    </div>
  )
}

```

File: /Volumes/X9/Downloads/ai-model-dashboard (1)/tsconfig.json
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "target": "ES6",
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

```

File: /Volumes/X9/Downloads/ai-model-dashboard (1)/components.json
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

File: /Volumes/X9/Downloads/ai-model-dashboard (1)/hooks/use-mobile.tsx
```tsx
"use client"

import { useEffect, useState } from "react"

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Clean up
    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  return isMobile
}

```

File: /Volumes/X9/Downloads/ai-model-dashboard (1)/.gitignore
```gitignore
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules

# next.js
/.next/
/out/

# production
/build

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

File: /Volumes/X9/Downloads/ai-model-dashboard (1)/next.config.mjs
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig

```

File: /Volumes/X9/Downloads/ai-model-dashboard (1)/lib/utils.ts
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

```

File: /Volumes/X9/Downloads/ai-model-dashboard (1)/postcss.config.mjs
```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
};

export default config;

```

File: /Volumes/X9/Downloads/ai-model-dashboard (1)/pnpm-lock.yaml
```yaml
lockfileVersion: '9.0'

settings:
  autoInstallPeers: true
  excludeLinksFromLockfile: false
```

File: /Volumes/X9/Downloads/ai-model-dashboard (1)/app/decisioning/lookups/loading.tsx
```tsx
export default function Loading() {
  return null
}

```

</file_contents>

