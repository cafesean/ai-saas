import { Info } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Replace the MetricDisplay component with a simpler version that doesn't use TooltipProvider
interface MetricDisplayProps {
  title: string;
  value: string;
  trend: string;
  trendPositive: boolean;
  icon: React.ReactNode;
  chartData?: {
    type: string;
    min?: string;
    max?: string;
    trend: string;
    data?: string;
    description: string;
  } | null;
}

const MetricDisplay = ({
  title,
  value,
  trend,
  trendPositive,
  icon,
  chartData,
}: MetricDisplayProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex flex-col space-y-1 cursor-pointer group">
          <div className="flex items-center text-sm text-muted-foreground">
            {title}
            <Info className="ml-1 h-3 w-3" />
          </div>
          <div className="text-2xl font-bold group-hover:text-primary transition-colors">
            {(parseFloat(value) * 100).toFixed(1)}%
          </div>
          <p
            className={`text-xs ${
              trendPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {trend}
          </p>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium">{title} Metric</h4>
          <div className="h-32 w-full bg-muted rounded-md flex items-center justify-center">
            {/* This would be replaced with an actual chart component */}
            <div className="text-center text-muted-foreground h-full flex justify-center items-center flex-col">
              {chartData?.data ? (
                <img
                  className="w-auto h-full"
                  src={`data:image/png;base64,${chartData?.data}`}
                  alt={`${title} Chart`}
                />
              ) : (
                <>
                  <div className="mb-2">{chartData?.type} Chart</div>
                  <div className="text-xs">
                    Min: {chartData?.min} • Max: {chartData?.max}
                  </div>
                  <div className="text-xs mt-1">Trend: {chartData?.trend}</div>
                </>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {chartData?.description}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MetricDisplay;
