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
import { Textarea } from "@/components/ui/textarea";
import { deployAgentPipeline } from "@/lib/services/agent-pipeline";
import type { AgentPipeline } from "@/lib/types/api";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Rocket,
} from "lucide-react";
import { useCallback, useState } from "react";

interface DeployDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipeline: AgentPipeline;
  onDeployed: () => void;
}

type DeployStep = "configure" | "deploying" | "success" | "error";

export function DeployDialog({
  open,
  onOpenChange,
  pipeline,
  onDeployed,
}: DeployDialogProps) {
  const [step, setStep] = useState<DeployStep>("configure");
  const [note, setNote] = useState("");
  const [vidInput, setVidInput] = useState(pipeline.vid?.toString() ?? "");
  const [errorMsg, setErrorMsg] = useState("");

  const isRepublish = pipeline.deploy_status === 1;

  const handleDeploy = useCallback(async () => {
    setStep("deploying");
    try {
      await deployAgentPipeline(pipeline.id, {
        vids: vidInput.trim() ? [vidInput.trim()] : [],
        note: note.trim() || undefined,
      });
      setStep("success");
      onDeployed();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Deployment failed");
      setStep("error");
    }
  }, [pipeline.id, vidInput, note, onDeployed]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setTimeout(() => {
      setStep("configure");
      setNote("");
      setErrorMsg("");
    }, 200);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="border-[var(--studio-border)] bg-[var(--studio-surface)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-syne)] text-[var(--studio-ink)]">
            {isRepublish ? "Republish Agent" : "Deploy Agent"}
          </DialogTitle>
        </DialogHeader>

        {step === "configure" && (
          <div className="space-y-5 py-2">
            {/* Agent Info */}
            <div className="rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50 p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-[var(--studio-ink-muted)]">
                    Agent
                  </div>
                  <div className="font-medium text-[var(--studio-ink)]">
                    {pipeline.name}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--studio-ink-muted)]">
                    Pipeline ID
                  </div>
                  <div className="font-mono text-xs text-[var(--studio-ink)]">
                    {pipeline.id}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--studio-ink-muted)]">
                    Project
                  </div>
                  <div className="text-[var(--studio-ink)]">
                    {pipeline.project_name ?? "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--studio-ink-muted)]">
                    Version
                  </div>
                  <div className="text-[var(--studio-ink)]">
                    {pipeline.current_pipeline_version ?? "v1"}
                  </div>
                </div>
              </div>
            </div>

            {/* VID / Project */}
            <div>
              <Label className="mb-1.5 text-xs text-[var(--studio-ink-muted)]">
                Target VID (Agora Project)
              </Label>
              <Input
                value={vidInput}
                onChange={(e) => setVidInput(e.target.value)}
                placeholder="e.g., 1234567"
                className="rounded-xl border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50"
              />
            </div>

            {/* Note */}
            <div>
              <Label className="mb-1.5 text-xs text-[var(--studio-ink-muted)]">
                Deployment Note (optional)
              </Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What changed in this version?"
                className="min-h-[80px] resize-y rounded-xl border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50 text-sm"
              />
            </div>

            {/* Cost hint */}
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Billing for ASR, LLM, TTS, and agent hosting will be tracked under
                the selected project. Review{" "}
                <a
                  href="https://docs.agora.io/en/conversational-ai/studio/deploy/deploy-agent"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  deployment docs
                </a>{" "}
                for details.
              </p>
            </div>
          </div>
        )}

        {step === "deploying" && (
          <div className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="h-10 w-10 animate-spin text-[var(--studio-teal)]" />
            <p className="text-sm text-[var(--studio-ink-muted)]">
              {isRepublish ? "Republishing" : "Deploying"} agent…
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[var(--studio-ink)]">
                Agent {isRepublish ? "republished" : "deployed"} successfully
              </p>
              <p className="mt-1 text-xs text-[var(--studio-ink-muted)]">
                Your agent is now live and ready to handle calls.
              </p>
            </div>
          </div>
        )}

        {step === "error" && (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-red-500">
                Deployment failed
              </p>
              <p className="mt-1 text-xs text-[var(--studio-ink-muted)]">
                {errorMsg}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step === "configure" && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => void handleDeploy()}
                className={cn(
                  "rounded-xl text-white",
                  isRepublish
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-[var(--studio-teal)] hover:opacity-90"
                )}
              >
                <Rocket className="mr-1.5 h-4 w-4" />
                {isRepublish ? "Republish" : "Deploy"}
              </Button>
            </>
          )}
          {(step === "success" || step === "error") && (
            <Button
              type="button"
              onClick={handleClose}
              className="rounded-xl bg-[var(--studio-teal)] text-white hover:opacity-90"
            >
              {step === "success" ? "Done" : "Close"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
