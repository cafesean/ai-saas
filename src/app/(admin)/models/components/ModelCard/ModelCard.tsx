import { Trophy, Info } from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SampleCheckbox } from "@/components/ui/sample-checkbox";
import { SampleButton } from "@/components/ui/sample-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ModelMetric } from "@/constants/model";

function MetricDisplay({
  label,
  value,
  chartData,
}: {
  label: string;
  value: string;
  chartData: any;
}) {
  return (
    <TooltipProvider>
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex flex-col space-y-1 cursor-pointer group">
            <div className="flex items-center text-sm text-muted-foreground">
              {label}
              <Info className="ml-1 h-3 w-3" />
            </div>
            <div className="font-medium text-lg group-hover:text-primary transition-colors">
              {value ? `${(parseFloat(value) * 100).toFixed(1)}%` : "-"}
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <h4 className="font-medium">{label} Metric</h4>
            <div className="h-32 w-full bg-muted rounded-md flex items-center justify-center">
              {/* This would be replaced with an actual chart component */}
              <div className="text-center text-muted-foreground h-full flex justify-center items-center flex-col">
                {chartData.data ? (
                  <img
                    className="w-auto h-full"
                    src={`data:image/png;base64,${chartData.data}`}
                    alt={`${label} Chart`}
                  />
                ) : (
                  <>
                    <div className="mb-2">{chartData.type} Chart</div>
                    <div className="text-xs">
                      Min: {chartData.min} • Max: {chartData.max}
                    </div>
                    <div className="text-xs mt-1">Trend: {chartData.trend}</div>
                  </>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {chartData.description}
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}

function ModelCard({
  model,
  isSelected,
  onToggleSelect,
  onDelete,
}: {
  model: any;
  isSelected: boolean;
  onToggleSelect: (isSelected: boolean) => void;
  onDelete: (model: any) => void;
}) {
  return (
    <Card
      className={`overflow-hidden transition-all ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
    >
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="p-4 md:p-6 flex-1">
            <div className="flex items-start">
              <SampleCheckbox
                checked={isSelected}
                onCheckedChange={onToggleSelect}
                className="mr-3 mt-1"
              />

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/models/${model.uuid}`}
                    className="hover:text-primary transition-colors"
                  >
                    <h3 className="font-semibold text-lg">{model.name}</h3>
                  </Link>
                  <Badge
                    variant={
                      model.status === "champion" ? "default" : "secondary"
                    }
                  >
                    {model.status === "champion" ? (
                      <>
                        <Trophy className="mr-1 h-3 w-3" /> Champion
                      </>
                    ) : (
                      "Challenger"
                    )}
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground mb-4">
                  Version {model?.version} • Last updated{" "}
                  {String(model?.updatedAt)} •{" "}
                  {model?.inferences?.toLocaleString()} inferences
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <MetricDisplay
                    label={ModelMetric.ks.label}
                    value={model.metrics ? model.metrics.ks : ""}
                    chartData={
                      model.metrics
                        ? {
                            ...ModelMetric.ks.chart,
                            data: model.metrics.ksChart,
                          }
                        : { ...ModelMetric.ks.chart }
                    }
                  />
                  <MetricDisplay
                    label={ModelMetric.accuracy.label}
                    value={model.metrics ? model.metrics.accuracy : ""}
                    chartData={
                      model.metrics
                        ? {
                            ...ModelMetric.accuracy.chart,
                            data: model.metrics.accuracyChart,
                          }
                        : {
                            ...ModelMetric.accuracy.chart,
                          }
                    }
                  />
                  <MetricDisplay
                    label={ModelMetric.gini.label}
                    value={model.metrics ? model.metrics.gini : ""}
                    chartData={
                      model.metrics
                        ? {
                            ...ModelMetric.gini.chart,
                            data: model.metrics.giniChart,
                          }
                        : {
                            ...ModelMetric.gini.chart,
                          }
                    }
                  />
                  <MetricDisplay
                    label={ModelMetric.aucroc.label}
                    value={model.metrics ? model.metrics.auroc : ""}
                    chartData={
                      model.metrics
                        ? {
                            ...ModelMetric.aucroc.chart,
                            data: model.metrics.aurocChart,
                          }
                        : {
                            ...ModelMetric.aucroc.chart,
                          }
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 p-4 md:p-6 md:w-48 flex flex-row md:flex-col justify-between md:justify-start gap-4">
            <SampleButton
              variant="outline"
              size="sm"
              className="w-full"
              asChild
            >
              <Link href={`/models/detail/${model.uuid}`}>View Details</Link>
            </SampleButton>
            <SampleButton variant="outline" size="sm" className="w-full">
              <Link href={`/models/${model.uuid}`}>Edit</Link>
            </SampleButton>
            <SampleButton variant="outline" size="sm" className="w-full">
              Deploy
            </SampleButton>
            <SampleButton
              variant="outline"
              size="sm"
              className="w-full text-red-500 hover:text-red-500"
              onClick={() => onDelete(model)}
            >
              Delete
            </SampleButton>

            <div className="mt-auto pt-4 hidden md:block">
              <div className="text-xs text-muted-foreground">
                Created by: {model.creator || "SaaS AI"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ModelCard;
