"use client";

import { SetupPasswordInput } from "@/components/setup/password-input";
import type { CreateSipNumberRequest, SipTransport } from "@/lib/types/api";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useMemo } from "react";

export type SipProviderId = "twilio" | "telnyx" | "exotel" | "other";

const PROVIDERS: {
  id: SipProviderId;
  name: string;
  brand: string;
  defaultHost: string;
  help: string;
}[] = [
  {
    id: "twilio",
    name: "Twilio",
    brand: "#F22F46",
    defaultHost: "sip.twilio.com",
    help: "Find SIP trunk credentials in Twilio Console → Elastic SIP Trunking → Trunks.",
  },
  {
    id: "telnyx",
    name: "Telnyx",
    brand: "#00C08B",
    defaultHost: "sip.telnyx.com",
    help: "Get SIP credentials from Telnyx Portal under SIP Connections.",
  },
  {
    id: "exotel",
    name: "Exotel",
    brand: "#4F46E5",
    defaultHost: "",
    help: "Use the SIP endpoint Exotel provides for your region.",
  },
  {
    id: "other",
    name: "Other SIP",
    brand: "#64748B",
    defaultHost: "",
    help: "Enter your provider’s SIP trunk host and optional credentials.",
  },
];

export interface PhoneStepData {
  sipProvider: SipProviderId | null;
  phoneNumber: string;
  displayName: string;
  sipAddress: string;
  transport: SipTransport;
  sipUser: string;
  sipPassword: string;
}

export const defaultPhoneStepData: PhoneStepData = {
  sipProvider: null,
  phoneNumber: "",
  displayName: "",
  sipAddress: "",
  transport: "udp",
  sipUser: "",
  sipPassword: "",
};

