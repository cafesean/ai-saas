"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Code,
  Copy,
  ExternalLink,
  Search,
  Settings,
} from "lucide-react";
import { SampleButton } from "@/components/ui/sample-button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

// API endpoint categories
const endpointCategories = [
  {
    id: "core",
    name: "Core Endpoints",
    description: "Platform module interaction endpoints",
    endpoints: [
      {
        id: "models",
        path: "/v1/models",
        name: "Models",
        description: "Model management and predictions",
        methods: ["GET", "POST"],
        status: "active",
      },
      {
        id: "models-id",
        path: "/v1/models/{id}",
        name: "Model Details",
        description: "Get a specific model by ID",
        methods: ["GET", "PUT", "DELETE"],
        status: "active",
      },
      {
        id: "models-predict",
        path: "/v1/models/{id}/predict",
        name: "Model Prediction",
        description: "Run inference with a specific model",
        methods: ["POST"],
        status: "active",
      },
      {
        id: "workflows",
        path: "/v1/workflows",
        name: "Workflows",
        description: "Workflow management and execution",
        methods: ["GET", "POST"],
        status: "active",
      },
      {
        id: "workflows-id",
        path: "/v1/workflows/{id}",
        name: "Workflow Details",
        description: "Get a specific workflow by ID",
        methods: ["GET", "PUT", "DELETE"],
        status: "active",
      },
      {
        id: "workflows-execute",
        path: "/v1/workflows/{id}/execute",
        name: "Workflow Execution",
        description: "Execute a specific workflow",
        methods: ["POST"],
        status: "active",
      },
      {
        id: "decisioning",
        path: "/v1/decisioning",
        name: "Decision Tables",
        description: "Decision table management",
        methods: ["GET", "POST"],
        status: "active",
      },
      {
        id: "knowledge-bases",
        path: "/v1/knowledge-bases",
        name: "Knowledge Bases",
        description: "Knowledge base management",
        methods: ["GET", "POST"],
        status: "active",
      },
      {
        id: "documents",
        path: "/v1/documents",
        name: "Documents",
        description: "Document management",
        methods: ["GET", "POST"],
        status: "active",
      },
      {
        id: "widgets",
        path: "/v1/widgets",
        name: "Widgets",
        description: "Widget management",
        methods: ["GET", "POST"],
        status: "active",
      },
    ],
  },
  {
    id: "business",
    name: "Business Logic Endpoints",
    description: "Application-specific interaction endpoints",
    endpoints: [
      {
        id: "loans",
        path: "/v1/loans",
        name: "Loans",
        description: "Loan application management",
        methods: ["GET", "POST"],
        status: "active",
      },
      {
        id: "loans-id",
        path: "/v1/loans/{id}",
        name: "Loan Details",
        description: "Get a specific loan application by ID",
        methods: ["GET", "PUT", "DELETE"],
        status: "active",
      },
      {
        id: "loans-decision",
        path: "/v1/loans/{id}/decision",
        name: "Loan Decision",
        description: "Get or update a loan decision",
        methods: ["GET", "POST"],
        status: "active",
      },
      {
        id: "customers",
        path: "/v1/customers",
        name: "Customers",
        description: "Customer management",
        methods: ["GET", "POST"],
        status: "active",
      },
      {
        id: "triggers",
        path: "/v1/triggers",
        name: "Custom Workflow Triggers",
        description: "Trigger workflow execution",
        methods: ["POST"],
        status: "active",
      },
    ],
  },
];

