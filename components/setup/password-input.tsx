"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function SetupPasswordInput({
  id,
  value,
  onChange,
  placeholder,
  className,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={cn(
          "rounded-xl border-[var(--studio-border)] bg-[var(--studio-surface)] pr-10 font-mono text-sm",
          className
        )}
      />
      <button
        type="button"
        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-[var(--studio-ink-muted)] hover:bg-[var(--studio-surface-muted)] hover:text-[var(--studio-ink)]"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide value" : "Show value"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
