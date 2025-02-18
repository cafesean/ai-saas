import { forwardRef, createContext, useState, useContext } from "react";
import { cn } from "@/framework/lib/utils";

interface InputProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  newValue?: string;
  className?: string;
  onValueChange?: (value: string) => void;
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value?: string;
  className?: string;
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  className?: string;
}

const TabsContext = createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

const Tabs = forwardRef<HTMLDivElement, InputProps>(
  ({ className, defaultValue, value, newValue, onValueChange, ...props }: InputProps, ref: React.ForwardedRef<HTMLDivElement>) => {

    const [internalValue, setInternalValue] = useState(defaultValue);
    const currentValue = value ?? internalValue;

    return (
      <TabsContext.Provider
        value={{
          value: currentValue,
          onValueChange: (newValue: string) => {
            setInternalValue(newValue);
            onValueChange?.(newValue);
          },
        }}
      >
        <div ref={ref} className={cn("", className)} {...props} />
      </TabsContext.Provider>
    );
  }
);

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }: TabsListProps, ref: React.ForwardedRef<HTMLDivElement>) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
          className
        )}
        {...props}
      />
    );
  }
);
const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, ...props }: TabsTriggerProps, ref: React.ForwardedRef<HTMLButtonElement>) => {
    const context = useContext(TabsContext);
    const isSelected = context.value === value;

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          isSelected
            ? "bg-background text-foreground shadow-sm"
            : "hover:bg-background/50 hover:text-foreground",
          className ?? ""
        )}
        onClick={() => context.onValueChange?.(value ?? "")}
        {...props}
      />
    );
  }
);

const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }: TabsContentProps, ref: React.ForwardedRef<HTMLDivElement>) => {
    const context = useContext(TabsContext);
    const isSelected = context.value === value;

    if (!isSelected) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}
      />
    );
  }
);

Tabs.displayName = "Tabs";
TabsList.displayName = "TabsList";
TabsTrigger.displayName = "TabsTrigger";
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent }; 