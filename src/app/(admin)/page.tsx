import Link from "next/link";
import { Route } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  ArrowUpRight,
  Brain,
  CheckCircle,
  Clock,
  FileText,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SampleButton } from "@/components/ui/sample-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Prevent static prerendering to fix TRPC issues
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center gap-2">
            <SampleButton className="btn-hover">
              <FileText className="mr-2 h-4 w-4" />
              Export Report
            </SampleButton>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/models" className="block">
                <Card className="card-hover transition-all hover:border-primary cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Models
                    </CardTitle>
                    <Brain className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-bold animate-float">24</div>
                    <p className="text-xs text-muted-foreground">
                      +2 from last month
                    </p>
                    <div className="text-xs text-primary flex items-center mt-2">
                      View all models
                      <ArrowUpRight className="ml-1 h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/models?status=published" className="block">
                <Card className="card-hover transition-all hover:border-primary cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Published Models
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-bold animate-float">18</div>
                    <p className="text-xs text-muted-foreground">
                      +3 from last month
                    </p>
                    <div className="text-xs text-primary flex items-center mt-2">
                      View published models
                      <ArrowUpRight className="ml-1 h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href={`/analytics` as Route} className="block">
                <Card className="card-hover transition-all hover:border-primary cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Inferences
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-bold animate-float">1.2M</div>
                    <p className="text-xs text-muted-foreground">
                      +12% from last month
                    </p>
                    <div className="text-xs text-primary flex items-center mt-2">
                      View analytics
                      <ArrowUpRight className="ml-1 h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/workflows" className="block">
                <Card className="card-hover transition-all hover:border-primary cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Workflows
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-bold animate-float">7</div>
                    <p className="text-xs text-muted-foreground">
                      +1 from last month
                    </p>
                    <div className="text-xs text-primary flex items-center mt-2">
                      View workflows
                      <ArrowUpRight className="ml-1 h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 card-hover">
                <CardHeader>
                  <CardTitle>Active Workflows</CardTitle>
                  <CardDescription>
                    Workflows currently using AI models
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-lg border p-3 animate-slide-in">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">
                            Microfinance Loan Preapproval
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Credit Risk Assessment
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-success/10 text-success"
                      >
                        Active
                      </Badge>
                      <Link href="/workflows/credit-risk-scorecard">
                        <SampleButton
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                          <span className="sr-only">View workflow</span>
                        </SampleButton>
                      </Link>
                    </div>

                    <div
                      className="grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-lg border p-3 animate-slide-in"
                      style={{ animationDelay: "0.1s" }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">
                            Customer Churn Prediction
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Telecom Services
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-success/10 text-success"
                      >
                        Active
                      </Badge>
                      <Link href="/workflows/2">
                        <SampleButton
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                          <span className="sr-only">View workflow</span>
                        </SampleButton>
                      </Link>
                    </div>

                    <div
                      className="grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-lg border p-3 animate-slide-in"
                      style={{ animationDelay: "0.2s" }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <Activity className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">Fraud Detection</div>
                          <div className="text-sm text-muted-foreground">
                            Banking Transactions
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-success/10 text-success"
                      >
                        Active
                      </Badge>
                      <Link href="/workflows/3">
                        <SampleButton
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                          <span className="sr-only">View workflow</span>
                        </SampleButton>
                      </Link>
                    </div>

                    <Link
                      href="/workflows"
                      className="flex items-center justify-center text-sm text-primary"
                    >
                      View all workflows
                      <ArrowUpRight className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-3 card-hover">
                <CardHeader>
                  <CardTitle>Recent Inferences</CardTitle>
                  <CardDescription>Latest model inferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 rounded-lg border p-3 animate-slide-in">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src="/placeholder.svg?height=36&width=36"
                          alt="Avatar"
                        />
                        <AvatarFallback>AA</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Ahmed Al-Mansouri
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Loan Preapproval: Approved
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">2m ago</p>
                    </div>

                    <div
                      className="flex items-center gap-4 rounded-lg border p-3 animate-slide-in"
                      style={{ animationDelay: "0.1s" }}
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src="/placeholder.svg?height=36&width=36"
                          alt="Avatar"
                        />
                        <AvatarFallback>FA</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Fatima Al-Zahrani
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Churn Prediction: Low Risk
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">15m ago</p>
                    </div>

                    <div
                      className="flex items-center gap-4 rounded-lg border p-3 animate-slide-in"
                      style={{ animationDelay: "0.2s" }}
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src="/placeholder.svg?height=36&width=36"
                          alt="Avatar"
                        />
                        <AvatarFallback>SA</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Saeed Al-Qahtani
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Fraud Detection: Flagged
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">1h ago</p>
                    </div>

                    <div
                      className="flex items-center gap-4 rounded-lg border p-3 animate-slide-in"
                      style={{ animationDelay: "0.3s" }}
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src="/placeholder.svg?height=36&width=36"
                          alt="Avatar"
                        />
                        <AvatarFallback>NA</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Noura Al-Saud
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Loan Preapproval: Rejected
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">3h ago</p>
                    </div>

                    <Link
                      href={`/analytics` as Route}
                      className="flex items-center justify-center text-sm text-primary"
                    >
                      View all inferences
                      <ArrowUpRight className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
