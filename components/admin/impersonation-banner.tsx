"use client";

import { Button } from "@/components/ui/button";
import {
  clearImpersonation,
  IMPERSONATION_STORAGE_KEY,
  readImpersonation,
} from "@/lib/impersonation-storage";
import { Eye } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function ImpersonationBanner() {
  const [label, setLabel] = useState<string | null>(null);

  const sync = useCallback(() => {
    setLabel(readImpersonation()?.label ?? null);
  }, []);

  useEffect(() => {
    sync();
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === IMPERSONATION_STORAGE_KEY) sync();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [sync]);

  const exit = () => {
    clearImpersonation();
    setLabel(null);
    window.dispatchEvent(new Event("studio-impersonation-change"));
  };

  useEffect(() => {
    const onCustom = () => sync();
    window.addEventListener("studio-impersonation-change", onCustom);
    return () => window.removeEventListener("studio-impersonation-change", onCustom);
  }, [sync]);

  if (!label) return null;

  return (
    <div className="flex items-center justify-center gap-3 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-950 dark:text-amber-100">
      <Eye className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300" />
      <span>
        <span className="font-medium">Viewing as</span>{" "}
        <span className="font-semibold">{label}</span>
        <span className="text-amber-800/80 dark:text-amber-200/80">
          {" "}
          — UI only; API calls still use your session.
        </span>
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0 rounded-lg border-amber-600/40 bg-transparent text-amber-900 hover:bg-amber-500/15 dark:text-amber-100"
        onClick={exit}
      >
        Exit
      </Button>
    </div>
  );
}
