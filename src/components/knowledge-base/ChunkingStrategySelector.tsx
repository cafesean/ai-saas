"use client";

import React, { useState } from "react";
import { Info, Settings } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChunkingStrategyOptions, ChunkingStrategies } from "@/constants/knowledgeBase";

interface ChunkingConfig {
  strategy: string;
  chunkSize: number;
  chunkOverlap: number;
}

interface ChunkingStrategySelectorProps {
  value: ChunkingConfig;
  onChange: (config: ChunkingConfig) => void;
  disabled?: boolean;
}

export function ChunkingStrategySelector({ value, onChange, disabled = false }: ChunkingStrategySelectorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleStrategyChange = (newStrategy: string) => {
    const strategyOption = ChunkingStrategyOptions.find(opt => opt.value === newStrategy);
    if (strategyOption) {
      onChange({
        strategy: newStrategy,
        chunkSize: strategyOption.defaultSize,
        chunkOverlap: strategyOption.defaultOverlap,
      });
    }
  };

  const handleSizeChange = (newSize: string) => {
    const size = parseInt(newSize);
    if (!isNaN(size) && size > 0) {
      onChange({
        ...value,
        chunkSize: size,
      });
    }
  };

  const handleOverlapChange = (newOverlap: string) => {
    const overlap = parseInt(newOverlap);
    if (!isNaN(overlap) && overlap >= 0) {
      onChange({
        ...value,
        chunkOverlap: overlap,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Chunking Strategy</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Choose how your documents will be split into chunks for embedding and retrieval.
                Different strategies work better for different content types.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-4">
        <Select
          value={value.strategy}
          onValueChange={handleStrategyChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select chunking strategy" />
          </SelectTrigger>
          <SelectContent>
            {ChunkingStrategyOptions.map((option) => {
              const isRecommended = option.value === ChunkingStrategies.SEMANTIC;
              return (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <span>{option.label}</span>
                    {isRecommended && (
                      <Badge variant="secondary" className="text-xs">
                        Recommended
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Strategy Description */}
        {value.strategy && (
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="font-medium text-sm">
                  {ChunkingStrategyOptions.find(opt => opt.value === value.strategy)?.label}
                </div>
                <div className="text-sm text-muted-foreground">
                  {ChunkingStrategyOptions.find(opt => opt.value === value.strategy)?.description}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Default size: {ChunkingStrategyOptions.find(opt => opt.value === value.strategy)?.defaultSize} chars</span>
                  <span>Default overlap: {ChunkingStrategyOptions.find(opt => opt.value === value.strategy)?.defaultOverlap}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Advanced Configuration */}
      {value.strategy !== ChunkingStrategies.MANUAL && (
        <div className="space-y-3">
          <div
            className="flex items-center space-x-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Settings className="h-4 w-4" />
            <span>Advanced Configuration</span>
          </div>

          {showAdvanced && (
            <Card>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chunkSize" className="text-sm">
                      Chunk Size (characters)
                    </Label>
                    <Input
                      id="chunkSize"
                      type="number"
                      min="100"
                      max="10000"
                      value={value.chunkSize}
                      onChange={(e) => handleSizeChange(e.target.value)}
                      disabled={disabled}
                      className="text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Larger chunks preserve more context but may be less precise
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chunkOverlap" className="text-sm">
                      Chunk Overlap (characters)
                    </Label>
                    <Input
                      id="chunkOverlap"
                      type="number"
                      min="0"
                      max={Math.floor(value.chunkSize * 0.5)}
                      value={value.chunkOverlap}
                      onChange={(e) => handleOverlapChange(e.target.value)}
                      disabled={disabled}
                      className="text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Overlap helps maintain context across chunk boundaries
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium mb-2">Preview</div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>
                      Strategy: <span className="font-medium">{value.strategy}</span>
                    </div>
                    <div>
                      Chunk Size: <span className="font-medium">{value.chunkSize} characters</span>
                    </div>
                    <div>
                      Overlap: <span className="font-medium">{value.chunkOverlap} characters</span>
                    </div>
                    <div>
                      Estimated chunks per page: <span className="font-medium">
                        {Math.ceil(2000 / (value.chunkSize - value.chunkOverlap)) || 1}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}