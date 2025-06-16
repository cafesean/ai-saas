'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Settings, Save, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface DimensionBin {
  id: number;
  uuid: string;
  dimension: number;
  binIndex: number;
  label: string;
  binType: 'exact' | 'range';
  exactValue?: string;
  rangeMin?: number;
  rangeMax?: number;
  isMinInclusive?: boolean;
  isMaxInclusive?: boolean;
}

interface MatrixCell {
  id: number;
  uuid: string;
  row1BinId: number;
  row2BinId?: number;
  outputValue: string;
}

interface LookupTableData {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  outputVariableId: number;
  inputVariable1Id: number;
  inputVariable2Id?: number;
  status: string;
  version: number;
  dimensionBins: DimensionBin[];
  cells: MatrixCell[];
}

interface Variable {
  id: number;
  name: string;
  logicType: string;
  dataType: string;
}

interface LookupTableEditorProps {
  lookupTable?: LookupTableData;
  variables: Variable[];
  onSave: (data: LookupTableData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export function LookupTableEditor({
  lookupTable,
  variables,
  onSave,
  onCancel,
  isEditing = false
}: LookupTableEditorProps) {
  const [formData, setFormData] = useState<LookupTableData>(
    lookupTable || {
      id: 0,
      uuid: '',
      name: '',
      description: '',
      outputVariableId: 0,
      inputVariable1Id: 0,
      inputVariable2Id: undefined,
      status: 'draft',
      version: 1,
      dimensionBins: [],
      cells: [],
    }
  );

  const [matrixMode, setMatrixMode] = useState<'1D' | '2D'>(
    formData.inputVariable2Id ? '2D' : '1D'
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get dimension bins separated by dimension
  const dimension1Bins = useMemo(() => 
    formData.dimensionBins.filter(bin => bin.dimension === 1).sort((a, b) => a.binIndex - b.binIndex),
    [formData.dimensionBins]
  );

  const dimension2Bins = useMemo(() => 
    formData.dimensionBins.filter(bin => bin.dimension === 2).sort((a, b) => a.binIndex - b.binIndex),
    [formData.dimensionBins]
  );

  // Get output variable details  
  const outputVariable = useMemo(() => 
    variables.find(v => v.id === formData.outputVariableId),
    [variables, formData.outputVariableId]
  );

  const inputVariable1 = useMemo(() => 
    variables.find(v => v.id === formData.inputVariable1Id),
    [variables, formData.inputVariable1Id]
  );

  const inputVariable2 = useMemo(() => 
    formData.inputVariable2Id ? variables.find(v => v.id === formData.inputVariable2Id) : undefined,
    [variables, formData.inputVariable2Id]
  );

  // Handle mode switch
  const handleModeSwitch = useCallback((mode: '1D' | '2D') => {
    setMatrixMode(mode);
    setFormData(prev => ({
      ...prev,
      inputVariable2Id: mode === '2D' ? (prev.inputVariable2Id || 0) : undefined,
      dimensionBins: mode === '1D' ? prev.dimensionBins.filter(bin => bin.dimension === 1) : prev.dimensionBins,
      cells: mode === '1D' ? prev.cells.map(cell => ({ ...cell, row2BinId: undefined })) : prev.cells,
    }));
  }, []);

  // Add dimension bin
  const addDimensionBin = useCallback((dimension: number) => {
    const newBin: DimensionBin = {
      id: Date.now(), // Temporary ID for new bins
      uuid: crypto.randomUUID(),
      dimension,
      binIndex: formData.dimensionBins.filter(bin => bin.dimension === dimension).length,
      label: `Bin ${formData.dimensionBins.filter(bin => bin.dimension === dimension).length + 1}`,
      binType: 'exact',
      exactValue: '',
    };

    setFormData(prev => ({
      ...prev,
      dimensionBins: [...prev.dimensionBins, newBin],
    }));
  }, [formData.dimensionBins]);

  // Update dimension bin
  const updateDimensionBin = useCallback((binId: number, updates: Partial<DimensionBin>) => {
    setFormData(prev => ({
      ...prev,
      dimensionBins: prev.dimensionBins.map(bin => 
        bin.id === binId ? { ...bin, ...updates } : bin
      ),
    }));
  }, []);

  // Remove dimension bin
  const removeDimensionBin = useCallback((binId: number) => {
    setFormData(prev => ({
      ...prev,
      dimensionBins: prev.dimensionBins.filter(bin => bin.id !== binId),
      cells: prev.cells.filter(cell => cell.row1BinId !== binId && cell.row2BinId !== binId),
    }));
  }, []);

  // Get or create cell for intersection
  const getCellValue = useCallback((row1BinId: number, row2BinId?: number) => {
    const cell = formData.cells.find(c => 
      c.row1BinId === row1BinId && c.row2BinId === row2BinId
    );
    return cell?.outputValue || '';
  }, [formData.cells]);

  // Update cell value
  const updateCellValue = useCallback((row1BinId: number, row2BinId: number | undefined, value: string) => {
    setFormData(prev => {
      const existingCellIndex = prev.cells.findIndex(c => 
        c.row1BinId === row1BinId && c.row2BinId === row2BinId
      );

      if (existingCellIndex >= 0) {
        // Update existing cell
        const updatedCells = [...prev.cells];
        updatedCells[existingCellIndex] = { ...updatedCells[existingCellIndex], outputValue: value };
        return { ...prev, cells: updatedCells };
      } else {
        // Create new cell
        const newCell: MatrixCell = {
          id: Date.now(),
          uuid: crypto.randomUUID(),
          row1BinId,
          row2BinId,
          outputValue: value,
        };
        return { ...prev, cells: [...prev.cells, newCell] };
      }
    });
  }, []);

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving lookup table:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Render dimension bin editor
  const renderDimensionBinEditor = (bin: DimensionBin) => (
    <div key={bin.id} className="flex items-center gap-2 p-2 border rounded">
      <Input
        value={bin.label}
        onChange={(e) => updateDimensionBin(bin.id, { label: e.target.value })}
        placeholder="Bin label"
        className="flex-1"
      />
      
      <Select
        value={bin.binType}
        onValueChange={(value: 'exact' | 'range') => 
          updateDimensionBin(bin.id, { binType: value })
        }
      >
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="exact">Exact</SelectItem>
          <SelectItem value="range">Range</SelectItem>
        </SelectContent>
      </Select>

      {bin.binType === 'exact' ? (
        <Input
          value={bin.exactValue || ''}
          onChange={(e) => updateDimensionBin(bin.id, { exactValue: e.target.value })}
          placeholder="Value"
          className="w-32"
        />
      ) : (
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={bin.rangeMin || ''}
            onChange={(e) => updateDimensionBin(bin.id, { rangeMin: parseFloat(e.target.value) })}
            placeholder="Min"
            className="w-20"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <Input
            type="number"
            value={bin.rangeMax || ''}
            onChange={(e) => updateDimensionBin(bin.id, { rangeMax: parseFloat(e.target.value) })}
            placeholder="Max"
            className="w-20"
          />
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => removeDimensionBin(bin.id)}
        className="text-red-500 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {isEditing ? 'Edit Lookup Table' : 'Create Lookup Table'}
          </h2>
          <p className="text-muted-foreground">
            Configure matrix-based decision lookup tables
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </Button>
          <Badge variant={formData.status === 'published' ? 'default' : 'secondary'}>
            {formData.status}
          </Badge>
        </div>
      </div>

      {/* Basic Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Table Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter table name"
              />
            </div>

            <div>
              <Label htmlFor="mode">Matrix Mode</Label>
              <Select value={matrixMode} onValueChange={(value: '1D' | '2D') => handleModeSwitch(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1D">1D (Single Input)</SelectItem>
                  <SelectItem value="2D">2D (Two Inputs)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="inputVar1">Input Variable 1</Label>
              <Select
                value={formData.inputVariable1Id.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, inputVariable1Id: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select variable" />
                </SelectTrigger>
                <SelectContent>
                  {variables.map(variable => (
                    <SelectItem key={variable.id} value={variable.id.toString()}>
                      {variable.name} ({variable.dataType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {matrixMode === '2D' && (
              <div>
                <Label htmlFor="inputVar2">Input Variable 2</Label>
                <Select
                  value={formData.inputVariable2Id?.toString() || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, inputVariable2Id: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select variable" />
                  </SelectTrigger>
                  <SelectContent>
                    {variables.map(variable => (
                      <SelectItem key={variable.id} value={variable.id.toString()}>
                        {variable.name} ({variable.dataType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="outputVar">Output Variable</Label>
              <Select
                value={formData.outputVariableId.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, outputVariableId: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select variable" />
                </SelectTrigger>
                <SelectContent>
                  {variables.map(variable => (
                    <SelectItem key={variable.id} value={variable.id.toString()}>
                      {variable.name} ({variable.dataType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dimension Configuration */}
      <div className="grid grid-cols-2 gap-6">
        {/* Dimension 1 (Rows) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">
              Dimension 1 - {inputVariable1?.name || 'Input Variable 1'}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addDimensionBin(1)}
            >
              <Plus className="h-4 w-4" />
              Add Bin
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {dimension1Bins.map(renderDimensionBinEditor)}
            {dimension1Bins.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No bins configured. Add a bin to get started.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Dimension 2 (Columns) - Only for 2D mode */}
        {matrixMode === '2D' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">
                Dimension 2 - {inputVariable2?.name || 'Input Variable 2'}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addDimensionBin(2)}
              >
                <Plus className="h-4 w-4" />
                Add Bin
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {dimension2Bins.map(renderDimensionBinEditor)}
              {dimension2Bins.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No bins configured. Add a bin to get started.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Matrix Editor */}
      {dimension1Bins.length > 0 && (matrixMode === '1D' || dimension2Bins.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>
              Matrix Values - Output: {outputVariable?.name || 'Output Variable'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 bg-muted font-medium text-left">
                      {inputVariable1?.name || 'Input 1'}
                      {matrixMode === '2D' && ` \\ ${inputVariable2?.name || 'Input 2'}`}
                    </th>
                    {matrixMode === '2D' ? (
                      dimension2Bins.map(colBin => (
                        <th key={colBin.id} className="border p-2 bg-muted font-medium text-center min-w-[120px]">
                          {colBin.label}
                        </th>
                      ))
                    ) : (
                      <th className="border p-2 bg-muted font-medium text-center">
                        {outputVariable?.name || 'Output'}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {dimension1Bins.map(rowBin => (
                    <tr key={rowBin.id}>
                      <td className="border p-2 bg-muted font-medium">
                        {rowBin.label}
                      </td>
                      {matrixMode === '2D' ? (
                        dimension2Bins.map(colBin => (
                          <td key={`${rowBin.id}-${colBin.id}`} className="border p-1">
                            <Input
                              value={getCellValue(rowBin.id, colBin.id)}
                              onChange={(e) => updateCellValue(rowBin.id, colBin.id, e.target.value)}
                              className="border-0 text-center"
                              placeholder="Value"
                            />
                          </td>
                        ))
                      ) : (
                        <td className="border p-1">
                          <Input
                            value={getCellValue(rowBin.id)}
                            onChange={(e) => updateCellValue(rowBin.id, undefined, e.target.value)}
                            className="border-0 text-center"
                            placeholder="Output value"
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
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Settings className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Table
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 