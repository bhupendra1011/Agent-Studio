"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type {
  CreateSipNumberRequest,
  SipNumber,
  SipNumberConfig,
  SipTransport,
  UpdateSipNumberRequest,
} from "@/lib/types/api";
import { cn } from "@/lib/utils";
import { ChevronDown, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

const SOURCE_SIP_TRUNK = "twilio" as const;

const formSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[+\d][\d\s().-]{2,}$/, "Enter a valid phone number"),
  displayName: z.string().min(1, "Display name is required"),
  sipDomain: z
    .string()
    .min(1, "SIP trunk address is required")
    .regex(
      /^((([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,})|((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}))(:(6553[0-5]|655[0-2]\d|65[0-4]\d{2}|6[0-4]\d{3}|[1-5]?\d{1,4}))?$/,
      "Enter a valid host or IP (optionally with port)"
    ),
  username: z
    .string()
    .optional()
    .refine((v) => !v || /^[a-zA-Z0-9]+$/.test(v), {
      message: "Username must be alphanumeric",
    }),
  password: z.string().optional(),
  transport: z.enum(["tcp", "udp", "tls"]),
});

export type PhoneNumberFormValues = z.infer<typeof formSchema>;

export interface AddPhoneNumberSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial?: SipNumber | null;
  isSubmitting?: boolean;
  onCreate: (body: CreateSipNumberRequest) => Promise<void>;
  onUpdate: (id: string, body: UpdateSipNumberRequest) => Promise<void>;
}

const TRANSPORTS: { value: SipTransport; label: string }[] = [
  { value: "udp", label: "UDP" },
  { value: "tcp", label: "TCP" },
  { value: "tls", label: "TLS" },
];

type SipProviderId = "twilio" | "telnyx" | "exotel" | "other";

const SIP_PROVIDERS: {
  id: SipProviderId;
  label: string;
  defaultHost: string;
  hint: string;
}[] = [
  {
    id: "twilio",
    label: "Twilio",
    defaultHost: "sip.twilio.com",
    hint: "Find SIP trunk credentials in the Twilio Console under Elastic SIP Trunking → Trunks.",
  },
  {
    id: "telnyx",
    label: "Telnyx",
    defaultHost: "sip.telnyx.com",
    hint: "Get SIP credentials from the Telnyx Portal under SIP Connections.",
  },
  {
    id: "exotel",
    label: "Exotel",
    defaultHost: "",
    hint: "Use the SIP endpoint Exotel provides for your region (see Exotel docs).",
  },
  {
    id: "other",
    label: "Other SIP",
    defaultHost: "",
    hint: "Enter your carrier’s SIP trunk host and optional credentials below.",
  },
];

function inferSipProvider(host: string): SipProviderId {
  const h = host.toLowerCase();
  if (h.includes("twilio")) return "twilio";
  if (h.includes("telnyx")) return "telnyx";
  if (h.includes("exotel")) return "exotel";
  return "other";
}

function readInitialFields(initial: SipNumber | null | undefined, mode: "create" | "edit") {
  if (mode === "edit" && initial) {
    const t = initial.config?.outbound_configs?.transport;
    const transport: SipTransport =
      t === "udp" || t === "tls" || t === "tcp" ? t : "udp";
    return {
      phoneNumber: initial.phone_number ?? "",
      displayName: initial.description ?? "",
      sipDomain: initial.config?.outbound_configs?.address ?? "",
      username: initial.config?.outbound_configs?.user ?? "",
      password: initial.config?.outbound_configs?.password ?? "",
      transport,
    };
  }
  return {
    phoneNumber: "",
    displayName: "",
    sipDomain: "",
    username: "",
    password: "",
    transport: "udp" as SipTransport,
  };
}

