"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

export interface CreateKnowledgeBaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: {
    name: string;
    description?: string;
    files?: File[];
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export function CreateKnowledgeBaseModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: CreateKnowledgeBaseModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setName("");
    setDescription("");
    setFiles([]);
  }, [open]);

  const onPickFiles = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files;
      if (!list?.length) return;
      setFiles(Array.from(list));
    },
    []
  );

  const handleSave = async () => {
    if (!name.trim()) return;
    await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      files: files.length ? files : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-[var(--studio-border)] bg-[var(--studio-surface)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-syne)] text-lg">
            Create knowledge base
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="kb-name">
                Name <span className="text-red-600">*</span>
              </Label>
              <Input
                id="kb-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Compliance laws"
                className="rounded-xl border-[var(--studio-border)]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="kb-desc">Description</Label>
              <Input
                id="kb-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                className="rounded-xl border-[var(--studio-border)]"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <Label>Files ({files.length})</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => inputRef.current?.click()}
              >
                Browse files
              </Button>
            </div>
            <p className="text-xs text-[var(--studio-ink-muted)]">
              Maximum file size: 20 MB. Supported: PDF, DOCX.
            </p>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={onPickFiles}
            />
            <div
              className={cn(
                "flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50 px-4 py-6 text-center text-sm text-[var(--studio-ink-muted)]"
              )}
            >
              {files.length === 0 ? (
                <span>Drag and drop is not wired in this build—use Browse files.</span>
              ) : (
                <ul className="w-full list-inside list-disc text-left text-[var(--studio-ink)]">
                  {files.map((f) => (
                    <li key={f.name + f.size}>{f.name}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 border-0 bg-transparent p-0 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-xl bg-[var(--studio-teal)] text-[var(--studio-ink)] hover:opacity-90"
            disabled={isSubmitting || !name.trim()}
            onClick={() => void handleSave()}
          >
            {isSubmitting ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
