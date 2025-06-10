"use client";

import { useState, useEffect } from "react";
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

interface UpdateModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (data: UpdateModelData) => void;
  currentVersion: string;
}

export interface UpdateModelData {
  newData: string;
  updateStrategy: string;
  newVersionName: string;
  deployment: string;
}

export function UpdateModelDialog({
  open,
  onOpenChange,
  onUpdate,
  currentVersion,
}: UpdateModelDialogProps) {
  const [newData, setNewData] = useState("Recent Queries (Last 7 days)");
  const [updateStrategy, setUpdateStrategy] = useState("Incremental Learning");
  const [newVersionName, setNewVersionName] = useState("");
  const [deployment, setDeployment] = useState("Shadow Mode (No Traffic)");

  useEffect(() => {
    if (open) {
      let parts = currentVersion.split(".");
      parts[parts.length - 1] = (
        parseInt(parts[parts.length - 1] || "1") + 1
      ).toString();
      let newVersion = parts.join(".");
      setNewVersionName(newVersion);
    }
  }, [open, currentVersion]);

  const handleUpdate = () => {
    onUpdate({
      newData,
      updateStrategy,
      newVersionName,
      deployment,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Model</DialogTitle>
          <DialogDescription>
            Update the model with incremental learning on new data.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new-data" className="text-right">
              New Data
            </Label>
            <div className="col-span-3">
              <Select value={newData} onValueChange={setNewData}>
                <SelectTrigger id="new-data">
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Recent Queries (Last 7 days)">
                    Recent Queries (Last 7 days)
                  </SelectItem>
                  <SelectItem value="Customer Feedback">
                    Customer Feedback
                  </SelectItem>
                  <SelectItem value="Error Cases">Error Cases</SelectItem>
                  <SelectItem value="Custom Dataset">Custom Dataset</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="update-strategy" className="text-right">
              Update Strategy
            </Label>
            <div className="col-span-3">
              <Select value={updateStrategy} onValueChange={setUpdateStrategy}>
                <SelectTrigger id="update-strategy">
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Incremental Learning">
                    Incremental Learning
                  </SelectItem>
                  <SelectItem value="Transfer Learning">
                    Transfer Learning
                  </SelectItem>
                  <SelectItem value="Full Retraining">
                    Full Retraining
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new-version-name" className="text-right">
              New Version Name
            </Label>
            <Input
              id="new-version-name"
              value={newVersionName}
              onChange={(e) => setNewVersionName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deployment" className="text-right">
              Deployment
            </Label>
            <div className="col-span-3">
              <Select value={deployment} onValueChange={setDeployment}>
                <SelectTrigger id="deployment">
                  <SelectValue placeholder="Select deployment option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Shadow Mode (No Traffic)">
                    Shadow Mode (No Traffic)
                  </SelectItem>
                  <SelectItem value="A/B Test (10% Traffic)">
                    A/B Test (10% Traffic)
                  </SelectItem>
                  <SelectItem value="Canary Release (25% Traffic)">
                    Canary Release (25% Traffic)
                  </SelectItem>
                  <SelectItem value="Full Deployment">
                    Full Deployment
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <SampleButton variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </SampleButton>
          <SampleButton onClick={handleUpdate}>Update Model</SampleButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
