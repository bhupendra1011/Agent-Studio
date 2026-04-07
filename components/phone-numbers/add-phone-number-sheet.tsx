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
import { Lightbulb, Loader2, Plus } from "lucide-react";
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
  { value: "tcp", label: "TCP" },
  { value: "udp", label: "UDP" },
  { value: "tls", label: "TLS" },
];

function readInitialFields(initial: SipNumber | null | undefined, mode: "create" | "edit") {
  if (mode === "edit" && initial) {
    const t = initial.config?.outbound_configs?.transport;
    const transport: SipTransport =
      t === "udp" || t === "tls" || t === "tcp" ? t : "tcp";
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
    transport: "tcp" as SipTransport,
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
            : "Provision an outbound caller ID for campaigns and outbound APIs."}
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              Vendor{" "}
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
              className="rounded-xl border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/50"
              aria-invalid={Boolean(errors.sipDomain)}
            />
            {errors.sipDomain ? (
              <p className="text-xs text-destructive">{errors.sipDomain}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[var(--studio-ink)]">SIP trunk username</Label>
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
            <Label className="text-[var(--studio-ink)]">SIP trunk password</Label>
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

        <div className="space-y-2">
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
              Choose the protocol for SIP signaling to your provider.
            </p>
          )}
        </div>

        <div className="flex gap-3 rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/40 p-4">
          <Lightbulb
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--studio-teal)]"
            aria-hidden
          />
          <p className="text-sm text-[var(--studio-ink-muted)]">
            Need help? See{" "}
            <a
              href="https://docs.agora.io/en/conversational-ai/overview/product-overview"
              className="font-medium text-[var(--studio-teal)] underline-offset-2 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              telephony documentation
            </a>{" "}
            for SIP trunk setup (replace with your white-label docs when ready).
          </p>
        </div>
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
