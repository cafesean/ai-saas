'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Settings, Save, Eye, EyeOff } from 'lucide-react';

// --- Type Definitions ---

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
  uuid:string;
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


// --- Refactored Child Components ---

const DimensionBinItem = function BinItem({
  bin,
  onUpdate,
  onRemove,
}: {
  bin: DimensionBin;
  onUpdate: (binUuid: string, updates: Partial<DimensionBin>) => void;
  onRemove: (binUuid: string) => void;
}) {
  // FOCUS FIX: Simple direct onChange handlers without memoization like TemplateForm.tsx
  return (
    <div className="flex items-center gap-2 p-2 border rounded">
      <Input
        value={bin.label}
        onChange={(e) => onUpdate(bin.uuid, { label: e.target.value })}
        placeholder="Bin label"
        className="flex-1"
      />
      <Select
        value={bin.binType}
        onValueChange={(value) => onUpdate(bin.uuid, { binType: value as 'exact' | 'range' })}
      >
        <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="exact">Exact</SelectItem>
          <SelectItem value="range">Range</SelectItem>
        </SelectContent>
      </Select>
      {bin.binType === 'exact' ? (
        <Input
          value={bin.exactValue || ''}
          onChange={(e) => onUpdate(bin.uuid, { exactValue: e.target.value })}
          placeholder="Value"
          className="w-32"
        />
      ) : (
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={bin.rangeMin ?? ''}
            onChange={(e) => onUpdate(bin.uuid, { rangeMin: e.target.value ? parseFloat(e.target.value) : undefined })}
            placeholder="Min" className="w-20"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <Input
            type="number"
            value={bin.rangeMax ?? ''}
            onChange={(e) => onUpdate(bin.uuid, { rangeMax: e.target.value ? parseFloat(e.target.value) : undefined })}
            placeholder="Max" className="w-20"
          />
        </div>
      )}
      <Button variant="outline" size="sm" onClick={() => onRemove(bin.uuid)} className="text-red-500 hover:text-red-700">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Removed MatrixCellEditor - just use Input directly like TemplateForm.tsx pattern


// --- Main Editor Component ---

export function LookupTableEditor({
  lookupTable,
  variables,
  onSave,
  onCancel,
  isEditing = false,
}: LookupTableEditorProps) {
  const [formData, setFormData] = useState<LookupTableData>(
    lookupTable || {
      id: 0, uuid: '', name: '', description: '', outputVariableId: 0,
      inputVariable1Id: 0, inputVariable2Id: undefined, status: 'draft',
      version: 1, dimensionBins: [], cells: [],
    }
  );

  const [matrixMode, setMatrixMode] = useState<'1D' | '2D'>(formData.inputVariable2Id ? '2D' : '1D');
  const [isSaving, setIsSaving] = useState(false);

  const dimension1Bins = useMemo(() => formData.dimensionBins.filter(bin => bin.dimension === 1).sort((a, b) => a.binIndex - b.binIndex), [formData.dimensionBins]);
  const dimension2Bins = useMemo(() => formData.dimensionBins.filter(bin => bin.dimension === 2).sort((a, b) => a.binIndex - b.binIndex), [formData.dimensionBins]);
  
  const binMap = useMemo(() => new Map(formData.dimensionBins.map(bin => [bin.uuid, bin])), [formData.dimensionBins]);
  
  const outputVariable = useMemo(() => variables.find(v => v.id === formData.outputVariableId), [variables, formData.outputVariableId]);
  const inputVariable1 = useMemo(() => variables.find(v => v.id === formData.inputVariable1Id), [variables, formData.inputVariable1Id]);
  const inputVariable2 = useMemo(() => formData.inputVariable2Id ? variables.find(v => v.id === formData.inputVariable2Id) : undefined, [variables, formData.inputVariable2Id]);

  // FOCUS FIX: Use TemplateForm.tsx pattern for form field changes without memoization
  const handleFormFieldChange = (e: any, field: string) => {
    let value = e.value || e.target?.value;
    
    // Handle number conversions for variable IDs
    if (field.includes('VariableId')) {
      value = value ? parseInt(value) : 0;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addDimensionBin = (dimension: number) => {
    setFormData(prev => {
      const newBin: DimensionBin = {
        id: -Date.now(), // Temporary ID for new bins, negative to avoid conflicts
        uuid: crypto.randomUUID(),
        dimension,
        binIndex: prev.dimensionBins.filter(bin => bin.dimension === dimension).length,
        label: `Bin ${prev.dimensionBins.filter(bin => bin.dimension === dimension).length + 1}`,
        binType: 'exact',
        exactValue: '',
      };
      return { ...prev, dimensionBins: [...prev.dimensionBins, newBin] };
    });
  };

  // FIX 1: Make bin update safer to prevent DB errors
  const updateDimensionBin = (binUuid: string, updates: Partial<DimensionBin>) => {
    setFormData(prev => ({
      ...prev,
      dimensionBins: prev.dimensionBins.map(bin =>
        bin.uuid === binUuid
          ? { ...bin, ...updates, dimension: bin.dimension } // Safeguard: always preserve original dimension
          : bin
      ),
    }));
  };

  const removeDimensionBin = (binUuid: string) => {
    setFormData(prev => {
      const binToRemove = prev.dimensionBins.find(b => b.uuid === binUuid);
      if (!binToRemove) return prev;
      return {
        ...prev,
        dimensionBins: prev.dimensionBins.filter(bin => bin.uuid !== binUuid),
        cells: prev.cells.filter(cell => cell.row1BinId !== binToRemove.id && cell.row2BinId !== binToRemove.id),
      };
    });
  };

  // Create a stable cell value map to avoid recalculations
  const cellValueMap = useMemo(() => {
    const map = new Map<string, string>();
    formData.cells.forEach(cell => {
      const rowBin = formData.dimensionBins.find(b => b.id === cell.row1BinId);
      const colBin = cell.row2BinId ? formData.dimensionBins.find(b => b.id === cell.row2BinId) : undefined;
      if (rowBin) {
        const key = colBin ? `${rowBin.uuid}-${colBin.uuid}` : rowBin.uuid;
        map.set(key, cell.outputValue);
      }
    });
    return map;
  }, [formData.cells, formData.dimensionBins]);

  const getCellValue = (rowBinUuid: string, colBinUuid?: string) => {
    const key = colBinUuid ? `${rowBinUuid}-${colBinUuid}` : rowBinUuid;
    return cellValueMap.get(key) || '';
  };
  
  // FOCUS FIX: Simple direct state update like TemplateForm.tsx pattern
  const updateCellValue = (rowBinUuid: string, colBinUuid: string | undefined, newValue: string) => {
    setFormData(prev => {
      const rowBin = prev.dimensionBins.find(b => b.uuid === rowBinUuid);
      const colBin = colBinUuid ? prev.dimensionBins.find(b => b.uuid === colBinUuid) : undefined;
      
      if (!rowBin) return prev;
      if (colBinUuid && !colBin) return prev;

      const row1BinId = rowBin.id;
      const row2BinId = colBin ? colBin.id : undefined;

      // Find existing cell index
      const existingCellIndex = prev.cells.findIndex(c => c.row1BinId === row1BinId && c.row2BinId === row2BinId);
      
      // Create new cells array with minimal changes
      let updatedCells: MatrixCell[];
      
      if (existingCellIndex > -1) {
        // Update existing cell
        updatedCells = prev.cells.map((cell, index) => 
          index === existingCellIndex 
            ? { ...cell, outputValue: newValue }
            : cell
        );
      } else {
        // Add new cell
        const newCell: MatrixCell = {
          id: -Date.now(),
          uuid: crypto.randomUUID(),
          row1BinId,
          row2BinId,
          outputValue: newValue,
        };
        updatedCells = [...prev.cells, newCell];
      }
      
      return { ...prev, cells: updatedCells };
    });
  };

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

  return (
    <div className="space-y-6">
      {/* Header and Basic Configuration are unchanged */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{isEditing ? 'Edit Lookup Table' : 'Create Lookup Table'}</h2>
          <p className="text-muted-foreground">Configure matrix-based decision lookup tables</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={formData.status === 'published' ? 'default' : 'secondary'}>{formData.status}</Badge>
        </div>
      </div>
      
      <Card>
        <CardHeader><CardTitle>Basic Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Table Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleFormFieldChange(e.target, 'name')} placeholder="Enter table name" />
            </div>
            <div>
              <Label htmlFor="mode">Matrix Mode</Label>
              <Select value={matrixMode} onValueChange={(v: '1D' | '2D') => setMatrixMode(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1D">1D (Single Input)</SelectItem>
                  <SelectItem value="2D">2D (Two Inputs)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={formData.description || ''} onChange={(e) => handleFormFieldChange(e.target, 'description')} placeholder="Optional description"/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="inputVar1">Input Variable 1</Label>
              <Select value={String(formData.inputVariable1Id)} onValueChange={(v) => handleFormFieldChange({ value: v }, 'inputVariable1Id')}>
                <SelectTrigger><SelectValue placeholder="Select variable" /></SelectTrigger>
                <SelectContent>{variables.map(v => <SelectItem key={v.id} value={String(v.id)}>{v.name} ({v.dataType})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {matrixMode === '2D' && (
              <div>
                <Label htmlFor="inputVar2">Input Variable 2</Label>
                <Select value={String(formData.inputVariable2Id || '')} onValueChange={(v) => handleFormFieldChange({ value: v }, 'inputVariable2Id')}>
                  <SelectTrigger><SelectValue placeholder="Select variable" /></SelectTrigger>
                  <SelectContent>{variables.map(v => <SelectItem key={v.id} value={String(v.id)}>{v.name} ({v.dataType})</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="outputVar">Output Variable</Label>
              <Select value={String(formData.outputVariableId)} onValueChange={(v) => handleFormFieldChange({ value: v }, 'outputVariableId')}>
                <SelectTrigger><SelectValue placeholder="Select variable" /></SelectTrigger>
                <SelectContent>{variables.map(v => <SelectItem key={v.id} value={String(v.id)}>{v.name} ({v.dataType})</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Dimension 1 - {inputVariable1?.name || 'Rows'}</CardTitle>
            <Button variant="outline" size="sm" onClick={() => addDimensionBin(1)}><Plus className="h-4 w-4 mr-2" />Add Bin</Button>
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
            {/* FIX 3: Use stable `uuid` for the key prop */}
            {dimension1Bins.map(bin => <DimensionBinItem key={bin.uuid} bin={bin} onUpdate={updateDimensionBin} onRemove={removeDimensionBin} />)}
            {dimension1Bins.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No bins configured.</p>}
          </CardContent>
        </Card>
        {matrixMode === '2D' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">Dimension 2 - {inputVariable2?.name || 'Columns'}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => addDimensionBin(2)}><Plus className="h-4 w-4 mr-2" />Add Bin</Button>
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
              {/* FIX 3: Use stable `uuid` for the key prop */}
              {dimension2Bins.map(bin => <DimensionBinItem key={bin.uuid} bin={bin} onUpdate={updateDimensionBin} onRemove={removeDimensionBin} />)}
              {dimension2Bins.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No bins configured.</p>}
            </CardContent>
          </Card>
        )}
      </div>

      {dimension1Bins.length > 0 && (matrixMode === '1D' || dimension2Bins.length > 0) && (
        <Card>
          <CardHeader><CardTitle>Matrix Values - Output: {outputVariable?.name || 'Output'}</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 bg-muted font-medium text-left">{matrixMode === '2D' ? `${inputVariable1?.name || ''} \\ ${inputVariable2?.name || ''}` : (inputVariable1?.name || '')}</th>
                    {matrixMode === '2D'
                      /* FIX 3: Use stable `uuid` for the key prop */
                      ? dimension2Bins.map(colBin => <th key={colBin.uuid} className="border p-2 bg-muted font-medium text-center min-w-[120px]">{colBin.label}</th>)
                      : <th className="border p-2 bg-muted font-medium text-center">{outputVariable?.name || 'Output'}</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  {/* FIX 3: Use stable `uuid` for the key prop */}
                  {dimension1Bins.map(rowBin => (
                    <tr key={rowBin.uuid}>
                      <td className="border p-2 bg-muted font-medium">{rowBin.label}</td>
                      {matrixMode === '2D' ? (
                        dimension2Bins.map(colBin => (
                          /* FIX 3: Use stable composite `uuid` for the key prop */
                          <td key={`${rowBin.uuid}-${colBin.uuid}`} className="border p-1">
                            <Input
                              value={getCellValue(rowBin.uuid, colBin.uuid)}
                              onChange={(e) => updateCellValue(rowBin.uuid, colBin.uuid, e.target.value)}
                              className="border-0 text-center"
                            />
                          </td>
                        ))
                      ) : (
                        <td className="border p-1">
                          <Input
                            value={getCellValue(rowBin.uuid)}
                            onChange={(e) => updateCellValue(rowBin.uuid, undefined, e.target.value)}
                            className="border-0 text-center"
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

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <><Settings className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Save Table</>}
        </Button>
      </div>
    </div>
  );
}