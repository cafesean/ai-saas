"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { LookupTableEditor } from "../../components/lookup-table-editor"
import { api } from "@/utils/trpc"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { backendToFrontend, frontendToBackend } from "../../lib/data-transformers"

export default function EditLookupTablePage({ params }: { params: Promise<{ uuid: string }> }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { uuid } = use(params)

  // Fetch lookup table from API
  const {
    data: lookupTable,
    isLoading: isFetching,
    error,
    refetch,
  } = api.newLookupTable.getByUuid.useQuery({ uuid })

  // Update mutation
  const updateMutation = api.newLookupTable.update.useMutation({
    onSuccess: () => {
      router.push(`/decisioning/lookup-tables/${uuid}`)
    },
    onError: (error) => {
      console.error("Failed to update lookup table:", error)
      setIsLoading(false)
    },
  })

  const handleSave = async (data: any) => {
    if (!lookupTable) return
    
    setIsLoading(true)
    try {
      // Convert frontend data to backend format
      const backendData = frontendToBackend(data)
      
      await updateMutation.mutateAsync({
        id: lookupTable.id,
        ...backendData,
      })
    } catch (error) {
      console.error("Failed to save lookup table:", error)
      setIsLoading(false)
    }
  }

  const handleTest = (data: any) => {
    console.log("Testing lookup table:", data)
    // Test logic would go here
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load lookup table: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isFetching) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading lookup table...</span>
        </div>
      </div>
    )
  }

  if (!lookupTable) {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Lookup table not found
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Convert backend data to frontend format for editing
  const frontendData = backendToFrontend({
    ...lookupTable,
    description: lookupTable.description || undefined
  })

  return (
    <div className="container mx-auto py-6">
      <LookupTableEditor
        initialData={frontendData}
        onSave={handleSave}
        onTest={handleTest}
        isLoading={isLoading}
      />
    </div>
  )
}
