import { forwardRef } from "react";
import { cn } from "@/framework/lib/utils";

interface InputProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  error?: string;
  className?: string;
  placeholder?: string;
  variant?: string;
  id?: string;
}

const Card = forwardRef<HTMLDivElement, InputProps>(
  ({ className, variant, ...props }: InputProps, ref: React.ForwardedRef<HTMLDivElement>) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm",
          className
        )}
        {...props}
      />
    );
  });

Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, InputProps>(
  ({ className, variant, ...props }: InputProps, ref: React.ForwardedRef<HTMLDivElement>) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
      />
    );
  }
);

const CardTitle = forwardRef<HTMLDivElement, InputProps>(({ className, variant, ...props }: InputProps, ref: React.ForwardedRef<HTMLDivElement>) => {
  return (
    <h2
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  );
}
);

const CardContent = forwardRef<HTMLDivElement, InputProps>(({ className, variant, ...props }: InputProps, ref: React.ForwardedRef<HTMLDivElement>) => {
  return (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  );
}
);

CardHeader.displayName = "CardHeader";
CardTitle.displayName = "CardTitle";
CardContent.displayName = "CardContent";

export { Card, CardHeader, CardTitle, CardContent }; 