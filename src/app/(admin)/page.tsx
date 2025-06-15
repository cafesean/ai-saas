"use client";

import Link from "next/link";
import { Route } from "next";

import { api, useUtils } from "@/utils/trpc";
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
import { formatNumber, getTimeAgo } from "@/utils/func";
import { AdminRoutes } from "@/constants/routes";
// import { AuthDebug } from "@/components/debug/AuthDebug";

// Prevent static prerendering to fix TRPC issues
export const dynamic = "force-dynamic";

export default function Home() {
  const { data: stats, isLoading, error } = api.dashboard.getStats.useQuery();
  return (
    <div className="flex flex-col w-full">
      {/* Temporary debug component */}
      {/* <AuthDebug /> */}
      
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
                    <div className="text-5xl font-bold animate-float">
                      {stats?.totalModels || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +{stats?.modelsLastMonth || 0} from last month
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
                      Active Models
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-bold animate-float">
                      {stats?.activeModels || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +{stats?.activeModelsLastMonth || 0} from last month
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
                    <div className="text-5xl font-bold animate-float">
                      {formatNumber(stats?.totalInferences || 0)}
                    </div>
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
                      Published Workflows
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-bold animate-float">
                      {stats?.publishedWorkflows || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +{stats?.publishedWorkflowsLastMonth || 0} from last month
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
                  <CardTitle>Published Workflows</CardTitle>
                  <CardDescription>
                    Workflows currently using AI models
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.latestThreePublishedWorkflows.map(
                      (workflow, index) => {
                        const animationDelay = `${index * 0.1}s`;
                        return (
                          <div
                            key={`latest-workflow-${workflow.uuid}`}
                            className="grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-lg border p-3 animate-slide-in"
                            style={{ animationDelay: animationDelay }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                <FileText className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {workflow.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {workflow.description}
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-success/10 text-success"
                            >
                              {workflow.status}
                            </Badge>
                            <Link
                              href={
                                AdminRoutes.workflowDetail.replace(
                                  ":uuid",
                                  workflow.uuid,
                                ) as Route
                              }
                            >
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
                        );
                      },
                    )}

                    <Link
                      href={AdminRoutes.workflows as Route}
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
                    {stats?.latestThreeInferences.map((inference, index) => {
                      const animationDelay = `${index * 0.1}s`;
                      return (
                        <div
                          key={`latest-inference-${inference.inference.uuid}`}
                          className="flex items-center gap-4 rounded-lg border p-3 animate-slide-in"
                          style={{ animationDelay: animationDelay }}
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
                              {inference.model.name}
                            </p>
                            <p className="text-xs text-muted-foreground"></p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {getTimeAgo(inference.inference.createdAt)}
                          </p>
                        </div>
                      );
                    })}

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
