"use client"

import { Label } from "@/components/ui/label"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, Play, Share, Download, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { api } from "@/utils/trpc"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { backendToFrontend } from "../lib/data-transformers"

export default function LookupTableDetailPage({ params }: { params: Promise<{ uuid: string }> }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const { uuid } = use(params)

  // Fetch lookup table from API
  const {
    data: lookupTable,
    isLoading,
    error,
    refetch,
  } = api.newLookupTable.getByUuid.useQuery({ uuid })

  // Delete mutation
  const deleteMutation = api.newLookupTable.delete.useMutation({
    onSuccess: () => {
      router.push("/decisioning/lookup-tables")
    },
    onError: (error) => {
      console.error("Failed to delete lookup table:", error)
    },
  })

  const handleDelete = async () => {
    if (!lookupTable) return
    if (confirm("Are you sure you want to delete this lookup table?")) {
      await deleteMutation.mutateAsync({ id: lookupTable.id })
    }
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
    if (!lookupTable) return null

    // For now, show a simple message until we have proper data
    if (!lookupTable.dimensionBins.length || !lookupTable.cells.length) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No matrix data configured yet
        </div>
      )
    }

    return (
      <div className="text-center py-8 text-muted-foreground">
        Matrix view will be available once data is properly configured
      </div>
    )
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

  if (isLoading) {
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{lookupTable.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getStatusColor(lookupTable.status)}>{lookupTable.status}</Badge>
              <Badge variant="outline">v{lookupTable.version}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Play className="h-4 w-4 mr-2" />
            Test
          </Button>
          <Button variant="outline" onClick={() => router.push(`/decisioning/lookup-tables/${uuid}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
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
              <DropdownMenuItem 
                className="text-red-600"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
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
                  <p className="text-muted-foreground">{lookupTable.description || "No description provided"}</p>
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
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(lookupTable.status)}>{lookupTable.status}</Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Version</Label>
                    <p className="text-sm text-muted-foreground mt-1">v{lookupTable.version}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(lookupTable.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Last Updated</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(lookupTable.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
              <CardDescription>Track changes and versions of this lookup table</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Version history feature coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
