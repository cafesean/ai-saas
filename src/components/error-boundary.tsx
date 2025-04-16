"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { SampleButton } from "@/components/ui/sample-button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="rounded-md border border-destructive p-4 my-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="text-sm font-medium text-destructive">
              Something went wrong
            </h3>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {this.state.error?.message || "An unexpected error occurred"}
          </div>
          <SampleButton
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </SampleButton>
        </div>
      );
    }

    return this.props.children;
  }
}
