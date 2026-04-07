"use client";

import { Button } from "@/components/ui/button";
import { SetupProgressRail } from "@/components/setup/progress-rail";
import {
  AgentStep,
  agentStepValid,
  buildCreateAgentRequest,
  defaultAgentStepData,
  SETUP_BLANK_TEMPLATE_ID,
  type AgentStepData,
} from "@/components/setup/steps/agent-step";
import {
  buildCredentialCreates,
  CredentialsStep,
  credentialsStepValid,
  defaultCredentialsData,
  type CredentialsStepData,
} from "@/components/setup/steps/credentials-step";
import {
  buildCreateSipNumberRequest,
  defaultPhoneStepData,
  PhoneStep,
  phoneStepValid,
  type PhoneStepData,
} from "@/components/setup/steps/phone-step";
import { TestCallStep } from "@/components/setup/steps/test-call-step";
import { useProjects } from "@/hooks/use-projects";
import { useResources } from "@/hooks/use-resources";
import { usePhoneNumbers } from "@/hooks/use-phone-numbers";
import {
  createAgentPipeline,
  getAgentPipeline,
  updateAgentPipeline,
} from "@/lib/services/agent-pipeline";
import {
  integrationKeys,
  phoneNumberKeys,
  pipelineKeys,
} from "@/lib/query-keys";
import {
  setOnboardingComplete,
  setOnboardingSkipped,
  setSetupWizardDismissedThisSession,
} from "@/lib/setup-onboarding";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Bot,
  Check,
  ChevronRight,
  Key,
  Phone,
  Wand2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

const STEPS = [
  {
    id: "welcome",
    number: 0,
    title: "Welcome to your studio",
    subtitle:
      "Let's get your first AI agent live — connect providers, create an agent, add a number, then run a quick test.",
    icon: Wand2,
  },
  {
    id: "credentials",
    number: 1,
    title: "Connect your AI providers",
    subtitle:
      "Add API keys for the LLM, speech recognition, and voice synthesis your agents will use.",
    icon: Key,
  },
  {
    id: "agent",
    number: 2,
    title: "Create your first agent",
    subtitle: "Pick a template and name your agent. You can refine prompts later in the editor.",
    icon: Bot,
  },
  {
    id: "phone",
    number: 3,
    title: "Import a phone number",
    subtitle:
      "Connect a number from your SIP trunk provider so outbound campaigns can use it as caller ID.",
    icon: Phone,
  },
  {
    id: "test",
    number: 4,
    title: "Make a test call",
    subtitle:
      "Run a simulated session to see transcript flow before you go live.",
    icon: Zap,
  },
  {
    id: "done",
    number: 5,
    title: "You're all set",
    subtitle:
      "Your studio is ready. Launch campaigns, monitor calls, and tune performance.",
    icon: Check,
  },
] as const;

const WELCOME_PREVIEW = STEPS.filter((s) => s.number >= 1 && s.number <= 4);

