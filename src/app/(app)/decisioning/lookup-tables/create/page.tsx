'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api } from '@/utils/trpc';

export default function CreateLookupTablePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Fetch variables for dropdowns
  const {
    data: variables,
    isLoading: isLoadingVariables,
    error: variablesError,
  } = api.variable.getAll.useQuery();

  // Create mutation
  const createMutation = api.lookupTable.create.useMutation({
    onSuccess: (result) => {
      router.push(`/decisioning/lookup-tables/${result.uuid}`);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSave = async (data: any) => {
    try {
      setError(null);
      await createMutation.mutateAsync({
        name: data.name,
        description: data.description,
        outputVariableId: data.outputVariableId,
        inputVariable1Id: data.inputVariable1Id,
        inputVariable2Id: data.inputVariable2Id,
        dimensionBins: data.dimensionBins || [],
        cells: data.cells || [],
      });
    } catch (error) {
      // Error handled by onError
    }
  };

  const handleCancel = () => {
    router.push('/decisioning/lookup-tables');
  };

  if (isLoadingVariables) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Create Lookup Table</h1>
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

  if (variablesError) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Create Lookup Table</h1>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {variablesError?.message || 'Failed to load variables'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!variables || variables.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Create Lookup Table</h1>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No variables found. Please create variables first before creating lookup tables.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Lookup Table</h1>
          <p className="text-muted-foreground">
            Configure a new matrix-based decision lookup table
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">
            Matrix editor implementation in progress. 
            Basic functionality will be available once the editor component is completed.
          </p>
          <div className="flex justify-center mt-4">
            <Button onClick={handleCancel}>
              Back to Lookup Tables
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 