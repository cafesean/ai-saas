"use client"

import { useState } from "react"
import { Plus, Search, Filter, Grid, List, Eye, Edit, Trash2, Play, RefreshCw } from "lucide-react"
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
import { api } from "@/utils/trpc"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import Breadcrumbs from "@/components/ui/Breadcrumbs"

export default function LookupTablesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Fetch lookup tables from API
  const {
    data: lookupTables,
    isLoading,
    error,
    refetch,
  } = api.newLookupTable.list.useQuery({
    status: statusFilter === "all" ? undefined : (statusFilter as "draft" | "published" | "deprecated"),
    search: searchTerm || undefined,
  })

  // Delete mutation
  const deleteMutation = api.newLookupTable.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
    onError: (error) => {
      console.error("Failed to delete lookup table:", error)
    },
  })

  const filteredTables = lookupTables?.filter((table) => {
    if (!searchTerm) return true
    return (
      table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }) || []

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

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this lookup table?")) {
      await deleteMutation.mutateAsync({ id })
    }
  }

  const TableCard = ({ table }: { table: NonNullable<typeof lookupTables>[0] }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              <Link href={`/decisioning/lookup-tables/${table.uuid}`} className="hover:text-primary transition-colors">
                {table.name}
              </Link>
            </CardTitle>
            <CardDescription className="text-sm">{table.description}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                •••
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/decisioning/lookup-tables/${table.uuid}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/decisioning/lookup-tables/${table.uuid}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Play className="h-4 w-4 mr-2" />
                Test
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => handleDelete(table.id)}
                disabled={deleteMutation.isPending}
              >
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
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <div>
              <strong>Created:</strong> {new Date(table.createdAt).toLocaleDateString()}
            </div>
            <div>
              <strong>Updated:</strong> {new Date(table.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const TableRow = ({ table }: { table: NonNullable<typeof lookupTables>[0] }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="space-y-1">
              <Link href={`/decisioning/lookup-tables/${table.uuid}`} className="font-medium hover:text-primary transition-colors">
                {table.name}
              </Link>
              <p className="text-sm text-muted-foreground">{table.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(table.status)}>{table.status}</Badge>
            <Badge variant="outline">v{table.version}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  •••
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/decisioning/lookup-tables/${table.uuid}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/decisioning/lookup-tables/${table.uuid}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Play className="h-4 w-4 mr-2" />
                  Test
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => handleDelete(table.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (error) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Breadcrumbs
          items={[
            {
              label: "Back to Decisioning",
              link: "/decisioning",
            },
          ]}
          title="Lookup Tables"
          rightChildren={
            <>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button asChild>
                <Link href="/decisioning/lookup-tables/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Table
                </Link>
              </Button>
            </>
          }
        />
        <div className="flex-1 p-4 md:p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load lookup tables: {error.message}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Breadcrumbs
        items={[
          {
            label: "Back to Decisioning",
            link: "/decisioning",
          },
        ]}
        title="Lookup Tables"
        rightChildren={
          <>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button asChild>
              <Link href="/decisioning/lookup-tables/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Table
              </Link>
            </Button>
          </>
        }
      />

      <div className="flex-1 p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Lookup Tables</h2>
            <p className="text-muted-foreground">
              Manage your decision matrix lookup tables
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tables..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Tables</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="deprecated">Deprecated</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading lookup tables...</span>
              </div>
            ) : filteredTables.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center space-y-4">
                    <div className="text-muted-foreground">
                      {searchTerm || statusFilter !== "all" 
                        ? "No lookup tables match your filters" 
                        : "No lookup tables found"}
                    </div>
                    {!searchTerm && statusFilter === "all" && (
                      <Button asChild>
                        <Link href="/decisioning/lookup-tables/create">
                          <Plus className="h-4 w-4 mr-2" />
                          Create your first lookup table
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {filteredTables.map((table) => (
                  <TableCard key={table.id} table={table} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="draft" className="mt-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredTables
                .filter((table) => table.status === "draft")
                .map((table) => (
                  <TableCard key={table.id} table={table} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="published" className="mt-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredTables
                .filter((table) => table.status === "published")
                .map((table) => (
                  <TableCard key={table.id} table={table} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="deprecated" className="mt-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredTables
                .filter((table) => table.status === "deprecated")
                .map((table) => (
                  <TableCard key={table.id} table={table} />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
