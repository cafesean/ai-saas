"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Grid2X2, LayoutGrid, List } from "lucide-react";

import { ViewMode } from "@/framework/hooks/useViewToggle";

interface ViewToggleProps {
  viewMode: ViewMode;
  onChange: (value: ViewMode) => void;
}

export function ViewToggle({ viewMode, onChange }: ViewToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={viewMode}
      onValueChange={(value) => value && onChange(value as ViewMode)}
    >
      <ToggleGroupItem value="large-grid" aria-label="Large Grid View">
        <Grid2X2 className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="medium-grid" aria-label="Medium Grid View">
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List View">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