/** Mounted only while `open` is true so state always matches the current mode/row. */
function PhoneNumberSheetForm({
  mode,
  initial,
  isSubmitting,
  onCreate,
  onUpdate,
}: Omit<AddPhoneNumberSheetProps, "open" | "onOpenChange">) {
  const start = readInitialFields(initial ?? null, mode);
  const [phoneNumber, setPhoneNumber] = useState(start.phoneNumber);
  const [displayName, setDisplayName] = useState(start.displayName);
  const [sipDomain, setSipDomain] = useState(start.sipDomain);
  const [username, setUsername] = useState(start.username);
  const [password, setPassword] = useState(start.password);
  const [transport, setTransport] = useState<SipTransport>(start.transport);
  const [sipProvider, setSipProvider] = useState<SipProviderId | null>(() =>
    mode === "edit" && start.sipDomain
      ? inferSipProvider(start.sipDomain)
      : mode === "edit"
        ? "other"
        : null
  );
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const buildConfig = (): SipNumberConfig => {
    const outbound_configs: NonNullable<
      SipNumberConfig["outbound_configs"]
    > = {
      address: sipDomain.trim(),
      transport,
    };
    if (username.trim()) outbound_configs.user = username.trim();
    if (password.trim()) outbound_configs.password = password.trim();

    return { outbound_configs };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "create" && !sipProvider) {
      setErrors({ sipProvider: "Select your SIP trunk provider." });
      return;
    }
    const parsed = formSchema.safeParse({
      phoneNumber: phoneNumber.replace(/[\s-]/g, ""),
      displayName: displayName.trim(),
      sipDomain: sipDomain.trim(),
      username: username.trim() || undefined,
      password: password.trim() || undefined,
      transport,
    });

    if (!parsed.success) {
      const next: Partial<Record<string, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    const config = buildConfig();

    if (mode === "edit" && initial) {
      await onUpdate(initial.id, {
        description: parsed.data.displayName,
        config,
      });
    } else {
      await onCreate({
        number: parsed.data.phoneNumber,
        source: SOURCE_SIP_TRUNK,
        description: parsed.data.displayName,
        config,
      });
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex h-full flex-col">
      <SheetHeader className="border-b border-[var(--studio-border)] px-6 py-5">
        <SheetTitle className="font-heading text-lg text-[var(--studio-ink)]">
          {mode === "edit" ? "Edit phone number" : "Add phone number"}
        </SheetTitle>
        <SheetDescription className="text-[var(--studio-ink-muted)]">
          {mode === "edit"
            ? "Update display name and SIP trunk settings."
            : "Pick your carrier — we’ll pre-fill common SIP settings. Advanced options stay tucked away."}
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6">
        {mode === "create" ? (
          <div className="space-y-2">
            <Label className="text-[var(--studio-ink)]">
              SIP provider{" "}
              <span className="text-destructive" aria-hidden>
                *
              </span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {SIP_PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSipProvider(p.id);
                    setErrors((e) => {
                      const { sipProvider: _, ...rest } = e;
                      return rest;
                    });
                    if (p.defaultHost) setSipDomain(p.defaultHost);
                    else setSipDomain("");
                    setTransport("udp");
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 text-left text-sm font-medium transition-colors",
                    sipProvider === p.id
                      ? "border-[var(--studio-teal)] bg-[color-mix(in_oklch,var(--studio-teal)_10%,transparent)] text-[var(--studio-ink)]"
                      : "border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/40 text-[var(--studio-ink-muted)] hover:border-[var(--studio-ink-muted)]"
                  )}
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                    style={{
                      backgroundColor:
                        p.id === "twilio"
                          ? "#F22F46"
                          : p.id === "telnyx"
                            ? "#00C08B"
                            : p.id === "exotel"
                              ? "#4F46E5"
                              : "#64748B",
                    }}
                  >
                    {p.label[0]}
                  </span>
                  {p.label}
                </button>
              ))}
            </div>
            {errors.sipProvider ? (
              <p className="text-xs text-destructive">{errors.sipProvider}</p>
            ) : null}
          </div>
        ) : null}

        {mode === "create" && sipProvider && (
          <div className="rounded-xl border border-[var(--studio-teal)]/25 bg-[color-mix(in_oklch,var(--studio-teal)_6%,transparent)] px-3 py-2.5 text-xs leading-relaxed text-[var(--studio-teal)]">
            {SIP_PROVIDERS.find((x) => x.id === sipProvider)?.hint}
          </div>
        )}

        {mode === "edit" && sipProvider ? (
          <p className="text-xs text-[var(--studio-ink-muted)]">
            {SIP_PROVIDERS.find((x) => x.id === sipProvider)?.hint}
          </p>
        ) : null}

        <div
          className={cn(
            "grid grid-cols-1 gap-4 md:grid-cols-2",
            mode === "create" && !sipProvider && "pointer-events-none opacity-40"
          )}
        >
          <div className="space-y-1.5">
            <Label className="text-[var(--studio-ink)]">
              Phone number{" "}
              <span className="text-destructive" aria-hidden>
                *
              </span>
            </Label>
            <Input
              value={phoneNumber}
              disabled={mode === "edit"}
              onChange={(e) =>
                setPhoneNumber(e.target.value.replace(/[\s-]/g, ""))
              }
              placeholder="+1234567890"
              className="rounded-xl border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50"
              aria-invalid={Boolean(errors.phoneNumber)}
            />
            {errors.phoneNumber ? (
              <p className="text-xs text-destructive">{errors.phoneNumber}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[var(--studio-ink)]">
              Resource label{" "}
              <span className="text-destructive" aria-hidden>
                *
              </span>
            </Label>
            <Select value={SOURCE_SIP_TRUNK} disabled>
              <SelectTrigger className="h-10 w-full rounded-xl border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50 opacity-80">
                <SelectValue>SIP Trunk</SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value={SOURCE_SIP_TRUNK} className="rounded-lg">
                  SIP Trunk
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-[var(--studio-ink)]">
              Display name{" "}
              <span className="text-destructive" aria-hidden>
                *
              </span>
            </Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Friendly name for your team"
              className="rounded-xl border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50"
              aria-invalid={Boolean(errors.displayName)}
            />
            {errors.displayName ? (
              <p className="text-xs text-destructive">{errors.displayName}</p>
            ) : null}
          </div>
        </div>

        {mode === "edit" || sipProvider ? (
          <details className="group rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/20">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium text-[var(--studio-ink)] [&::-webkit-details-marker]:hidden">
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
              Advanced SIP settings
            </summary>
            <div className="grid grid-cols-1 gap-4 border-t border-[var(--studio-border)] px-4 py-4 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-[var(--studio-ink)]">
                  SIP trunk address{" "}
                  <span className="text-destructive" aria-hidden>
                    *
                  </span>
                </Label>
                <Input
                  value={sipDomain}
                  onChange={(e) => setSipDomain(e.target.value)}
                  placeholder="sip.example.com"
                  readOnly={
                    mode === "create" &&
                    (sipProvider === "twilio" || sipProvider === "telnyx")
                  }
                  className={cn(
                    "rounded-xl border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50",
                    mode === "create" &&
                      (sipProvider === "twilio" || sipProvider === "telnyx")
                      ? "opacity-90"
                      : ""
                  )}
                  aria-invalid={Boolean(errors.sipDomain)}
                />
                {errors.sipDomain ? (
                  <p className="text-xs text-destructive">{errors.sipDomain}</p>
                ) : null}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-[var(--studio-ink)]">
                  Transport protocol{" "}
                  <span className="text-destructive" aria-hidden>
                    *
                  </span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {TRANSPORTS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTransport(value)}
                      className={cn(
                        "rounded-xl border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        transport === value
                          ? "border-[var(--studio-teal)] bg-[var(--studio-teal)]/15 text-[var(--studio-ink)]"
                          : "border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/40 text-[var(--studio-ink-muted)] hover:bg-[var(--studio-surface-muted)]"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {errors.transport ? (
                  <p className="text-xs text-destructive">{errors.transport}</p>
                ) : (
                  <p className="text-xs text-[var(--studio-ink-muted)]">
                    UDP is the most common default for many trunks.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-[var(--studio-ink)]">SIP username</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Optional"
                  autoComplete="off"
                  className="rounded-xl border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50"
                  aria-invalid={Boolean(errors.username)}
                />
                {errors.username ? (
                  <p className="text-xs text-destructive">{errors.username}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label className="text-[var(--studio-ink)]">SIP password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Optional"
                  autoComplete="new-password"
                  className="rounded-xl border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50"
                />
              </div>
            </div>
          </details>
        ) : null}
      </div>

      <SheetFooter className="border-t border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/30 px-6 py-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full rounded-xl bg-[var(--studio-teal)] text-[var(--studio-ink)] hover:opacity-90"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              {mode === "create" ? (
                <Plus className="mr-2 size-4" aria-hidden />
              ) : null}
              {mode === "edit" ? "Save changes" : "Add phone number"}
            </>
          )}
        </Button>
      </SheetFooter>
    </form>
  );
}

export function AddPhoneNumberSheet({
  open,
  onOpenChange,
  mode,
  initial,
  isSubmitting,
  onCreate,
  onUpdate,
}: AddPhoneNumberSheetProps) {
  const formMountKey = `${mode}-${initial?.id ?? "new"}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="h-full w-full max-w-xl gap-0 border-[var(--studio-border)] bg-[var(--studio-surface)] p-0 sm:max-w-xl"
      >
        {open ? (
          <PhoneNumberSheetForm
            key={formMountKey}
            mode={mode}
            initial={initial}
            isSubmitting={isSubmitting}
            onCreate={onCreate}
            onUpdate={onUpdate}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
