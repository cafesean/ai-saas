"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LookupTableEditor } from "../components/lookup-table-editor"
import { frontendToBackend, createEmptyLookupTable, type LookupTableData } from "../lib/data-transformers"
import { api } from "@/utils/trpc"
import Breadcrumbs from "@/components/ui/Breadcrumbs"

// Remove mockVariables - will use real variables from API

export default function CreateLookupTablePage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  // Fetch variables for dropdowns
  const { data: variables, isLoading: isLoadingVariables, error: variablesError } = api.variable.getAll.useQuery()

  // Create mutation using the new lookup table router
  const createMutation = api.newLookupTable.create.useMutation({
    onSuccess: (result) => {
      router.push(`/decisioning/lookup-tables/${result.uuid}` as any)
    },
    onError: (error) => {
      setError(error.message)
    },
  })

  const handleSave = async (data: LookupTableData) => {
    try {
      setError(null)
      
      // Convert frontend data to backend format
      const backendData = frontendToBackend(data)
      
      // Call the API
      await createMutation.mutateAsync(backendData)
    } catch (error) {
      // Error handled by onError
      console.error('Failed to create lookup table:', error)
    }
  }

  const handleTest = (data: LookupTableData) => {
    console.log("Testing lookup table:", data)
    // TODO: Implement test functionality
  }

  if (isLoadingVariables) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Breadcrumbs
          items={[
            {
              label: "Back to Lookup Tables",
              link: "/decisioning/lookup-tables",
            },
          ]}
          title="Create Lookup Table"
          rightChildren={
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          }
        />
        <div className="flex-1 p-4 md:p-6">
          <Card>
            <CardContent className="py-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (variablesError) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Breadcrumbs
          items={[
            {
              label: "Back to Lookup Tables",
              link: "/decisioning/lookup-tables",
            },
          ]}
          title="Create Lookup Table"
          rightChildren={
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          }
        />
        <div className="flex-1 p-4 md:p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load variables
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!variables || variables.length === 0) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Breadcrumbs
          items={[
            {
              label: "Back to Lookup Tables",
              link: "/decisioning/lookup-tables",
            },
          ]}
          title="Create Lookup Table"
          rightChildren={
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          }
        />
        <div className="flex-1 p-4 md:p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No variables found. Please create variables first before creating lookup tables.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  // Create initial data for the editor
  const initialData = variables && variables.length >= 2 && variables[0] && variables[1] ? createEmptyLookupTable(
    { id: variables[0].id, name: variables[0].name, dataType: variables[0].dataType },
    { id: variables[1].id, name: variables[1].name, dataType: variables[1].dataType },
  ) : undefined

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Breadcrumbs
        items={[
          {
            label: "Back to Lookup Tables",
            link: "/decisioning/lookup-tables",
          },
        ]}
        title="Create Lookup Table"
        rightChildren={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />
      <div className="flex-1 p-4 md:p-6">
        <div className="space-y-1 mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Create Lookup Table</h2>
          <p className="text-muted-foreground">
            Configure a new matrix-based decision lookup table
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <LookupTableEditor
          initialData={initialData}
          onSave={handleSave}
          onTest={handleTest}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  )
} 