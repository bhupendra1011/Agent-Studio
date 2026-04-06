"use client";

import { Button } from "@/components/ui/button";
import type { AgentPipeline } from "@/lib/types/api";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

interface CodeTabProps {
  pipeline: AgentPipeline;
}

type CodeLang = "curl" | "python" | "nodejs";

const LANG_TABS: { id: CodeLang; label: string }[] = [
  { id: "curl", label: "cURL" },
  { id: "python", label: "Python" },
  { id: "nodejs", label: "Node.js" },
];

function generateCode(pipeline: AgentPipeline, lang: CodeLang): string {
  const appId = pipeline.app_id ?? "<YOUR_APP_ID>";
  const pipelineId = pipeline.id;
  const name = pipeline.name.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();

  switch (lang) {
    case "curl":
      return `curl --request POST \\
  --url https://api.agora.io/api/conversational-ai-agent/v2/projects/${appId}/join \\
  --header 'Authorization: Basic <BASE64_CREDENTIALS>' \\
  --header 'Content-Type: application/json' \\
  --data '{
  "name": "${name}",
  "pipeline_id": "${pipelineId}",
  "properties": {
    "channel": "<CHANNEL_NAME>",
    "agent_rtc_uid": "<AGENT_UID>",
    "remote_rtc_uids": ["*"],
    "token": "<RTC_TOKEN>"
  }
}'`;

    case "python":
      return `import requests
import base64

customer_id = "<CUSTOMER_ID>"
customer_secret = "<CUSTOMER_SECRET>"
credentials = base64.b64encode(
    f"{customer_id}:{customer_secret}".encode()
).decode()

response = requests.post(
    "https://api.agora.io/api/conversational-ai-agent/v2/projects/${appId}/join",
    headers={
        "Authorization": f"Basic {credentials}",
        "Content-Type": "application/json",
    },
    json={
        "name": "${name}",
        "pipeline_id": "${pipelineId}",
        "properties": {
            "channel": "<CHANNEL_NAME>",
            "agent_rtc_uid": "<AGENT_UID>",
            "remote_rtc_uids": ["*"],
            "token": "<RTC_TOKEN>",
        },
    },
)

print(response.json())`;

    case "nodejs":
      return `const response = await fetch(
  "https://api.agora.io/api/conversational-ai-agent/v2/projects/${appId}/join",
  {
    method: "POST",
    headers: {
      Authorization: \`Basic \${btoa("<CUSTOMER_ID>:<CUSTOMER_SECRET>")}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "${name}",
      pipeline_id: "${pipelineId}",
      properties: {
        channel: "<CHANNEL_NAME>",
        agent_rtc_uid: "<AGENT_UID>",
        remote_rtc_uids: ["*"],
        token: "<RTC_TOKEN>",
      },
    }),
  }
);

const data = await response.json();
console.log(data);`;
  }
}

export function CodeTab({ pipeline }: CodeTabProps) {
  const [lang, setLang] = useState<CodeLang>("curl");
  const [copied, setCopied] = useState(false);

  const code = useMemo(() => generateCode(pipeline, lang), [pipeline, lang]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="space-y-4 studio-reveal studio-reveal-d1">
      <section className="overflow-hidden rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-surface)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--studio-border)] px-4 py-3">
          <div>
            <h3 className="font-[family-name:var(--font-syne)] text-base font-semibold text-[var(--studio-ink)]">
              Embed Code
            </h3>
            <p className="text-xs text-[var(--studio-ink-muted)]">
              Use this code to start your agent from your backend
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void handleCopy()}
            className={cn(
              "rounded-lg transition-all",
              copied
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                : "border-[var(--studio-border)] text-[var(--studio-ink-muted)]"
            )}
          >
            {copied ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5 animate-in zoom-in-50 duration-200" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copy
              </>
            )}
          </Button>
        </div>

        {/* Language tabs */}
        <div className="flex border-b border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/40 px-4">
          {LANG_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setLang(tab.id)}
              className={cn(
                "relative px-3 py-2 text-xs font-medium transition-colors",
                lang === tab.id
                  ? "text-[var(--studio-ink)]"
                  : "text-[var(--studio-ink-muted)] hover:text-[var(--studio-ink)]"
              )}
            >
              {tab.label}
              {lang === tab.id && (
                <span className="absolute right-3 bottom-0 left-3 h-0.5 rounded-full bg-[var(--studio-teal)]" />
              )}
            </button>
          ))}
        </div>

        {/* Code block */}
        <div className="overflow-x-auto bg-[var(--studio-surface-muted)]/70 dark:bg-[oklch(0.14_0.02_280)]">
          <pre className="p-5 font-mono text-[13px] leading-relaxed text-[var(--studio-ink)]">
            <code>{code}</code>
          </pre>
        </div>
      </section>

      {/* Info */}
      <div className="rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface)] px-5 py-4 studio-reveal studio-reveal-d2">
        <p className="text-sm text-[var(--studio-ink-muted)]">
          <strong className="text-[var(--studio-ink)]">Authentication required.</strong>{" "}
          Replace <code className="rounded bg-[var(--studio-surface-muted)] px-1 py-0.5 font-mono text-xs">&lt;BASE64_CREDENTIALS&gt;</code> with
          your Base64-encoded Agora Customer ID and Customer Secret. The RTC token is valid for 24 hours.{" "}
          <a
            href="https://docs.agora.io/en/conversational-ai/rest-api/restful-authentication"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--studio-teal)] underline underline-offset-2 hover:opacity-80"
          >
            Learn more
          </a>
        </p>
      </div>
    </div>
  );
}
