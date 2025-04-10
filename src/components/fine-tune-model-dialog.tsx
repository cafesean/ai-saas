"use client";

import { useState } from "react";
import { SampleButton } from "@/components/ui/sample-button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/sample-select";

interface FineTuneModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFineTune: (data: FineTuneData) => void;
  modelName: string;
}

export interface FineTuneData {
  dataset: string;
  epochs: number;
  learningRate: number;
  batchSize: number;
}

export function FineTuneModelDialog({
  open,
  onOpenChange,
  onFineTune,
  modelName,
}: FineTuneModelDialogProps) {
  const [dataset, setDataset] = useState("Customer Support Queries");
  const [epochs, setEpochs] = useState("5");
  const [learningRate, setLearningRate] = useState("0.0001");
  const [batchSize, setBatchSize] = useState("16");

  const handleFineTune = () => {
    onFineTune({
      dataset,
      epochs: Number.parseInt(epochs),
      learningRate: Number.parseFloat(learningRate),
      batchSize: Number.parseInt(batchSize),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Fine-tune Model</DialogTitle>
          <DialogDescription>
            Customize the model for your specific use case with additional
            training data.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dataset" className="text-right">
              Dataset
            </Label>
            <div className="col-span-3">
              <Select value={dataset} onValueChange={setDataset}>
                <SelectTrigger id="dataset">
                  <SelectValue placeholder="Select dataset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Customer Support Queries">
                    Customer Support Queries
                  </SelectItem>
                  <SelectItem value="Product Reviews">
                    Product Reviews
                  </SelectItem>
                  <SelectItem value="Social Media Comments">
                    Social Media Comments
                  </SelectItem>
                  <SelectItem value="Email Classification">
                    Email Classification
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="epochs" className="text-right">
              Epochs
            </Label>
            <Input
              id="epochs"
              value={epochs}
              onChange={(e) => setEpochs(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="learning-rate" className="text-right">
              Learning Rate
            </Label>
            <Input
              id="learning-rate"
              value={learningRate}
              onChange={(e) => setLearningRate(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="batch-size" className="text-right">
              Batch Size
            </Label>
            <div className="col-span-3">
              <Select value={batchSize} onValueChange={setBatchSize}>
                <SelectTrigger id="batch-size">
                  <SelectValue placeholder="Select batch size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="16">16</SelectItem>
                  <SelectItem value="32">32</SelectItem>
                  <SelectItem value="64">64</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <SampleButton variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </SampleButton>
          <SampleButton onClick={handleFineTune}>
            Start Fine-tuning
          </SampleButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
