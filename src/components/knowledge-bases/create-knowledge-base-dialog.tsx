"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SampleButton } from "@/components/ui/sample-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/sample-select";
import {
  KnowledgeBaseVectorDatabase,
  KnowledgeBaseEmbeddingModels,
} from "@/constants/knowledgeBase";
import { CreateKnowledgeBaseFormValues } from "@/schemas/knowledge-bases";

interface CreateKnowledgeBaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (formData: CreateKnowledgeBaseFormValues) => Promise<void>;
}

export function CreateKnowledgeBaseDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateKnowledgeBaseDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [vectorDB, setVectorDB] = useState("");
  const [embeddingModel, setEmbeddingModel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateKnowledgeBaseFormValues, string>>
  >({});

  const resetForm = () => {
    setName("");
    setDescription("");
    setVectorDB("");
    setEmbeddingModel("");
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const newErrors: Partial<
      Record<keyof CreateKnowledgeBaseFormValues, string>
    > = {};
    if (!name) newErrors.name = "Name is required";
    if (!vectorDB) newErrors.vectorDB = "Vector database is required";
    if (!embeddingModel)
      newErrors.embeddingModel = "Embedding model is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await onCreate({
        name,
        description,
        vectorDB,
        embeddingModel,
      });
      resetForm();
    } catch (error) {
      console.error("Error creating knowledge base:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) resetForm();
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Knowledge Base</DialogTitle>
            <DialogDescription>
              Create a new vector database to store and search documents
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Knowledge Base"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description of this knowledge base"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vectorDb">
                Vector Database <span className="text-destructive">*</span>
              </Label>
              <Select value={vectorDB} onValueChange={setVectorDB}>
                <SelectTrigger
                  id="vectorDb"
                  className={errors.vectorDB ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select a vector database" />
                </SelectTrigger>
                <SelectContent>
                  {KnowledgeBaseVectorDatabase.filter(
                    (db) => db.status === "Connected",
                  ).map((db) => (
                    <SelectItem key={db.id} value={db.name}>
                      {db.name} ({db.provider})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vectorDB && (
                <p className="text-xs text-destructive">{errors.vectorDB}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="embeddingModel">
                Embedding Model <span className="text-destructive">*</span>
              </Label>
              <Select value={embeddingModel} onValueChange={setEmbeddingModel}>
                <SelectTrigger
                  id="embeddingModel"
                  className={errors.embeddingModel ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select an embedding model" />
                </SelectTrigger>
                <SelectContent>
                  {KnowledgeBaseEmbeddingModels.filter(
                    (model) => model.status === "Active",
                  ).map((model) => (
                    <SelectItem key={model.id} value={model.name}>
                      {model.name} ({model.dimensions} dimensions)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.embeddingModel && (
                <p className="text-xs text-destructive">
                  {errors.embeddingModel}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <SampleButton
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </SampleButton>
            <SampleButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Knowledge Base"}
            </SampleButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
