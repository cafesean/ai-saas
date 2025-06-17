// Data transformation utilities for lookup tables
// Converts between frontend LookupTableEditor format and backend N-dimensional format

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

export interface LookupTableData {
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

interface BackendLookupTableInput {
  name: string
  description?: string
  outputVariableId: number
  inputVariable1Id: number
  inputVariable2Id?: number
  dimensionBins: Array<{
    dimension: number
    binIndex: number
    label: string
    binType: "exact" | "range"
    exactValue?: string
    rangeMin?: number
    rangeMax?: number
    isMinInclusive?: boolean
    isMaxInclusive?: boolean
  }>
  cells: Array<{
    row1BinIndex: number
    row2BinIndex?: number
    outputValue: string
  }>
}

export interface BackendLookupTableOutput {
  id: number
  uuid: string
  name: string
  description?: string
  status: string
  version: number
  createdAt: Date
  updatedAt: Date
  createdBy: number
  updatedBy: number
  inputs: Array<{
    id: number
    variableId: number
    dimensionOrder: number
    variable: { id: number; name: string; dataType: string }
  }>
  outputs: Array<{
    id: number
    variableId: number
    outputOrder: number
    variable: { id: number; name: string; dataType: string }
  }>
  dimensionBins: Array<{
    id: number
    dimensionOrder: number
    binIndex: number
    label: string
    binType: string
    exactValue?: string | null
    rangeMin?: string | null
    rangeMax?: string | null
    isMinInclusive?: boolean | null
    isMaxInclusive?: boolean | null
  }>
  cells: Array<{
    id: number
    inputCoordinates: Record<string, number>
    outputValues: Record<string, any>
  }>
}

/**
 * Converts frontend LookupTableData to backend input format
 */
export function frontendToBackend(data: LookupTableData): BackendLookupTableInput {
  // Convert dimension bins
  const dimensionBins: BackendLookupTableInput['dimensionBins'] = []
  
  // Add dimension 1 bins
  data.dimension1Bins.forEach((bin, index) => {
    dimensionBins.push({
      dimension: 1, // Keep for backward compatibility
      binIndex: index,
      label: bin.label,
      binType: bin.binType,
      exactValue: bin.binType === 'exact' ? (bin.exactValue || '') : undefined,
      rangeMin: bin.binType === 'range' ? bin.rangeMin : undefined,
      rangeMax: bin.binType === 'range' ? bin.rangeMax : undefined,
      isMinInclusive: bin.isMinInclusive ?? true,
      isMaxInclusive: bin.isMaxInclusive ?? false,
    })
  })

  // Add dimension 2 bins if they exist
  data.dimension2Bins.forEach((bin, index) => {
    dimensionBins.push({
      dimension: 2, // Keep for backward compatibility
      binIndex: index,
      label: bin.label,
      binType: bin.binType,
      exactValue: bin.binType === 'exact' ? (bin.exactValue || '') : undefined,
      rangeMin: bin.binType === 'range' ? bin.rangeMin : undefined,
      rangeMax: bin.binType === 'range' ? bin.rangeMax : undefined,
      isMinInclusive: bin.isMinInclusive ?? true,
      isMaxInclusive: bin.isMaxInclusive ?? false,
    })
  })

  // Convert cells
  const cells: BackendLookupTableInput['cells'] = []
  Object.entries(data.cells).forEach(([cellKey, value]) => {
    if (data.inputVariable2 && data.dimension2Bins.length > 0) {
      // 2D mode: cellKey format is "row1BinId-row2BinId"
      const [row1Id, row2Id] = cellKey.split('-')
      const row1BinIndex = data.dimension1Bins.findIndex(bin => bin.id === row1Id)
      const row2BinIndex = data.dimension2Bins.findIndex(bin => bin.id === row2Id)
      
      if (row1BinIndex >= 0 && row2BinIndex >= 0) {
        cells.push({
          row1BinIndex,
          row2BinIndex,
          outputValue: value,
        })
      }
    } else {
      // 1D mode: cellKey is just the row1BinId
      const row1BinIndex = data.dimension1Bins.findIndex(bin => bin.id === cellKey)
      
      if (row1BinIndex >= 0) {
        cells.push({
          row1BinIndex,
          outputValue: value,
        })
      }
    }
  })

  return {
    name: data.name,
    description: data.description,
    outputVariableId: data.outputVariable.id,
    inputVariable1Id: data.inputVariable1.id,
    inputVariable2Id: data.inputVariable2?.id,
    dimensionBins,
    cells,
  }
}

/**
 * Converts backend output format to frontend LookupTableData
 */
export function backendToFrontend(backendData: BackendLookupTableOutput): LookupTableData {
  // Extract input variables
  const sortedInputs = backendData.inputs.sort((a, b) => a.dimensionOrder - b.dimensionOrder)
  const inputVariable1 = sortedInputs[0]?.variable
  const inputVariable2 = sortedInputs[1]?.variable

  // Extract output variable
  const outputVariable = backendData.outputs.sort((a, b) => a.outputOrder - b.outputOrder)[0]?.variable

  if (!inputVariable1 || !outputVariable) {
    throw new Error('Invalid lookup table data: missing required variables')
  }

  // Group dimension bins by dimension
  const dimension1Bins: DimensionBin[] = []
  const dimension2Bins: DimensionBin[] = []

  backendData.dimensionBins
    .sort((a, b) => a.dimensionOrder - b.dimensionOrder || a.binIndex - b.binIndex)
    .forEach((bin) => {
      const dimensionBin: DimensionBin = {
        id: bin.id.toString(),
        label: bin.label,
        binType: bin.binType as "exact" | "range",
        exactValue: bin.exactValue ?? undefined,
        rangeMin: bin.rangeMin ? parseFloat(bin.rangeMin) : undefined,
        rangeMax: bin.rangeMax ? parseFloat(bin.rangeMax) : undefined,
        isMinInclusive: bin.isMinInclusive ?? undefined,
        isMaxInclusive: bin.isMaxInclusive ?? undefined,
        isValid: true,
      }

      if (bin.dimensionOrder === 1) {
        dimension1Bins.push(dimensionBin)
      } else if (bin.dimensionOrder === 2) {
        dimension2Bins.push(dimensionBin)
      }
    })

  // Convert cells back to frontend format
  const cells: Record<string, string> = {}
  
  backendData.cells.forEach((cell) => {
    const coordinates = cell.inputCoordinates
    const outputValue = cell.outputValues["1"] || ""

    if (inputVariable2 && dimension2Bins.length > 0) {
      // 2D mode: create cellKey as "row1BinId-row2BinId"
      const row1BinId = coordinates["1"]
      const row2BinId = coordinates["2"]
      
      if (row1BinId && row2BinId) {
        const cellKey = `${row1BinId}-${row2BinId}`
        cells[cellKey] = outputValue.toString()
      }
    } else {
      // 1D mode: cellKey is just the row1BinId
      const row1BinId = coordinates["1"]
      
      if (row1BinId) {
        cells[row1BinId.toString()] = outputValue.toString()
      }
    }
  })

  return {
    id: backendData.id,
    name: backendData.name,
    description: backendData.description || "",
    inputVariable1,
    inputVariable2,
    outputVariable,
    dimension1Bins,
    dimension2Bins,
    cells,
    status: backendData.status as "draft" | "published" | "deprecated",
  }
}

/**
 * Creates a minimal lookup table data structure for new tables
 */
export function createEmptyLookupTable(
  inputVariable1: { id: number; name: string; dataType: string },
  outputVariable: { id: number; name: string; dataType: string },
  inputVariable2?: { id: number; name: string; dataType: string }
): LookupTableData {
  return {
    name: "",
    description: "",
    inputVariable1,
    inputVariable2,
    outputVariable,
    dimension1Bins: [
      {
        id: "row-1",
        label: "Row 1",
        binType: inputVariable1.dataType === "number" ? "range" : "exact",
        exactValue: inputVariable1.dataType === "string" ? "" : inputVariable1.dataType === "number" ? "" : "",
        rangeMin: inputVariable1.dataType === "number" ? 0 : undefined,
        rangeMax: inputVariable1.dataType === "number" ? 100 : undefined,
        isMinInclusive: true,
        isMaxInclusive: false,
        isValid: false,
        validationError: "Configuration required",
      },
    ],
    dimension2Bins: [],
    cells: {},
    status: "draft",
  }
} 