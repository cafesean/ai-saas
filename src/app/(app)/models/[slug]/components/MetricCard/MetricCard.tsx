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
  value: string | number;
  trend?: string;
  trendPositive?: boolean;
  icon?: React.ReactNode;
  description?: string;
  format?: 'percentage' | 'number' | 'currency' | 'auto';
}

const MetricCard = ({
  title,
  value,
  trend,
  trendPositive,
  icon,
  description,
  format = 'auto',
}: MetricCardProps) => {
  // Format the value based on the specified format
  const formatValue = (val: string | number) => {
    const stringVal = String(val);
    const numValue = parseFloat(stringVal);
    
    if (isNaN(numValue)) return stringVal;
    
    switch (format) {
      case 'percentage':
        return numValue <= 1.0 ? `${(numValue * 100).toFixed(1)}%` : `${numValue.toFixed(1)}%`;
      case 'number':
        return numValue.toFixed(3);
      case 'currency':
        return `$${numValue.toFixed(2)}`;
      case 'auto':
      default:
        // Auto-detect format based on value
        if (stringVal.includes('%') || stringVal.includes('$') || stringVal.includes('ms')) {
          return stringVal;
        }
        // If value is between 0 and 1, treat as percentage
        if (numValue <= 1.0) {
          return `${(numValue * 100).toFixed(1)}%`;
        }
        return numValue.toFixed(3);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatValue(value)}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <p
            className={`text-xs mt-1 ${
              trendPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