export function PhoneStep({
  data,
  onChange,
}: {
  data: PhoneStepData;
  onChange: (next: PhoneStepData) => void;
}) {
  const selected = useMemo(
    () => PROVIDERS.find((p) => p.id === data.sipProvider),
    [data.sipProvider]
  );

  return (
    <div>
      <p className="mb-4 text-sm leading-relaxed text-[var(--studio-ink-muted)]">
        Select your SIP trunk provider. We&apos;ll suggest connection settings
        — you can adjust them under advanced settings.
      </p>
      <div className="mb-5 grid grid-cols-2 gap-2">
        {PROVIDERS.map((p) => {
          const active = data.sipProvider === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() =>
                onChange({
                  ...data,
                  sipProvider: p.id,
                  sipAddress:
                    p.id === "twilio"
                      ? "sip.twilio.com"
                      : p.id === "telnyx"
                        ? "sip.telnyx.com"
                        : "",
                  transport: "udp",
                })
              }
              className={cn(
                "flex items-center gap-3 rounded-xl border p-4 text-left transition-colors",
                active
                  ? "border-[var(--studio-teal)] bg-[color-mix(in_oklch,var(--studio-teal)_8%,transparent)]"
                  : "border-[var(--studio-border)] bg-[var(--studio-surface)] hover:border-[var(--studio-ink-muted)]"
              )}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: `${p.brand}cc` }}
              >
                {p.name[0]}
              </span>
              <span className="text-sm font-medium text-[var(--studio-ink)]">
                {p.name}
              </span>
            </button>
          );
        })}
      </div>

      {data.sipProvider ? (
        <div className="duration-200 animate-in fade-in slide-in-from-bottom-2 rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface)] p-4">
          {data.sipProvider !== "other" ? (
            <div className="mb-4 rounded-lg border border-[var(--studio-teal)]/20 bg-[color-mix(in_oklch,var(--studio-teal)_6%,transparent)] px-3.5 py-3 text-xs leading-relaxed text-[var(--studio-teal)]">
              SIP trunk address{" "}
              {data.sipProvider === "exotel"
                ? "— enter the host Exotel gave you."
                : `pre-filled for ${selected?.name}.`}{" "}
              Add your number and display name below.
            </div>
          ) : null}

          {selected ? (
            <p className="mb-4 text-xs text-[var(--studio-ink-muted)]">
              {selected.help}
            </p>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="setup-phone-e164"
                className="mb-1 block text-xs text-[var(--studio-ink-muted)]"
              >
                Phone number
              </label>
              <input
                id="setup-phone-e164"
                value={data.phoneNumber}
                onChange={(e) =>
                  onChange({ ...data, phoneNumber: e.target.value })
                }
                placeholder="+1234567890"
                className="h-10 w-full rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-muted)] px-3 text-sm text-[var(--studio-ink)]"
              />
            </div>
            <div>
              <label
                htmlFor="setup-phone-label"
                className="mb-1 block text-xs text-[var(--studio-ink-muted)]"
              >
                Display name
              </label>
              <input
                id="setup-phone-label"
                value={data.displayName}
                onChange={(e) =>
                  onChange({ ...data, displayName: e.target.value })
                }
                placeholder="Main line"
                className="h-10 w-full rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-muted)] px-3 text-sm text-[var(--studio-ink)]"
              />
            </div>
          </div>

          <details className="group mt-4">
            <summary className="flex cursor-pointer list-none items-center gap-1 text-xs text-[var(--studio-ink-muted)] [&::-webkit-details-marker]:hidden">
              <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
              Advanced SIP settings
            </summary>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="setup-sip-host"
                  className="mb-1 block text-xs text-[var(--studio-ink-muted)]"
                >
                  SIP trunk address
                </label>
                <input
                  id="setup-sip-host"
                  value={
                    data.sipProvider === "twilio"
                      ? "sip.twilio.com"
                      : data.sipProvider === "telnyx"
                        ? "sip.telnyx.com"
                        : data.sipAddress
                  }
                  onChange={(e) =>
                    onChange({ ...data, sipAddress: e.target.value })
                  }
                  readOnly={
                    data.sipProvider === "twilio" ||
                    data.sipProvider === "telnyx"
                  }
                  placeholder="sip.example.com"
                  className={cn(
                    "h-10 w-full rounded-xl border border-[var(--studio-border)] px-3 text-sm",
                    data.sipProvider === "twilio" ||
                      data.sipProvider === "telnyx"
                      ? "bg-[var(--studio-surface-muted)]/80 text-[var(--studio-ink-muted)]"
                      : "bg-[var(--studio-surface-muted)] text-[var(--studio-ink)]"
                  )}
                />
              </div>
              <div>
                <span className="mb-1 block text-xs text-[var(--studio-ink-muted)]">
                  Transport
                </span>
                <div className="flex gap-1.5">
                  {(["udp", "tcp", "tls"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => onChange({ ...data, transport: t })}
                      className={cn(
                        "flex-1 rounded-lg border py-2 text-xs font-medium capitalize transition-colors",
                        data.transport === t
                          ? "border-[var(--studio-teal)] bg-[color-mix(in_oklch,var(--studio-teal)_10%,transparent)] text-[var(--studio-teal)]"
                          : "border-[var(--studio-border)] bg-[var(--studio-surface-muted)] text-[var(--studio-ink-muted)]"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label
                  htmlFor="setup-sip-user"
                  className="mb-1 block text-xs text-[var(--studio-ink-muted)]"
                >
                  SIP username
                </label>
                <input
                  id="setup-sip-user"
                  value={data.sipUser}
                  onChange={(e) =>
                    onChange({ ...data, sipUser: e.target.value })
                  }
                  placeholder="Optional"
                  className="h-10 w-full rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-muted)] px-3 text-sm text-[var(--studio-ink)]"
                />
              </div>
              <div>
                <span className="mb-1 block text-xs text-[var(--studio-ink-muted)]">
                  SIP password
                </span>
                <SetupPasswordInput
                  value={data.sipPassword}
                  onChange={(v) => onChange({ ...data, sipPassword: v })}
                  placeholder="Optional"
                />
              </div>
            </div>
          </details>
        </div>
      ) : null}
    </div>
  );
}

export function phoneStepValid(data: PhoneStepData): boolean {
  if (!data.sipProvider) return false;
  const phoneOk = /^[+\d][\d\s().-]{2,}$/.test(data.phoneNumber.trim());
  const nameOk = data.displayName.trim().length > 0;
  let hostOk = true;
  if (data.sipProvider === "exotel" || data.sipProvider === "other") {
    hostOk = data.sipAddress.trim().length > 0;
  }
  return phoneOk && nameOk && hostOk;
}

export function buildCreateSipNumberRequest(
  data: PhoneStepData
): CreateSipNumberRequest {
  const host =
    data.sipProvider === "twilio"
      ? "sip.twilio.com"
      : data.sipProvider === "telnyx"
        ? "sip.telnyx.com"
        : data.sipAddress.trim();

  const outbound: NonNullable<
    CreateSipNumberRequest["config"]["outbound_configs"]
  > = {
    address: host,
    transport: data.transport,
  };
  if (data.sipUser.trim()) outbound.user = data.sipUser.trim();
  if (data.sipPassword.trim()) outbound.password = data.sipPassword.trim();

  return {
    number: data.phoneNumber.trim().replace(/\s+/g, ""),
    source: "twilio",
    description: data.displayName.trim(),
    config: { outbound_configs: outbound },
  };
}
