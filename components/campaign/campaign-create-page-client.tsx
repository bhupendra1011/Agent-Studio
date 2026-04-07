"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCampaignDetails } from "@/hooks/use-campaign-details";
import {
  useCreateCampaign,
  useUpdateCampaign,
  useUploadRecipientsCSV,
} from "@/hooks/use-campaign-mutations";
import { useDeployedAgentsList } from "@/hooks/use-deployed-agents-list";
import { usePhoneNumbers } from "@/hooks/use-phone-numbers";
import { useRedialCampaign } from "@/lib/contexts/redial-campaign-context";
import type {
  CreateCampaignRequest,
  CustomEvaluation,
  UpdateCampaignRequest,
} from "@/lib/types/api";
import { groupedTimezoneOptions, timezoneOptions } from "@/lib/utils/campaign";
import type { RangeCard } from "@/lib/utils/campaign-form-types";
import {
  convertRangeCardsToScheduledTimeRangesConfig,
  loadCSVFileFromUrl,
  populateCampaignFormFromDetails,
} from "@/lib/utils/campaign-form-population";
import {
  formatScheduledStartTime,
  validateCallIntervalMs,
  validateCampaignForm,
} from "@/lib/utils/campaign-form-validation";
import {
  parseCsvPreview,
  readFileAsText,
  type CsvPreviewResult,
} from "@/lib/utils/csv-preview";
import { cn } from "@/lib/utils";
import type { DayOfWeek } from "@/lib/utils/campaign-form-types";
import { downloadCampaignTemplate } from "@/lib/services/campaign";
import { downloadCSV } from "@/lib/utils/file-download";
import { CampaignCallAnalysisCard } from "@/components/campaign/campaign-call-analysis-card";
import { useSystemEvaluations } from "@/hooks/use-system-evaluations";
import { AlertCircle, ArrowLeft, ChevronRight, Pencil, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const DAYS: DayOfWeek[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function atTime(h: number, m: number): Date {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function defaultRangeCards(): RangeCard[] {
  return [
    {
      id: "default",
      selectedDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      timeRanges: [
        {
          id: "r1",
          fromTime: atTime(8, 0),
          toTime: atTime(20, 0),
        },
      ],
    },
  ];
}

interface Props {
  campaignId?: string;
}

export function CampaignCreatePageClient({ campaignId }: Props) {
  const router = useRouter();
  const isEdit = Boolean(campaignId);
  const { campaignDetails, loading: detailsLoading } = useCampaignDetails(
    campaignId ?? null
  );
  const { redialData, clearRedialData } = useRedialCampaign();

  const { agents, loading: agentsLoading } = useDeployedAgentsList({
    page: 1,
    page_size: 100,
  });
  const { numbers: sipNumbers, loading: sipLoading } = usePhoneNumbers({
    page: 1,
    page_size: 100,
  });
  const { systemEvaluations } = useSystemEvaluations();

  const createMut = useCreateCampaign();
  const updateMut = useUpdateCampaign();
  const uploadMut = useUploadRecipientsCSV();

  const [campaignName, setCampaignName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [aiAgent, setAiAgent] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{ file_url: string } | null>(
    null
  );
  const [fileLabel, setFileLabel] = useState<string | null>(null);
  const [launchOption, setLaunchOption] = useState<"now" | "later">("now");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<Date | undefined>();
  const [timezone, setTimezone] = useState("America/Los_Angeles");
  const [rangeCards, setRangeCards] = useState<RangeCard[]>(defaultRangeCards);

  const [isEndOfConversationEnabled, setIsEndOfConversationEnabled] =
    useState(true);
  const [isVoicemailHangupEnabled, setIsVoicemailHangupEnabled] =
    useState(false);
  const [isSilenceHangupEnabled, setIsSilenceHangupEnabled] = useState(true);
  const [silenceTimeout, setSilenceTimeout] = useState("120");
  const [maxCallDuration, setMaxCallDuration] = useState("300");
  const [ringDuration, setRingDuration] = useState("30");
  const [dialingSpeed, setDialingSpeed] = useState("1500");

  const [isStoreTranscriptsEnabled, setIsStoreTranscriptsEnabled] =
    useState(true);
  const [isStoreCallRecordingEnabled, setIsStoreCallRecordingEnabled] =
    useState(true);
  const [isPostCallDataExtraction, setIsPostCallDataExtraction] =
    useState(false);
  const [dataPoints, setDataPoints] = useState<CustomEvaluation[]>([]);
  const [llmSuccessEvaluationCriteria, setLlmSuccessEvaluationCriteria] =
    useState(
      "The call was successful if the customer confirmed their appointment."
    );
  const [transferToHuman, setTransferToHuman] = useState(false);
  const [transferNumber, setTransferNumber] = useState("");
  const [transferCriteria, setTransferCriteria] = useState("");
  const [enforceE164, setEnforceE164] = useState(true);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const isWizard = !isEdit;
  const [wizardStep, setWizardStep] = useState(1);
  const [csvPreview, setCsvPreview] = useState<CsvPreviewResult | null>(null);

  useEffect(() => {
    if (!campaignId || !campaignDetails || initialized) return;
    populateCampaignFormFromDetails(campaignDetails, {
      setCampaignName,
      setPhoneNumber,
      setAiAgent,
      setLaunchOption,
      setSelectedDate,
      setSelectedTime,
      setTimezone,
      setIsVoicemailHangupEnabled,
      setMaxCallDuration,
      setSilenceTimeout,
      setRingDuration,
      setIsStoreTranscriptsEnabled,
      setIsStoreCallRecordingEnabled,
      setIsSilenceHangupEnabled,
      setIsEndOfConversationEnabled,
      setRangeCards,
      setTransferToHuman,
      setTransferNumber,
      setTransferCriteria,
      setEnforceE164,
      setIsPostCallDataExtraction,
      setDataPoints,
      setLlmSuccessEvaluationCriteria,
    });
    void loadCSVFileFromUrl(
      campaignDetails.recipients_file_url,
      campaignDetails.recipients_phone_number_count
    ).then((meta) => {
      setUploadedFile({ file_url: meta.file_url });
      setFileLabel(meta.name);
    });
    setInitialized(true);
  }, [campaignId, campaignDetails, initialized]);

  useEffect(() => {
    if (campaignId || initialized || !redialData.csvData) return;
    setUploadedFile({ file_url: "redial-inline" });
    setFileLabel(redialData.csvFilename || "redial.csv");
    setCsvPreview(parseCsvPreview(redialData.csvData));
    const cfg = redialData.campaignConfig;
    if (cfg?.timezone) setTimezone(cfg.timezone);
    if (cfg?.agent_uuid) setAiAgent(cfg.agent_uuid);
    if (cfg?.phone_number_id) setPhoneNumber(cfg.phone_number_id);
    if (typeof cfg?.is_send_immediately === "boolean") {
      setLaunchOption(cfg.is_send_immediately ? "now" : "later");
    }
  }, [campaignId, redialData, initialized]);

  useEffect(() => {
    if (!isWizard || !redialData.csvData) return;
    setCsvPreview(parseCsvPreview(redialData.csvData, 5));
  }, [isWizard, redialData.csvData]);

  const timezoneGroups = useMemo(() => groupedTimezoneOptions, []);

  const toggleDay = (day: DayOfWeek) => {
    setRangeCards((prev) => {
      const card = { ...prev[0] };
      const set = new Set(card.selectedDays);
      if (set.has(day)) set.delete(day);
      else set.add(day);
      card.selectedDays = Array.from(set) as DayOfWeek[];
      return [{ ...card, id: card.id }];
    });
  };

  const onFile = async (file: File | null) => {
    if (!file) return;
    setSubmitError(null);
    const maxBytes = 25 * 1024 * 1024;
    if (file.size > maxBytes) {
      setSubmitError("CSV must be 25 MB or smaller.");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setSubmitError("Please upload a .csv file.");
      return;
    }
    try {
      if (isWizard) {
        const text = await readFileAsText(file);
        setCsvPreview(parseCsvPreview(text, 5));
      }
      const res = await uploadMut.mutateAsync(file);
      setUploadedFile({ file_url: res.data.file_url });
      setFileLabel(file.name);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Upload failed");
    }
  };

  const onDownloadTemplate = async () => {
    try {
      const res = await downloadCampaignTemplate();
      if (res.code !== 0) throw new Error(res.message);
      downloadCSV(res.data, "campaign-contacts-template.csv");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Download failed");
    }
  };

  const buildPayload = (
    recipientsUrl: string
  ): CreateCampaignRequest | UpdateCampaignRequest => {
    const scheduledTimeRangesConfig =
      convertRangeCardsToScheduledTimeRangesConfig(rangeCards);
    const scheduledStartTime =
      launchOption === "later"
        ? formatScheduledStartTime(selectedDate, selectedTime)
        : undefined;

    const parsedRing = parseInt(ringDuration, 10);
    const maxRingDurationSeconds = Number.isNaN(parsedRing) ? 30 : parsedRing;
    const parsedSilence = parseInt(silenceTimeout, 10);
    const maxSilenceDurationSeconds = Number.isNaN(parsedSilence)
      ? 120
      : parsedSilence;
    const parsedMaxDur = parseInt(maxCallDuration, 10);
    const parsedDial = parseInt(dialingSpeed, 10);

    const hangupConfig = {
      max_duration_seconds: Number.isNaN(parsedMaxDur) ? 300 : parsedMaxDur,
      max_silence_duration_seconds: maxSilenceDurationSeconds,
      max_ring_duration_seconds: maxRingDurationSeconds,
    };

    const switchConfig = {
      enable_transcript: isStoreTranscriptsEnabled,
      enable_recording: isStoreCallRecordingEnabled,
      enable_voicemail: isVoicemailHangupEnabled,
      enable_user_auto_hangup: isEndOfConversationEnabled,
      enable_max_silence_duration_hangup: isSilenceHangupEnabled,
      enable_llm_call_evaluation: isPostCallDataExtraction,
    };

    const sipTransferConfig = {
      enable_sip_transfer: transferToHuman,
      format_e164: enforceE164,
      static_target: {
        phone_number: transferToHuman ? transferNumber.trim() : "",
        transfer_description: transferToHuman ? transferCriteria.trim() : "",
      },
    };

    const base = {
      campaign_name: campaignName.trim(),
      phone_number_id: phoneNumber,
      agent_uuid: aiAgent,
      recipients_file_url: recipientsUrl,
      call_interval_ms: Number.isNaN(parsedDial) ? 1500 : parsedDial,
      is_send_immediately: launchOption === "now",
      scheduled_start_time: scheduledStartTime,
      timezone: timezone || undefined,
      hangup_configuration: hangupConfig,
      switch_configuration: switchConfig,
      sip_transfer: sipTransferConfig,
      ...(scheduledTimeRangesConfig.length
        ? { scheduled_time_ranges_config: scheduledTimeRangesConfig }
        : {}),
      ...(isPostCallDataExtraction && {
        llm_call_evaluation_configuration: {
          call_success_evaluation: {
            criteria: llmSuccessEvaluationCriteria.trim(),
          },
          custom_evaluations: dataPoints
            .filter((e) => e.variable_name.trim() && e.criteria.trim())
            .map((e) => ({
              variable_name: e.variable_name.trim(),
              type: e.type,
              criteria: e.criteria.trim(),
              ...(e.options?.length ? { options: e.options } : {}),
            })),
        },
      }),
    };

    return base as CreateCampaignRequest | UpdateCampaignRequest;
  };

  const onSubmit = async () => {
    setSubmitError(null);
    let fileRef = uploadedFile;
    if (
      fileRef?.file_url === "redial-inline" &&
      redialData.csvData
    ) {
      try {
        const blob = new Blob([redialData.csvData], { type: "text/csv" });
        const file = new File(
          [blob],
          redialData.csvFilename || "redial.csv",
          { type: "text/csv" }
        );
        const res = await uploadMut.mutateAsync(file);
        fileRef = { file_url: res.data.file_url };
        setUploadedFile(fileRef);
      } catch (e) {
        setSubmitError(e instanceof Error ? e.message : "Upload failed");
        return;
      }
    }
    const err = validateCampaignForm({
      campaignName,
      phoneNumber,
      aiAgent,
      uploadedFile: fileRef,
      launchOption,
      selectedDate,
      selectedTime,
      timezone,
      callWindowTimeRanges: rangeCards[0]?.timeRanges,
      callIntervalMsRaw: dialingSpeed,
    });
    if (err) {
      setSubmitError(err);
      return;
    }
    const validDataPoints = dataPoints.filter(
      (e) => e.variable_name.trim() && e.criteria.trim()
    );
    if (isPostCallDataExtraction && validDataPoints.length === 0) {
      setSubmitError(
        "Post-call data extraction needs at least one data point, or turn the feature off."
      );
      return;
    }
    try {
      const payload = buildPayload(fileRef!.file_url);
      if (isEdit && campaignId) {
        await updateMut.mutateAsync({ campaignId, data: payload as UpdateCampaignRequest });
      } else {
        await createMut.mutateAsync(payload as CreateCampaignRequest);
      }
      clearRedialData();
      router.push("/dashboard/campaign");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Request failed");
    }
  };

  const busy =
    createMut.isPending ||
    updateMut.isPending ||
    uploadMut.isPending ||
    (isEdit && detailsLoading);

  const selectedPhoneLabel =
    sipNumbers.find((n) => n.id === phoneNumber)?.phone_number ?? phoneNumber;
  const selectedAgentLabel =
    agents.find((a) => a.pipeline_deploy_uuid === aiAgent)?.pipeline_deploy_name ??
    aiAgent;

  const wizardStep1Error = (): string | null => {
    if (campaignName.trim().length < 3) {
      return "Campaign name must be at least 3 characters.";
    }
    if (!phoneNumber) return "Select a phone number for caller ID.";
    if (!aiAgent) return "Select a deployed AI agent.";
    return null;
  };

  const wizardStep2Error = (): string | null => {
    if (!uploadedFile?.file_url) return "Upload a contacts CSV file.";
    if (uploadedFile.file_url === "redial-inline" && redialData.csvData) {
      const p = parseCsvPreview(redialData.csvData, 5);
      if (!p.hasPhoneColumn) {
        return "CSV must include a phone_number column (E.164).";
      }
      return null;
    }
    if (csvPreview && !csvPreview.hasPhoneColumn) {
      return "CSV must include a phone_number column (E.164).";
    }
    return null;
  };

  const wizardStep3Error = (): string | null => {
    if (launchOption === "later") {
      if (!selectedDate || !selectedTime) {
        return "Choose a start date and time for a scheduled campaign.";
      }
      const combined = new Date(selectedDate);
      combined.setHours(selectedTime.getHours());
      combined.setMinutes(selectedTime.getMinutes());
      combined.setSeconds(0, 0);
      if (combined < new Date()) {
        return "Campaign start time cannot be in the past.";
      }
    }
    if (!timezone) return "Select a timezone.";
    if (rangeCards[0]?.timeRanges?.length) {
      const invalid = rangeCards[0].timeRanges.filter((range) => {
        if (!range.fromTime || !range.toTime) return true;
        return range.toTime.getTime() <= range.fromTime.getTime();
      });
      if (invalid.length > 0) {
        return "Each call window needs a valid start and end (end after start).";
      }
    }
    const dialErr = validateCallIntervalMs(dialingSpeed);
    if (dialErr) return dialErr;
    const validDataPoints = dataPoints.filter(
      (e) => e.variable_name.trim() && e.criteria.trim()
    );
    if (isPostCallDataExtraction && validDataPoints.length === 0) {
      return "Post-call extraction needs at least one data point, or turn it off.";
    }
    return null;
  };

  const WIZARD_STEP_META = [
    { n: 1, label: "Details" },
    { n: 2, label: "Contacts" },
    { n: 3, label: "Schedule & settings" },
    { n: 4, label: "Review" },
  ] as const;

  const detailsCard = (
    <Card className="border-[var(--studio-border)] bg-[var(--studio-surface)]">
      <CardHeader>
        <CardTitle className="text-base">Campaign details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Campaign name</Label>
          <Input
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            className="rounded-xl"
            placeholder="e.g. Survey follow-up"
          />
        </div>
        <div className="space-y-2">
          <Label>Phone number (caller ID)</Label>
          <Select
            value={phoneNumber}
            onValueChange={(v) => setPhoneNumber(v ?? "")}
            disabled={sipLoading}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue
                placeholder={sipLoading ? "Loading…" : "Select number"}
              />
            </SelectTrigger>
            <SelectContent>
              {sipNumbers.map((n) => (
                <SelectItem key={n.id} value={n.id}>
                  {n.phone_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!sipLoading && sipNumbers.length === 0 ? (
            <p className="text-xs text-[var(--studio-ink-muted)]">
              No numbers yet —{" "}
              <Link
                href="/dashboard/phone-numbers"
                className="text-[var(--studio-teal)] underline underline-offset-2"
              >
                import a phone number
              </Link>
              .
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label>AI agent</Label>
          <Select
            value={aiAgent}
            onValueChange={(v) => setAiAgent(v ?? "")}
            disabled={agentsLoading}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue
                placeholder={agentsLoading ? "Loading…" : "Select agent"}
              />
            </SelectTrigger>
            <SelectContent>
              {agents.map((a) => (
                <SelectItem
                  key={a.pipeline_deploy_uuid}
                  value={a.pipeline_deploy_uuid}
                >
                  {a.pipeline_deploy_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!agentsLoading && agents.length === 0 ? (
            <p className="text-xs text-[var(--studio-ink-muted)]">
              No deployed agents —{" "}
              <Link
                href="/dashboard/agents"
                className="text-[var(--studio-teal)] underline underline-offset-2"
              >
                create and publish an agent
              </Link>
              .
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );

  const csvCard = (
    <Card className="border-[var(--studio-border)] bg-[var(--studio-surface)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Contacts (CSV)</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-lg text-xs"
          onClick={onDownloadTemplate}
        >
          Download template
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-[var(--studio-ink-muted)]">
          Required column: <code className="font-mono">phone_number</code>{" "}
          (E.164). Max 25 MB / 50k rows per product docs.
        </p>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/40 px-4 py-8 text-center text-sm text-[var(--studio-ink-muted)]">
          <Upload className="mb-2 h-6 w-6 opacity-60" />
          <span>Drag and drop or click to upload</span>
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
          />
        </label>
        {fileLabel && (
          <div className="space-y-2">
            <p className="text-sm text-[var(--studio-ink)]">
              Selected: <span className="font-medium">{fileLabel}</span>
            </p>
            {csvPreview && uploadedFile?.file_url !== "redial-inline" ? (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
                    csvPreview.hasPhoneColumn
                      ? "bg-[var(--studio-teal)]/15 text-[var(--studio-teal)]"
                      : "bg-destructive/15 text-destructive"
                  )}
                >
                  {csvPreview.hasPhoneColumn ? (
                    <>phone_number column found</>
                  ) : (
                    <>
                      <AlertCircle className="h-3.5 w-3.5" />
                      Missing phone_number column
                    </>
                  )}
                </span>
                <span className="text-[var(--studio-ink-muted)]">
                  ~{csvPreview.rowCountEstimate.toLocaleString()} rows
                </span>
                {csvPreview.invalidE164Count > 0 ? (
                  <span className="text-amber-700 dark:text-amber-300">
                    {csvPreview.invalidE164Count} value(s) may not be E.164
                  </span>
                ) : null}
              </div>
            ) : null}
            {csvPreview && csvPreview.rows.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-[var(--studio-border)]">
                <table className="w-full min-w-[320px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/60 text-[var(--studio-ink-muted)]">
                      {csvPreview.headers.map((h) => (
                        <th key={h} className="px-2 py-2 font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.rows.map((row, ri) => (
                      <tr
                        key={ri}
                        className="border-b border-[var(--studio-border)]/80 last:border-0"
                      >
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-2 py-1.5 text-[var(--studio-ink)]">
                            <span className="line-clamp-2">{cell}</span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard/campaign"
            className="mb-2 inline-flex items-center gap-1 text-sm text-[var(--studio-ink-muted)] hover:text-[var(--studio-ink)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to campaigns
          </Link>
          <h2 className="font-[family-name:var(--font-syne)] text-xl font-semibold text-[var(--studio-ink)]">
            {isEdit ? "Edit campaign" : "Create campaign"}
          </h2>
          <p className="mt-1 text-sm text-[var(--studio-ink-muted)]">
            {isWizard
              ? "Step-by-step: details, contacts, schedule, then review and launch."
              : "Configure outbound caller ID, agent, contacts CSV, schedule, and call behavior."}
          </p>
        </div>
        {!isWizard || wizardStep === 4 ? (
          <Button
            type="button"
            className="rounded-xl bg-[var(--studio-teal)] text-[var(--studio-ink)] hover:opacity-90"
            disabled={busy}
            onClick={onSubmit}
          >
            {isEdit ? "Save campaign" : launchOption === "now" ? "Launch now" : "Schedule campaign"}
          </Button>
        ) : null}
      </div>

      {isWizard ? (
        <div className="flex flex-wrap gap-2 border-b border-[var(--studio-border)] pb-4">
          {WIZARD_STEP_META.map((s) => (
            <button
              key={s.n}
              type="button"
              onClick={() => {
                if (s.n <= wizardStep) setWizardStep(s.n);
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                wizardStep === s.n
                  ? "bg-[var(--studio-teal)] text-[var(--studio-ink)]"
                  : s.n < wizardStep
                    ? "bg-[var(--studio-surface-muted)] text-[var(--studio-ink)] hover:bg-[var(--studio-border)]"
                    : "text-[var(--studio-ink-muted)]"
              )}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background/50 text-[0.625rem]">
                {s.n}
              </span>
              {s.label}
            </button>
          ))}
        </div>
      ) : null}

      {submitError && (
        <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-700 dark:text-red-200">
          {submitError}
        </p>
      )}

      {isEdit ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {detailsCard}
          {csvCard}
        </div>
      ) : wizardStep === 1 ? (
        <div className="max-w-2xl">{detailsCard}</div>
      ) : wizardStep === 2 ? (
        <div className="max-w-3xl">{csvCard}</div>
      ) : null}

      {isEdit || wizardStep === 3 ? (
        <>

      <Card className="border-[var(--studio-border)] bg-[var(--studio-surface)]">
        <CardHeader>
          <CardTitle className="text-base">Launch timing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={launchOption === "now"}
                onChange={() => setLaunchOption("now")}
              />
              Launch now
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={launchOption === "later"}
                onChange={() => setLaunchOption("later")}
              />
              Schedule for later
            </label>
          </div>
          {launchOption === "later" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Start date</Label>
                <Input
                  type="date"
                  className="rounded-xl"
                  onChange={(e) =>
                    setSelectedDate(e.target.value ? new Date(e.target.value) : undefined)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Start time</Label>
                <Input
                  type="time"
                  className="rounded-xl"
                  onChange={(e) => {
                    const [h, m] = (e.target.value || "0:0").split(":").map(Number);
                    const d = new Date();
                    d.setHours(h, m, 0, 0);
                    setSelectedTime(d);
                  }}
                />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select value={timezone} onValueChange={(v) => setTimezone(v ?? "")}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {timezoneOptions.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[var(--studio-border)] bg-[var(--studio-surface)]">
        <CardHeader>
          <CardTitle className="text-base">Call window</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-[var(--studio-ink-muted)]">
            Select days and hours when outbound calls are allowed ({timezoneGroups.length}{" "}
            groups available in dropdown above).
          </p>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(d)}
                className={
                  "rounded-lg px-3 py-1 text-xs font-medium transition-colors " +
                  (rangeCards[0]?.selectedDays.includes(d)
                    ? "bg-[var(--studio-teal)] text-[var(--studio-ink)]"
                    : "bg-[var(--studio-surface-muted)] text-[var(--studio-ink-muted)]")
                }
              >
                {d}
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Window start</Label>
              <Input
                type="time"
                className="rounded-xl"
                defaultValue="08:00"
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v || !rangeCards[0]) return;
                  const [h, m] = v.split(":").map(Number);
                  const from = atTime(h, m);
                  setRangeCards([
                    {
                      ...rangeCards[0],
                      timeRanges: [
                        {
                          ...rangeCards[0].timeRanges[0],
                          fromTime: from,
                          toTime: rangeCards[0].timeRanges[0].toTime ?? atTime(20, 0),
                        },
                      ],
                    },
                  ]);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Window end</Label>
              <Input
                type="time"
                className="rounded-xl"
                defaultValue="20:00"
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v || !rangeCards[0]) return;
                  const [h, m] = v.split(":").map(Number);
                  const to = atTime(h, m);
                  setRangeCards([
                    {
                      ...rangeCards[0],
                      timeRanges: [
                        {
                          ...rangeCards[0].timeRanges[0],
                          fromTime: rangeCards[0].timeRanges[0].fromTime ?? atTime(8, 0),
                          toTime: to,
                        },
                      ],
                    },
                  ]);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[var(--studio-border)] bg-[var(--studio-surface)]">
        <CardHeader>
          <CardTitle className="text-base">Call settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">End of conversation hang-up</p>
              <p className="text-xs text-[var(--studio-ink-muted)]">
                Hang up when the conversation naturally ends.
              </p>
            </div>
            <Switch
              checked={isEndOfConversationEnabled}
              onCheckedChange={setIsEndOfConversationEnabled}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Voicemail detection</p>
            </div>
            <Switch
              checked={isVoicemailHangupEnabled}
              onCheckedChange={setIsVoicemailHangupEnabled}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Silence hang-up</p>
            </div>
            <Switch
              checked={isSilenceHangupEnabled}
              onCheckedChange={setIsSilenceHangupEnabled}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Silence timeout (seconds)</Label>
              <Input
                value={silenceTimeout}
                onChange={(e) => setSilenceTimeout(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Max call duration (seconds)</Label>
              <Input
                value={maxCallDuration}
                onChange={(e) => setMaxCallDuration(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Ring duration (seconds)</Label>
              <Input
                value={ringDuration}
                onChange={(e) => setRingDuration(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Min interval between calls (ms)</Label>
              <Input
                value={dialingSpeed}
                onChange={(e) => setDialingSpeed(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-[var(--studio-border)] pt-4">
            <div>
              <p className="font-medium">Transfer to human</p>
            </div>
            <Switch checked={transferToHuman} onCheckedChange={setTransferToHuman} />
          </div>
          {transferToHuman && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Transfer phone (E.164)</Label>
                <Input
                  value={transferNumber}
                  onChange={(e) => setTransferNumber(e.target.value)}
                  className="rounded-xl font-mono text-sm"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Transfer criteria</Label>
                <Textarea
                  value={transferCriteria}
                  onChange={(e) => setTransferCriteria(e.target.value)}
                  className="min-h-[80px] rounded-xl"
                />
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <Switch checked={enforceE164} onCheckedChange={setEnforceE164} />
                <span className="text-sm">Enforce E.164 on transfer target</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-[var(--studio-border)] bg-[var(--studio-surface)]">
        <CardHeader>
          <CardTitle className="text-base">Transcripts &amp; recording</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium">Store transcripts</span>
            <Switch
              checked={isStoreTranscriptsEnabled}
              onCheckedChange={setIsStoreTranscriptsEnabled}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium">Store call recording</span>
            <Switch
              checked={isStoreCallRecordingEnabled}
              onCheckedChange={setIsStoreCallRecordingEnabled}
            />
          </div>
        </CardContent>
      </Card>

      <CampaignCallAnalysisCard
        extractionEnabled={isPostCallDataExtraction}
        onExtractionChange={setIsPostCallDataExtraction}
        dataPoints={dataPoints}
        onDataPointsChange={setDataPoints}
        successCriteria={llmSuccessEvaluationCriteria}
        onSuccessCriteriaChange={setLlmSuccessEvaluationCriteria}
        systemEvaluations={systemEvaluations}
      />
        </>
      ) : null}

      {isWizard && wizardStep === 4 ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-[var(--studio-border)] bg-[var(--studio-surface)] lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campaign</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-xs text-[var(--studio-teal)]"
                onClick={() => setWizardStep(1)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            </CardHeader>
            <CardContent className="text-sm text-[var(--studio-ink-muted)]">
              <p className="font-medium text-[var(--studio-ink)]">
                {campaignName || "—"}
              </p>
              <p className="mt-2">Caller ID: {selectedPhoneLabel || "—"}</p>
              <p className="mt-1">Agent: {selectedAgentLabel || "—"}</p>
            </CardContent>
          </Card>
          <Card className="border-[var(--studio-border)] bg-[var(--studio-surface)] lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contacts</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-xs text-[var(--studio-teal)]"
                onClick={() => setWizardStep(2)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            </CardHeader>
            <CardContent className="text-sm text-[var(--studio-ink-muted)]">
              <p className="font-medium text-[var(--studio-ink)]">
                {fileLabel ?? "No file"}
              </p>
              {csvPreview ? (
                <p className="mt-2">
                  ~{csvPreview.rowCountEstimate.toLocaleString()} rows
                </p>
              ) : null}
            </CardContent>
          </Card>
          <Card className="border-[var(--studio-border)] bg-[var(--studio-surface)] lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Launch and behavior
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-xs text-[var(--studio-teal)]"
                onClick={() => setWizardStep(3)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[var(--studio-ink-muted)]">
              <p>
                {launchOption === "now"
                  ? "Launch immediately after creation"
                  : `Scheduled: ${formatScheduledStartTime(selectedDate, selectedTime) ?? "—"}`}
              </p>
              <p className="text-xs">Timezone: {timezone}</p>
              <p className="text-xs">
                Transcripts {isStoreTranscriptsEnabled ? "on" : "off"} · Recording{" "}
                {isStoreCallRecordingEnabled ? "on" : "off"}
                {isPostCallDataExtraction ? " · Post-call extraction on" : ""}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {isWizard && wizardStep < 4 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--studio-border)] pt-6">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            disabled={wizardStep === 1 || busy}
            onClick={() => {
              setSubmitError(null);
              setWizardStep((s) => Math.max(1, s - 1));
            }}
          >
            Back
          </Button>
          <Button
            type="button"
            className="rounded-xl bg-[var(--studio-teal)] text-[var(--studio-ink)] hover:opacity-90"
            disabled={busy}
            onClick={() => {
              setSubmitError(null);
              if (wizardStep === 1) {
                const err = wizardStep1Error();
                if (err) {
                  setSubmitError(err);
                  return;
                }
                setWizardStep(2);
              } else if (wizardStep === 2) {
                const err = wizardStep2Error();
                if (err) {
                  setSubmitError(err);
                  return;
                }
                if (
                  uploadedFile?.file_url &&
                  uploadedFile.file_url !== "redial-inline" &&
                  !csvPreview
                ) {
                  setSubmitError(
                    "Could not read CSV preview. Re-upload the file."
                  );
                  return;
                }
                setWizardStep(3);
              } else if (wizardStep === 3) {
                const err = wizardStep3Error();
                if (err) {
                  setSubmitError(err);
                  return;
                }
                setWizardStep(4);
              }
            }}
          >
            Continue
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      ) : null}

      {isWizard && wizardStep === 4 ? (
        <div className="rounded-xl border border-[var(--studio-border)] bg-[var(--studio-surface-muted)]/30 px-4 py-3 text-xs text-[var(--studio-ink-muted)]">
          Reminder: comply with applicable dialing rules (e.g. consent and
          quiet hours) for your jurisdiction before launching outbound
          campaigns.
        </div>
      ) : null}
    </div>
  );
}