export default function ApiDocsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEndpoint, setSelectedEndpoint] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Filter endpoints based on search query
  const filteredCategories = endpointCategories
    .map((category) => ({
      ...category,
      endpoints: category.endpoints.filter(
        (endpoint) =>
          endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
          endpoint.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.endpoints.length > 0);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-xl font-semibold">Platform Open API</h1>
        <div className="ml-auto flex items-center gap-2">
          <SampleButton variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </SampleButton>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">
              Platform Open API
            </h2>
            <p className="text-muted-foreground">
              RESTful API for system integration with authentication and core
              endpoints
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search API..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <SampleButton>
              <ExternalLink className="mr-2 h-4 w-4" />
              API Reference
            </SampleButton>
          </div>
        </div>

        <Tabs defaultValue="endpoints">
          <TabsList>
            <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
          </TabsList>

          <TabsContent value="endpoints" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
                <div className="space-y-2">
                  {filteredCategories.map((category) => (
                    <div key={category.id} className="space-y-2">
                      <div
                        className="flex items-center justify-between cursor-pointer p-2 hover:bg-muted rounded-md"
                        onClick={() =>
                          setActiveCategory(
                            activeCategory === category.id ? null : category.id,
                          )
                        }
                      >
                        <h3 className="text-lg font-medium">{category.name}</h3>
                        {activeCategory === category.id ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>

                      {activeCategory === category.id && (
                        <div className="pl-4 space-y-1 border-l-2 border-muted ml-2">
                          {category.endpoints.map((endpoint) => (
                            <div
                              key={endpoint.id}
                              className={`p-2 rounded-md cursor-pointer ${
                                selectedEndpoint?.id === endpoint.id
                                  ? "bg-muted"
                                  : "hover:bg-muted/50"
                              }`}
                              onClick={() => setSelectedEndpoint(endpoint)}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">
                                  {endpoint.name}
                                </span>
                                <Badge
                                  variant={
                                    endpoint.status === "active"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {endpoint.status}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {endpoint.path}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                {selectedEndpoint ? (
                  <EndpointDetail endpoint={selectedEndpoint} />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>API Documentation</CardTitle>
                      <CardDescription>
                        Select an endpoint from the list to view details
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          Choose an endpoint to see its documentation
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="authentication" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>
                  Learn how to authenticate with the API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">API Keys</h3>
                  <p>
                    The API uses API keys for authentication. You can generate
                    API keys in the dashboard.
                  </p>
                  <div className="bg-muted p-4 rounded-md">
                    <div className="flex items-center justify-between">
                      <code>Authorization: Bearer YOUR_API_KEY</code>
                      <SampleButton variant="ghost" size="sm">
                        <Copy className="h-4 w-4" />
                      </SampleButton>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">OAuth 2.0</h3>
                  <p>
                    For user-based authentication, the API supports OAuth 2.0.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium">
                        1. Authorization Code Flow
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Redirect users to:
                      </p>
                      <div className="bg-muted p-2 rounded-md mt-1">
                        <code className="text-xs">
                          https://api.example.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code
                        </code>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium">
                        2. Exchange Code for Token
                      </h4>
                      <div className="bg-muted p-2 rounded-md mt-1">
                        <code className="text-xs">
                          POST https://api.example.com/oauth/token
                        </code>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium">
                        3. Use Access Token
                      </h4>
                      <div className="bg-muted p-2 rounded-md mt-1">
                        <code className="text-xs">
                          Authorization: Bearer ACCESS_TOKEN
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentation" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>API Documentation</CardTitle>
                <CardDescription>
                  Comprehensive guides and references
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Getting Started</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <ChevronRight className="h-4 w-4 mr-2" />
                          <a href="#" className="text-blue-600 hover:underline">
                            Introduction
                          </a>
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="h-4 w-4 mr-2" />
                          <a href="#" className="text-blue-600 hover:underline">
                            Authentication
                          </a>
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="h-4 w-4 mr-2" />
                          <a href="#" className="text-blue-600 hover:underline">
                            Making Requests
                          </a>
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="h-4 w-4 mr-2" />
                          <a href="#" className="text-blue-600 hover:underline">
                            Error Handling
                          </a>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">API Reference</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <ChevronRight className="h-4 w-4 mr-2" />
                          <a href="#" className="text-blue-600 hover:underline">
                            Core Endpoints
                          </a>
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="h-4 w-4 mr-2" />
                          <a href="#" className="text-blue-600 hover:underline">
                            Business Logic Endpoints
                          </a>
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="h-4 w-4 mr-2" />
                          <a href="#" className="text-blue-600 hover:underline">
                            Data Types
                          </a>
                        </li>
                        <li className="flex items-center">
                          <ChevronRight className="h-4 w-4 mr-2" />
                          <a href="#" className="text-blue-600 hover:underline">
                            Webhooks
                          </a>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">SDKs & Libraries</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-md p-4">
                      <div className="font-medium">JavaScript/TypeScript</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        npm install @example/api-sdk
                      </div>
                    </div>
                    <div className="border rounded-md p-4">
                      <div className="font-medium">Python</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        pip install example-api
                      </div>
                    </div>
                    <div className="border rounded-md p-4">
                      <div className="font-medium">Java</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        maven: com.example:api-client:1.0.0
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

interface EndpointDetailProps {
  endpoint: any;
}

function EndpointDetail({ endpoint }: EndpointDetailProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{endpoint.name}</CardTitle>
          <Badge
            variant={endpoint.status === "active" ? "default" : "secondary"}
          >
            {endpoint.status}
          </Badge>
        </div>
        <CardDescription>{endpoint.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Endpoint</h3>
          <div className="flex items-center gap-2 bg-muted p-3 rounded-md overflow-x-auto">
            {endpoint.methods.map((method: string) => (
              <Badge
                key={method}
                variant="outline"
                className={
                  method === "GET"
                    ? "bg-blue-100 text-blue-800 border-blue-200"
                    : method === "POST"
                    ? "bg-green-100 text-green-800 border-green-200"
                    : method === "PUT"
                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                    : method === "DELETE"
                    ? "bg-red-100 text-red-800 border-red-200"
                    : ""
                }
              >
                {method}
              </Badge>
            ))}
            <code className="text-sm">{endpoint.path}</code>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="parameters">
            <AccordionTrigger>Parameters</AccordionTrigger>
            <AccordionContent>
              <div className="border rounded-md">
                <div className="grid grid-cols-4 gap-4 p-3 border-b bg-muted/30 font-medium text-sm">
                  <div>Name</div>
                  <div>Type</div>
                  <div>Required</div>
                  <div>Description</div>
                </div>
                {endpoint.path.includes("{id}") && (
                  <div className="grid grid-cols-4 gap-4 p-3 border-b text-sm">
                    <div>id</div>
                    <div>string</div>
                    <div>Yes</div>
                    <div>Unique identifier</div>
                  </div>
                )}
                <div className="grid grid-cols-4 gap-4 p-3 text-sm">
                  <div>organization_id</div>
                  <div>string</div>
                  <div>Yes</div>
                  <div>Organization identifier</div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="request">
            <AccordionTrigger>Request Body</AccordionTrigger>
            <AccordionContent>
              {endpoint.methods.includes("POST") ||
              endpoint.methods.includes("PUT") ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">JSON Schema</div>
                    <SampleButton variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </SampleButton>
                  </div>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                    {JSON.stringify(
                      {
                        type: "object",
                        required: ["name"],
                        properties: {
                          name: {
                            type: "string",
                            description: "Name of the resource",
                          },
                          description: {
                            type: "string",
                            description: "Description of the resource",
                          },
                          status: {
                            type: "string",
                            enum: ["active", "inactive", "draft"],
                            description: "Status of the resource",
                          },
                        },
                      },
                      null,
                      2,
                    )}
                  </pre>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No request body required for this endpoint.
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="response">
            <AccordionTrigger>Response</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="border rounded-md">
                  <div className="grid grid-cols-2 gap-4 p-3 border-b bg-muted/30 font-medium text-sm">
                    <div>Code</div>
                    <div>Description</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-3 border-b text-sm">
                    <div>200</div>
                    <div>Success. Returns resource details</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-3 border-b text-sm">
                    <div>400</div>
                    <div>Bad Request. Invalid parameters</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-3 border-b text-sm">
                    <div>401</div>
                    <div>Unauthorized. Authentication required</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-3 text-sm">
                    <div>404</div>
                    <div>Not Found. Resource does not exist</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">
                      Example Response (200)
                    </div>
                    <SampleButton variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </SampleButton>
                  </div>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                    {JSON.stringify(
                      {
                        id: "resource_123",
                        name: "Example Resource",
                        description: "This is an example resource",
                        status: "active",
                        created_at: "2023-01-01T00:00:00Z",
                        updated_at: "2023-01-02T00:00:00Z",
                      },
                      null,
                      2,
                    )}
                  </pre>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="example">
            <AccordionTrigger>Example</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">cURL</h4>
                  <div className="bg-muted p-4 rounded-md overflow-x-auto">
                    <div className="flex items-center justify-between">
                      <code className="text-sm whitespace-pre">
                        {`curl -X ${endpoint.methods[0]} \\
  https://api.example.com${endpoint.path.replace("{id}", "resource_123")} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                        {(endpoint.methods.includes("POST") ||
                          endpoint.methods.includes("PUT")) &&
                          ` \\
  -d '{"name": "Example Resource", "description": "This is an example resource"}'`}
                      </code>
                      <SampleButton variant="ghost" size="sm">
                        <Copy className="h-4 w-4" />
                      </SampleButton>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">JavaScript</h4>
                  <div className="bg-muted p-4 rounded-md overflow-x-auto">
                    <div className="flex items-center justify-between">
                      <code className="text-sm whitespace-pre">
                        {`const response = await fetch('https://api.example.com${endpoint.path.replace(
                          "{id}",
                          "resource_123",
                        )}', {
  method: '${endpoint.methods[0]}',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }${
    endpoint.methods.includes("POST") || endpoint.methods.includes("PUT")
      ? `,
  body: JSON.stringify({
    name: 'Example Resource',
    description: 'This is an example resource'
  })`
      : ""
  }
});

const data = await response.json();
console.log(data);`}
                      </code>
                      <SampleButton variant="ghost" size="sm">
                        <Copy className="h-4 w-4" />
                      </SampleButton>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">
          Last updated: 2 weeks ago
        </div>
        <div className="flex items-center gap-2">
          <SampleButton variant="outline" size="sm">
            <Code className="mr-2 h-4 w-4" />
            Try It
          </SampleButton>
          <SampleButton size="sm">
            <ExternalLink className="mr-2 h-4 w-4" />
            View Full Docs
          </SampleButton>
        </div>
      </CardFooter>
    </Card>
  );
}
