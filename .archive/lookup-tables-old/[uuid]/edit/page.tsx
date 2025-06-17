'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api } from '@/utils/trpc';
import { LookupTableEditor } from '../../components/LookupTableEditor';

export default function EditLookupTablePage() {
  const router = useRouter();
  const params = useParams();
  const uuid = params.uuid as string;

  const [error, setError] = useState<string | null>(null);

  // Fetch lookup table data
  const {
    data: lookupTable,
    isLoading: isLoadingTable,
    error: tableError,
  } = api.lookupTable.getByUuid.useQuery({ uuid });

  // Fetch variables for dropdowns
  const {
    data: variables,
    isLoading: isLoadingVariables,
    error: variablesError,
  } = api.variable.getAll.useQuery();

  // Update mutation
  const updateMutation = api.lookupTable.update.useMutation({
    onSuccess: () => {
      router.push(`/decisioning/lookup-tables/${uuid}`);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSave = async (data: any) => {
    try {
      setError(null);
      await updateMutation.mutateAsync({
        id: lookupTable.id,
        data: {
          name: data.name,
          description: data.description,
          outputVariableId: data.outputVariableId,
          inputVariable1Id: data.inputVariable1Id,
          inputVariable2Id: data.inputVariable2Id,
          dimensionBins: data.dimensionBins.map((bin: any) => ({
            dimension: bin.dimension,
            binIndex: bin.binIndex,
            label: bin.label,
            binType: bin.binType,
            exactValue: bin.binType === 'exact' ? (bin.exactValue || '') : undefined,
            rangeMin: bin.binType === 'range' ? bin.rangeMin : undefined,
            rangeMax: bin.binType === 'range' ? bin.rangeMax : undefined,
            isMinInclusive: bin.isMinInclusive ?? true,
            isMaxInclusive: bin.isMaxInclusive ?? false,
          })),
          cells: data.cells.map((cell: any) => ({
            row1BinId: cell.row1BinId,
            row2BinId: cell.row2BinId,
            outputValue: cell.outputValue,
          })),
        },
      });
    } catch (error) {
      // Error handled by onError
    }
  };

  const handleCancel = () => {
    router.push(`/decisioning/lookup-tables/${uuid}`);
  };

  if (isLoadingTable || isLoadingVariables) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Edit Lookup Table</h1>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tableError || variablesError) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Edit Lookup Table</h1>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {tableError?.message || variablesError?.message || 'Failed to load data'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!lookupTable || !variables) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Edit Lookup Table</h1>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Lookup table not found or variables not available
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Lookup Table</h1>
          <p className="text-muted-foreground">
            Modify the matrix configuration and values
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <LookupTableEditor
        lookupTable={lookupTable}
        variables={variables}
        onSave={handleSave}
        onCancel={handleCancel}
        isEditing={true}
      />
    </div>
  );
} 