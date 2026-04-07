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
  validateCampaignForm,
} from "@/lib/utils/campaign-form-validation";
import type { DayOfWeek } from "@/lib/utils/campaign-form-types";
import { downloadCampaignTemplate } from "@/lib/services/campaign";
import { downloadCSV } from "@/lib/utils/file-download";
import { CampaignCallAnalysisCard } from "@/components/campaign/campaign-call-analysis-card";
import { useSystemEvaluations } from "@/hooks/use-system-evaluations";
import { ArrowLeft, Upload } from "lucide-react";
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
    const cfg = redialData.campaignConfig;
    if (cfg?.timezone) setTimezone(cfg.timezone);
    if (cfg?.agent_uuid) setAiAgent(cfg.agent_uuid);
    if (cfg?.phone_number_id) setPhoneNumber(cfg.phone_number_id);
    if (typeof cfg?.is_send_immediately === "boolean") {
      setLaunchOption(cfg.is_send_immediately ? "now" : "later");
    }
  }, [campaignId, redialData, initialized]);

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
    try {
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
            Configure outbound caller ID, agent, contacts CSV, schedule, and call behavior.
          </p>
        </div>
        <Button
          type="button"
          className="rounded-xl bg-[var(--studio-teal)] text-[var(--studio-ink)] hover:opacity-90"
          disabled={busy}
          onClick={onSubmit}
        >
          {isEdit ? "Save campaign" : "Schedule campaign"}
        </Button>
      </div>

      {submitError && (
        <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-700 dark:text-red-200">
          {submitError}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
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
                  <SelectValue placeholder={sipLoading ? "Loading…" : "Select number"} />
                </SelectTrigger>
                <SelectContent>
                  {sipNumbers.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.phone_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>AI agent</Label>
              <Select
                value={aiAgent}
                onValueChange={(v) => setAiAgent(v ?? "")}
                disabled={agentsLoading}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={agentsLoading ? "Loading…" : "Select agent"} />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((a) => (
                    <SelectItem key={a.pipeline_deploy_uuid} value={a.pipeline_deploy_uuid}>
                      {a.pipeline_deploy_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

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
              Required column: <code className="font-mono">phone_number</code> (E.164). Max
              25 MB; backend may enforce row limits (see docs).
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
              <p className="text-sm text-[var(--studio-ink)]">
                Selected: <span className="font-medium">{fileLabel}</span>
              </p>
            )}
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
}
