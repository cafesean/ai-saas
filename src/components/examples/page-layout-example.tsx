/**
 * Example component demonstrating the shared styles system
 * This shows how to create consistent page layouts using the shared styles
 */

import { useState } from "react"
import { MoreHorizontal, Save, Download, Upload, FileSpreadsheet, ExternalLink, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Breadcrumbs from "@/components/ui/Breadcrumbs"

// Import shared styles
import {
  pageStyles,
  headerStyles,
  tabStyles,
  gridStyles,
  buttonStyles,
  getStatusColor,
  commonLayouts,
} from "@/lib/shared-styles"
import { cn } from "@/lib/utils"

interface ExamplePageProps {
  title?: string
  status?: string
  lastUpdated?: string
  itemCount?: number
}

export function PageLayoutExample({
  title = "Example Page",
  status = "active",
  lastUpdated = "2 hours ago",
  itemCount = 5,
}: ExamplePageProps) {
  const [isActive, setIsActive] = useState(status === "active")

  return (
    <div className={pageStyles.container}>
      {/* Breadcrumbs with Actions */}
      <Breadcrumbs
        items={[
          {
            label: "Back to Parent",
            link: "/parent",
          },
        ]}
        rightChildren={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className={buttonStyles.iconWithMargin} />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Download className={buttonStyles.iconWithMargin} />
                  Export Data
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Upload className={buttonStyles.iconWithMargin} />
                  Import Data
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileSpreadsheet className={buttonStyles.iconWithMargin} />
                  View as Spreadsheet
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <ExternalLink className={buttonStyles.iconWithMargin} />
                  Open API Reference
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button>
              <Save className={buttonStyles.iconWithMargin} />
              Save Changes
            </Button>
          </>
        }
      />

      {/* Header Section */}
      <div className={headerStyles.section}>
        <div className={headerStyles.container}>
          <div className={headerStyles.layout}>
            <div>
              <div className={headerStyles.titleWithIcon}>
                <h2 className={headerStyles.title}>{title}</h2>
              </div>
              <div className={headerStyles.subtitle}>
                {itemCount} items • Last updated {lastUpdated}
              </div>
            </div>

            <div className={headerStyles.actions}>
              <div className={headerStyles.statusToggle}>
                <Label htmlFor="active-toggle">Active</Label>
                <Switch
                  id="active-toggle"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={pageStyles.main}>
        <Tabs defaultValue="editor">
          <TabsList className={tabStyles.list}>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="schema">Schema</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className={tabStyles.content}>
            <div className={tabStyles.sectionHeader}>
              <h3 className={tabStyles.sectionTitle}>Content Editor</h3>
              <Button>
                <Plus className={buttonStyles.iconWithMargin} />
                Add Item
              </Button>
            </div>

            <div className={gridStyles.main}>
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Main Content</CardTitle>
                    <CardDescription>Primary content area</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      This is the main content area where the primary functionality would be displayed.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Data Table</CardTitle>
                    <CardDescription>Table showing data items</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      Data table would be rendered here
                    </div>
                  </CardContent>
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
                        <Badge className={cn("px-2 py-1 rounded", getStatusColor(status))}>
                          {status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Items</Label>
                      <p className="text-sm text-muted-foreground mt-1">{itemCount}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Last Updated</Label>
                      <p className="text-sm text-muted-foreground mt-1">{lastUpdated}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="schema" className={tabStyles.content}>
            <div className={gridStyles.twoColumn}>
              <Card>
                <CardHeader>
                  <CardTitle>Input Schema</CardTitle>
                  <CardDescription>Define input variables</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Input configuration would go here
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Output Schema</CardTitle>
                  <CardDescription>Define output variables</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Output configuration would go here
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className={tabStyles.content}>
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Configure advanced options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Settings panel would be displayed here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

// Alternative example using CSS classes instead of TypeScript constants
export function PageLayoutExampleWithCSS({
  title = "Example Page (CSS)",
  status = "draft",
}: Partial<ExamplePageProps>) {
  return (
    <div className="page-container">
      <div className="header-section">
        <div className="header-layout">
          <h1 className="header-title">{title}</h1>
          <div className="header-actions">
            <Badge className={cn("status-badge", `status-${status}`)}>
              {status}
            </Badge>
          </div>
        </div>
      </div>
      <main className="page-main">
        <div className="tab-content">
          <div className="card-grid-layout">
            <Card>
              <CardHeader>
                <CardTitle>Using CSS Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This example shows how to use the CSS classes directly instead of TypeScript constants.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
} 