export function SetupWizard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { projects, loading: projectsLoading } = useProjects();
  const { createResource } = useResources({ page: 1, page_size: 1 });
  const { createNumber } = usePhoneNumbers({ page: 1, page_size: 1 });

  const [step, setStep] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [credentials, setCredentials] =
    useState<CredentialsStepData>(defaultCredentialsData);
  const [agent, setAgent] = useState<AgentStepData>(defaultAgentStepData);
  const [phone, setPhone] = useState<PhoneStepData>(defaultPhoneStepData);

  const goTo = useCallback((n: number) => {
    setTransitioning(true);
    window.setTimeout(() => {
      setStep(n);
      setTransitioning(false);
    }, 200);
  }, []);

  const firstProjectVid = projects[0]?.id;

  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) return credentialsStepValid(credentials);
    if (step === 2) {
      return (
        agentStepValid(agent) &&
        firstProjectVid !== undefined &&
        !projectsLoading
      );
    }
    if (step === 3) return phoneStepValid(phone);
    if (step === 4) return true;
    return true;
  };

  const persistStep = async (fromStep: number): Promise<boolean> => {
    setError(null);
    if (fromStep === 1) {
      const bodies = buildCredentialCreates(credentials);
      setBusy(true);
      try {
        for (const body of bodies) {
          await createResource(body);
        }
        await queryClient.invalidateQueries({
          queryKey: integrationKeys.resources.all,
        });
        return true;
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Could not save credentials."
        );
        return false;
      } finally {
        setBusy(false);
      }
    }
    if (fromStep === 2) {
      if (firstProjectVid === undefined) {
        setError("No project is available. Create a project in Console first.");
        return false;
      }
      setBusy(true);
      try {
        const req = buildCreateAgentRequest(agent, firstProjectVid);
        const created = await createAgentPipeline(req);
        if (
          agent.systemPrompt.trim() &&
          agent.templateId !== SETUP_BLANK_TEMPLATE_ID
        ) {
          const fresh = await getAgentPipeline(created.id);
          const graph_data = {
            ...fresh.graph_data,
            llm: {
              ...fresh.graph_data?.llm,
              system_messages: [
                {
                  role: "system",
                  content: agent.systemPrompt.trim(),
                },
              ],
            },
          };
          await updateAgentPipeline(Number(created.id), { graph_data });
        }
        await queryClient.invalidateQueries({ queryKey: pipelineKeys.all });
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not create agent.");
        return false;
      } finally {
        setBusy(false);
      }
    }
    if (fromStep === 3) {
      setBusy(true);
      try {
        const body = buildCreateSipNumberRequest(phone);
        await createNumber(body);
        await queryClient.invalidateQueries({
          queryKey: phoneNumberKeys.all,
        });
        return true;
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Could not save phone number."
        );
        return false;
      } finally {
        setBusy(false);
      }
    }
    return true;
  };

  const handleNext = async () => {
    if (step >= 5) return;
    if (step > 0 && step < 5) {
      const ok = await persistStep(step);
      if (!ok) return;
    }
    if (step === 4) {
      setOnboardingComplete();
      setSetupWizardDismissedThisSession();
    }
    goTo(step + 1);
  };

  const handleSkip = () => {
    setSetupWizardDismissedThisSession();
    setOnboardingSkipped();
    router.push("/dashboard");
  };

  const handleDoneDashboard = () => {
    setSetupWizardDismissedThisSession();
    setOnboardingComplete();
    router.push("/dashboard");
  };

  const meta = STEPS[step];
  const Icon = meta.icon;

  return (
    <div className="mx-auto max-w-[560px] px-4 py-10 sm:px-6">
      {step > 0 && step < 5 ? (
        <SetupProgressRail currentStep={step} />
      ) : null}

      <div
        className={cn(
          "duration-200 ease-out",
          transitioning ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
        )}
      >
        <div className="mb-2 flex items-start gap-3.5">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--studio-teal)]",
              step === 5
                ? "bg-[color-mix(in_oklch,var(--studio-teal)_14%,transparent)]"
                : "bg-[color-mix(in_oklch,var(--studio-teal)_8%,transparent)]"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 pt-0.5">
            <h1 className="font-heading text-xl font-semibold tracking-tight text-[var(--studio-ink)]">
              {meta.title}
            </h1>
          </div>
        </div>
        <p className="mb-7 text-sm leading-relaxed text-[var(--studio-ink-muted)] sm:pl-[3.25rem]">
          {meta.subtitle}
        </p>

        {error ? (
          <div
            className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive sm:pl-[3.25rem]"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        {step === 0 ? (
          <div className="sm:pl-[3.25rem]">
            <div className="mb-7 overflow-hidden rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface)]">
              {WELCOME_PREVIEW.map((s) => {
                const SIcon = s.icon;
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-3.5 border-b border-[var(--studio-border)] px-4 py-3.5 last:border-b-0"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--studio-surface-muted)] text-[var(--studio-ink-muted)]">
                      <SIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[var(--studio-ink)]">
                        {s.title}
                      </p>
                      <p className="text-[0.6875rem] text-[var(--studio-ink-muted)]">
                        Step {s.number} of 4
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              className="mt-4 text-left text-xs text-[var(--studio-ink-muted)] underline decoration-[var(--studio-border)] underline-offset-4 hover:text-[var(--studio-ink)]"
              onClick={handleSkip}
            >
              Skip for now — go to overview
            </button>
          </div>
        ) : null}

        {step === 1 ? (
          <CredentialsStep data={credentials} onChange={setCredentials} />
        ) : null}
        {step === 2 ? (
          <div>
            {!projectsLoading && projects.length === 0 ? (
              <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
                No projects found. The studio needs at least one project to
                create an agent. Check your API / Console configuration, then
                refresh.
              </p>
            ) : null}
            <AgentStep data={agent} onChange={setAgent} />
          </div>
        ) : null}
        {step === 3 ? <PhoneStep data={phone} onChange={setPhone} /> : null}
        {step === 4 ? (
          <TestCallStep agentName={agent.agentName || "My Agent"} />
        ) : null}

        {step === 5 ? (
          <div className="space-y-6 sm:pl-[3.25rem]">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Link
                href="/dashboard/campaign/new"
                className="group rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-4 transition-colors hover:border-[var(--studio-ink-muted)]"
              >
                <p className="text-sm font-medium text-[var(--studio-ink)]">
                  Launch a campaign
                </p>
                <p className="mt-0.5 text-[0.6875rem] text-[var(--studio-ink-muted)]">
                  Start outbound calling
                </p>
                <p className="mt-2 flex items-center gap-1 text-[0.6875rem] font-medium text-[var(--studio-teal)]">
                  Go to campaigns
                  <ChevronRight className="h-3.5 w-3.5" />
                </p>
              </Link>
              <Link
                href="/dashboard/agents"
                className="group rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-4 transition-colors hover:border-[var(--studio-ink-muted)]"
              >
                <p className="text-sm font-medium text-[var(--studio-ink)]">
                  Edit your agent
                </p>
                <p className="mt-0.5 text-[0.6875rem] text-[var(--studio-ink-muted)]">
                  Refine prompts and voice
                </p>
                <p className="mt-2 flex items-center gap-1 text-[0.6875rem] font-medium text-[var(--studio-teal)]">
                  Open agents
                  <ChevronRight className="h-3.5 w-3.5" />
                </p>
              </Link>
              <Link
                href="/dashboard/analytics"
                className="group rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-4 transition-colors hover:border-[var(--studio-ink-muted)]"
              >
                <p className="text-sm font-medium text-[var(--studio-ink)]">
                  View analytics
                </p>
                <p className="mt-0.5 text-[0.6875rem] text-[var(--studio-ink-muted)]">
                  Monitor call performance
                </p>
                <p className="mt-2 flex items-center gap-1 text-[0.6875rem] font-medium text-[var(--studio-teal)]">
                  Open analytics
                  <BarChart3 className="h-3.5 w-3.5 opacity-80" />
                </p>
              </Link>
              <Link
                href="/dashboard/phone-numbers"
                className="group rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-4 transition-colors hover:border-[var(--studio-ink-muted)]"
              >
                <p className="text-sm font-medium text-[var(--studio-ink)]">
                  Import more numbers
                </p>
                <p className="mt-0.5 text-[0.6875rem] text-[var(--studio-ink-muted)]">
                  Add numbers for scale
                </p>
                <p className="mt-2 flex items-center gap-1 text-[0.6875rem] font-medium text-[var(--studio-teal)]">
                  Phone numbers
                  <ChevronRight className="h-3.5 w-3.5" />
                </p>
              </Link>
            </div>
            <Button
              type="button"
              className="w-full rounded-xl bg-[var(--studio-teal)] text-[var(--studio-ink)] hover:opacity-90 sm:w-auto"
              onClick={handleDoneDashboard}
            >
              Go to overview
            </Button>
          </div>
        ) : null}

        <div
          className={cn(
            "mt-8 flex items-center gap-3",
            step === 0 ? "justify-start sm:pl-[3.25rem]" : "justify-between",
            step === 5 && "hidden"
          )}
        >
          {step > 0 && step < 5 ? (
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-[var(--studio-border)]"
              onClick={() => goTo(step - 1)}
              disabled={busy}
            >
              Back
            </Button>
          ) : (
            <span />
          )}
          {step < 5 ? (
            <Button
              type="button"
              className="rounded-xl bg-[var(--studio-teal)] text-[var(--studio-ink)] hover:opacity-90"
              disabled={!canProceed() || busy}
              onClick={() => void handleNext()}
            >
              {step === 0
                ? "Get started"
                : step === 4
                  ? "Finish setup"
                  : "Continue"}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : null}
        </div>

        {step > 0 && step < 5 ? (
          <button
            type="button"
            className="mt-4 text-left text-xs text-[var(--studio-ink-muted)] underline decoration-[var(--studio-border)] underline-offset-4 hover:text-[var(--studio-ink)]"
            onClick={handleSkip}
          >
            Skip setup — I&apos;ll configure later
          </button>
        ) : null}
      </div>
    </div>
  );
}
