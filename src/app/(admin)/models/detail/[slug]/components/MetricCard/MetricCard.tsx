import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  trend: string;
  trendPositive: boolean;
  icon: React.ReactNode;
}

const MetricCard = ({
  title,
  value,
  trend,
  trendPositive,
  icon,
}: MetricCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {(parseFloat(value) * 100).toFixed(1)}%
        </div>
        <p
          className={`text-xs mt-1 ${
            trendPositive ? "text-green-500" : "text-red-500"
          }`}
        >
          {trend}
        </p>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
