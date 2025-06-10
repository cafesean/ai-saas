import { cn } from "@/lib/utils";

interface MetadataItem {
  label: string;
  value: string | number | object | null | undefined;
  className?: string;
}

interface MetadataGridProps {
  items: MetadataItem[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function MetadataGrid({ items, columns = 2, className }: MetadataGridProps) {
  const gridColsClass = {
    1: "grid-cols-1",
    2: "grid-cols-2", 
    3: "grid-cols-3",
    4: "grid-cols-4"
  }[columns];

  const renderValue = (value: string | number | object | null | undefined) => {
    if (value === null || value === undefined) return "—";
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <div className={cn("grid gap-4", gridColsClass, className)}>
      {items.map((item, index) => (
        <div key={index} className={cn("space-y-1", item.className)}>
          <p className="text-sm font-medium">{item.label}</p>
          <p className="text-sm text-muted-foreground break-words">
            {renderValue(item.value)}
          </p>
        </div>
      ))}
    </div>
  );
} 