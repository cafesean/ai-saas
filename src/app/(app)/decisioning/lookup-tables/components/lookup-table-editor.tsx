"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Plus, Save, Settings, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { api } from "@/utils/trpc"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, GripHorizontal } from "lucide-react"
import React from "react"

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
  currentData?: LookupTableData
  onSave: (data: LookupTableData) => void
  onTest?: (data: LookupTableData) => void
  onChange?: (data: LookupTableData) => void
  isLoading?: boolean
  errors?: Record<string, string>
  hasChanges?: boolean
  showBasicInfo?: boolean // Controls whether to show Basic Information and Variables sections
}

// Remove mockVariables - will use real variables from API

export function LookupTableEditor({ initialData, currentData, onSave, onTest, onChange, isLoading, errors, hasChanges, showBasicInfo = true }: LookupTableEditorProps) {
  // Fetch variables from API
  const { data: variables, isLoading: isLoadingVariables } = api.variable.getAll.useQuery()
  
  // Track if this is the initial load to avoid triggering onChange on mount
  const isInitialLoad = useRef(true)
  
  // Use currentData if provided, otherwise use internal state
  const [internalData, setInternalData] = useState<LookupTableData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    inputVariable1: initialData?.inputVariable1 || (variables?.[0] ? { id: variables[0].id, name: variables[0].name, dataType: variables[0].dataType } : { id: 0, name: "", dataType: "string" }),
    inputVariable2: initialData?.inputVariable2,
    outputVariable: initialData?.outputVariable || (variables?.[1] ? { id: variables[1].id, name: variables[1].name, dataType: variables[1].dataType } : { id: 0, name: "", dataType: "string" }),
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

  // Use currentData if provided, otherwise use internal state
  const data = currentData || internalData
  const setData = currentData ? (updater: any) => {
    const newData = typeof updater === 'function' ? updater(data) : updater
    onChange?.(newData)
  } : setInternalData
  
  // Update default variables when variables are loaded (only for internal state)
  useEffect(() => {
    if (!currentData && variables && variables.length > 0 && !initialData?.inputVariable1) {
      const firstVariable = variables[0]
      const secondVariable = variables.length > 1 ? variables[1] : null
      
      if (firstVariable) {
        setInternalData(prev => ({
          ...prev,
          inputVariable1: { id: firstVariable.id, name: firstVariable.name, dataType: firstVariable.dataType },
          outputVariable: secondVariable ? { id: secondVariable.id, name: secondVariable.name, dataType: secondVariable.dataType } : prev.outputVariable,
        }))
      }
    }
  }, [variables, initialData?.inputVariable1, currentData])

  const [cellValidations, setCellValidations] = useState<Record<string, CellValidation>>({})
  const [editingBinId, setEditingBinId] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Validate a dimension bin - memoized to avoid re-creation
  const validateBin = useCallback((bin: DimensionBin, variable: { dataType: string }): { isValid: boolean; error?: string } => {
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
  }, [])

  // Validate a cell value - memoized to avoid re-creation
  const validateCell = useCallback((value: string, outputVariable: { dataType: string }): CellValidation => {
    if (!value.trim()) {
      return { isValid: false, error: "Value is required" }
    }

    if (outputVariable.dataType === "number" && isNaN(Number(value))) {
      return { isValid: false, error: "Must be a valid number" }
    }

    return { isValid: true }
  }, [])

  // Update cell validation when cells change - simplified without debouncing
  useEffect(() => {
    const newValidations: Record<string, CellValidation> = {}
    Object.entries(data.cells).forEach(([key, value]) => {
      newValidations[key] = validateCell(value, data.outputVariable)
    })
    setCellValidations(newValidations)
  }, [data.cells, data.outputVariable, validateCell])

  // Notify parent of data changes - only when internal data actually changes, not on initial load
  useEffect(() => {
    if (!currentData && onChange) {
      if (isInitialLoad.current) {
        isInitialLoad.current = false
        return
      }
      onChange(internalData)
    }
  }, [internalData, onChange, currentData])

  const addRow = () => {
    const newBin: DimensionBin = {
      id: `row-${Date.now()}`,
      label: `Row ${data.dimension1Bins.length + 1}`,
      binType: data.inputVariable1.dataType === "number" ? "range" : "exact",
      exactValue: data.inputVariable1.dataType === "string" ? "" : data.inputVariable1.dataType === "number" ? "" : "",
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
      // Cannot add columns without selecting a secondary input variable first
      // The user needs to select the Column Variable (Secondary Input) in the configuration section above
      return
    }
    
    const newBin: DimensionBin = {
      id: `col-${Date.now()}`,
      label: `Column ${data.dimension2Bins.length + 1}`,
      binType: data.inputVariable2.dataType === "number" ? "range" : "exact",
      exactValue: data.inputVariable2.dataType === "string" ? "" : data.inputVariable2.dataType === "number" ? "" : "",
      rangeMin: data.inputVariable2.dataType === "number" ? 0 : undefined,
      rangeMax: data.inputVariable2.dataType === "number" ? 100 : undefined,
      isMinInclusive: true,
      isMaxInclusive: false,
      isValid: false,
      validationError: "Configuration required",
    }
    setData((prev) => ({ ...prev, dimension2Bins: [...prev.dimension2Bins, newBin] }))
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

  const updateBin = useCallback((dimension: 1 | 2, binId: string, updates: Partial<DimensionBin>) => {
    setData((prev) => {
      const variable = dimension === 1 ? prev.inputVariable1 : prev.inputVariable2
      if (!variable) return prev

      if (dimension === 1) {
        return {
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
        }
      } else {
        return {
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
        }
      }
    })
  }, [validateBin])



  const getCellValue = useCallback((row1BinId: string, row2BinId: string | null) => {
    const cellKey = row2BinId ? `${row1BinId}-${row2BinId}` : row1BinId
    return data.cells[cellKey] || ""
  }, [data.cells])

  const getCellValidation = useCallback((row1BinId: string, row2BinId: string | null) => {
    const cellKey = row2BinId ? `${row1BinId}-${row2BinId}` : row1BinId
    return cellValidations[cellKey] || { isValid: true }
  }, [cellValidations])

  // Validate form before saving - only check critical fields
  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!data.name.trim()) {
      errors.name = "Table name is required"
    }
    
    // Only check for basic requirements, don't block saves for bin validation
    // Bins can be configured later
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      onSave(data)
    } else {
      // Show validation errors to user
      console.log("Validation errors:", formErrors)
    }
  }

  // Handle drag end for rows
  const handleRowDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id && over) {
      setData((prev) => {
        const oldIndex = prev.dimension1Bins.findIndex((bin) => bin.id === active.id)
        const newIndex = prev.dimension1Bins.findIndex((bin) => bin.id === over.id)

        // Reorder the bins
        const newDimension1Bins = arrayMove(prev.dimension1Bins, oldIndex, newIndex)

        // Cell data is keyed by bin.id, so no need to update cell keys
        // The cell keys remain the same because they reference the bin IDs directly
        return {
          ...prev,
          dimension1Bins: newDimension1Bins,
          // cells remain unchanged - they're keyed by bin IDs which don't change
        }
      })
    }
  }

  // Handle drag end for columns
  const handleColumnDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id && over) {
      setData((prev) => {
        const oldIndex = prev.dimension2Bins.findIndex((bin) => bin.id === active.id)
        const newIndex = prev.dimension2Bins.findIndex((bin) => bin.id === over.id)

        // Reorder the bins
        const newDimension2Bins = arrayMove(prev.dimension2Bins, oldIndex, newIndex)

        // Cell data is keyed by bin.id, so no need to update cell keys
        // The cell keys remain the same because they reference the bin IDs directly
        return {
          ...prev,
          dimension2Bins: newDimension2Bins,
          // cells remain unchanged - they're keyed by bin IDs which don't change
        }
      })
    }
  }

  const renderBinConfigPopover = (bin: DimensionBin, dimension: 1 | 2) => {
    const variable = dimension === 1 ? data.inputVariable1 : data.inputVariable2
    if (!variable) return null

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
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


  // Simple direct update function - React 19 handles optimization automatically
  const updateCell = (row1BinId: string, row2BinId: string | null, value: string) => {
    const cellKey = row2BinId ? `${row1BinId}-${row2BinId}` : row1BinId
    setData((prev) => ({
      ...prev,
      cells: { ...prev.cells, [cellKey]: value },
    }))
  }


  // SortableRow component with stable key and no memo
  const SortableRow = ({ bin, children }: { bin: DimensionBin; children: React.ReactNode }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: bin.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    }

    return (
      <tr
        ref={setNodeRef}
        style={style}
        className={cn(isDragging && "opacity-50")}
        {...attributes}
      >
        <td className="border border-border p-2 bg-muted/30">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              {editingBinId === bin.id ? (
                <Input
                  value={bin.label}
                  onChange={(e) => updateBin(1, bin.id, { label: e.target.value })}
                  onBlur={() => setEditingBinId(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setEditingBinId(null)
                    }
                  }}
                  className="h-6 text-sm font-medium"
                  autoFocus
                />
              ) : (
                <div 
                  className="font-medium truncate cursor-pointer hover:bg-accent px-1 py-0.5 rounded"
                  onClick={() => setEditingBinId(bin.id)}
                  title="Click to edit label"
                >
                  {bin.label}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                {bin.binType === "exact" 
                  ? `= ${bin.exactValue || "Not set"}` 
                  : `${bin.rangeMin ?? "?"} ${bin.isMinInclusive ? "≤" : "<"} x ${bin.isMaxInclusive ? "≤" : "<"} ${bin.rangeMax ?? "?"}`
                }
              </div>
              {!bin.isValid && (
                <div className="text-xs text-destructive">{bin.validationError}</div>
              )}
            </div>
            <div
              {...listeners}
              className="cursor-grab hover:cursor-grabbing p-1 hover:bg-accent rounded"
              title="Drag to reorder rows"
            >
              <GripVertical className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-1">
              {renderBinConfigPopover(bin, 1)}
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeRow(bin.id)}
                disabled={data.dimension1Bins.length === 1}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </td>
        {children}
      </tr>
    )
  }

  // SortableColumnHeader component with stable key and no memo
  const SortableColumnHeader = ({ bin }: { bin: DimensionBin }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: bin.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    }

    return (
      <th
        ref={setNodeRef}
        style={style}
        className={cn("border border-border p-2 bg-muted font-medium text-center min-w-32", isDragging && "opacity-50")}
        {...attributes}
      >
        <div className="space-y-1">
          {editingBinId === bin.id ? (
            <Input
              value={bin.label}
              onChange={(e) => updateBin(2, bin.id, { label: e.target.value })}
              onBlur={() => setEditingBinId(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setEditingBinId(null)
                }
              }}
              className="h-6 text-sm font-medium text-center"
              autoFocus
            />
          ) : (
            <div 
              className="font-medium cursor-pointer hover:bg-accent px-1 py-0.5 rounded"
              onClick={() => setEditingBinId(bin.id)}
              title="Click to edit label"
            >
              {bin.label}
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            {bin.binType === "exact" 
              ? `= ${bin.exactValue || "Not set"}` 
              : `${bin.rangeMin ?? "?"} ${bin.isMinInclusive ? "≤" : "<"} x ${bin.isMaxInclusive ? "≤" : "<"} ${bin.rangeMax ?? "?"}`
            }
          </div>
          {!bin.isValid && (
            <div className="text-xs text-destructive">{bin.validationError}</div>
          )}
          <div className="flex items-center justify-center gap-1">
            <div
              {...listeners}
              className="cursor-grab hover:cursor-grabbing p-1 hover:bg-accent rounded"
              title="Drag to reorder columns"
            >
              <GripHorizontal className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-1">
              {renderBinConfigPopover(bin, 2)}
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeColumn(bin.id)}
                disabled={data.dimension2Bins.length === 1}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </th>
    )
  }

  return (
    <div className="space-y-6">
     
      {/* Save Button and Errors */}
      <div className="flex items-center justify-between">
        <div></div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={isLoading || (hasChanges !== undefined && !hasChanges)}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
      {Object.keys(formErrors).length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            Please fix the following errors before saving:
            <ul className="list-disc list-inside mt-2">
              {Object.entries(formErrors).map(([field, error]) => (
                <li key={field}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}



      {/* Matrix Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lookup Table</CardTitle>
              <CardDescription>
                Configure your matrix by adding rows and columns, then fill in the values
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={addRow}>
                <Plus className="h-4 w-4 mr-2" />
                Add Row
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addColumn}
                disabled={!data.inputVariable2}
                title={!data.inputVariable2 ? "Select a Secondary Dimension Variable above to enable adding dimension bins" : "Add a new dimension bin"}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Dimension Bin
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={is2D ? handleColumnDragEnd : handleRowDragEnd}
            >
              <table className="w-full border-collapse border border-border">
                <thead>
                  {/* Secondary Variable Header - spans all bin columns */}
                  {is2D && data.inputVariable2 && (
                    <tr>
                      <th className="border border-border p-2 bg-background font-medium text-left min-w-48">
                        <div className="font-medium">{data.inputVariable1.name}</div>
                        <div className="text-xs text-muted-foreground">({data.inputVariable1.dataType})</div>
                      </th>
                      <th 
                        className="border border-border p-2 bg-secondary/50 font-medium text-center" 
                        colSpan={data.dimension2Bins.length}
                      >
                        <div className="font-medium">{data.inputVariable2.name}</div>
                        <div className="text-xs text-muted-foreground">({data.inputVariable2.dataType}) - Dimension Bins</div>
                      </th>
                    </tr>
                  )}
                  <tr>
                    {!is2D && (
                      <th className="border border-border p-2 bg-muted font-medium text-left min-w-48">
                        <div className="font-medium">{data.inputVariable1.name}</div>
                        <div className="text-xs text-muted-foreground">({data.inputVariable1.dataType})</div>
                      </th>
                    )}
                    {is2D && (
                      <th className="border border-border p-2 bg-muted font-medium text-left min-w-48">
                        <div className="font-medium">Rows</div>
                        <div className="text-xs text-muted-foreground">Primary Dimension</div>
                      </th>
                    )}
                    {is2D ? (
                      <SortableContext items={data.dimension2Bins.map(bin => bin.id)} strategy={horizontalListSortingStrategy}>
                        {data.dimension2Bins.map((bin) => (
                          <SortableColumnHeader key={bin.id} bin={bin} />
                        ))}
                      </SortableContext>
                    ) : (
                      <th className="border border-border p-2 bg-muted font-medium text-center min-w-32">
                        <div className="font-medium">{data.outputVariable.name}</div>
                        <div className="text-xs text-muted-foreground">({data.outputVariable.dataType})</div>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  <SortableContext items={data.dimension1Bins.map(bin => bin.id)} strategy={verticalListSortingStrategy}>
                    {data.dimension1Bins.map((row1Bin) => (
                      <SortableRow key={row1Bin.id} bin={row1Bin}>
                        {is2D ? (
                          data.dimension2Bins.map((row2Bin) => {
                            const cellValidation = getCellValidation(row1Bin.id, row2Bin.id)
                            return (
                              <td key={row2Bin.id} className="border border-border p-1">
                                <Input
                                  value={getCellValue(row1Bin.id, row2Bin.id)}
                                  onChange={e => updateCell(row1Bin.id, row2Bin.id, e.target.value)}
                                  placeholder="Value"
                                  className={cn(
                                    "border-0 text-center",
                                    !cellValidation.isValid && "border-destructive bg-destructive/10"
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
                              onChange={e => updateCell(row1Bin.id, null, e.target.value)}
                              placeholder="Value"
                              className="border-0 text-center"
                            />
                          </td>
                        )}
                      </SortableRow>
                    ))}
                  </SortableContext>
                </tbody>
              </table>
            </DndContext>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
