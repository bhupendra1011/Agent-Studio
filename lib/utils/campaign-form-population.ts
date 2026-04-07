import type {
  CampaignDetails,
  CustomEvaluation,
  ScheduledTimeRangesConfig,
} from "@/lib/types/api";
import type { DayOfWeek, RangeCard, TimeRange } from "@/lib/utils/campaign-form-types";

export const dayOfWeekToNumber = (day: DayOfWeek): number => {
  const mapping: Record<DayOfWeek, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return mapping[day];
};

export const numberToDayOfWeek = (weekday: number): DayOfWeek => {
  const mapping: Record<number, DayOfWeek> = {
    0: "Sun",
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
  };
  return mapping[weekday] ?? "Mon";
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function convertTimeRangesToBackend(
  timeRanges: TimeRange[]
): Array<{ start: string; end: string }> {
  return timeRanges
    .filter((range) => range.fromTime && range.toTime)
    .map((range) => ({
      start: `${pad2(range.fromTime!.getHours())}:${pad2(range.fromTime!.getMinutes())}`,
      end: `${pad2(range.toTime!.getHours())}:${pad2(range.toTime!.getMinutes())}`,
    }));
}

export function convertBackendToTimeRanges(
  timeRanges: Array<{ start: string; end: string }>
): TimeRange[] {
  return timeRanges.map((range, index) => {
    const [sh, sm] = range.start.split(":").map(Number);
    const [eh, em] = range.end.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(sh, sm, 0, 0);
    const endDate = new Date();
    endDate.setHours(eh, em, 0, 0);
    return {
      id: `range-${Date.now()}-${index}-${Math.random()}`,
      fromTime: startDate,
      toTime: endDate,
    };
  });
}

export function convertBackendToRangeCards(
  scheduledTimeRangesConfig: ScheduledTimeRangesConfig[]
): RangeCard[] {
  if (!scheduledTimeRangesConfig?.length) return [];

  const timeRangeMap = new Map<
    string,
    { weekdays: number[]; timeRanges: Array<{ start: string; end: string }> }
  >();

  scheduledTimeRangesConfig.forEach((config) => {
    const sortedTimeRanges = [...config.time_ranges].sort((a, b) => {
      if (a.start !== b.start) return a.start.localeCompare(b.start);
      return a.end.localeCompare(b.end);
    });
    const key = JSON.stringify(sortedTimeRanges);
    if (!timeRangeMap.has(key)) {
      timeRangeMap.set(key, { weekdays: [], timeRanges: sortedTimeRanges });
    }
    timeRangeMap.get(key)!.weekdays.push(config.weekday);
  });

  const rangeCards: RangeCard[] = [];
  let cardIndex = 0;
  timeRangeMap.forEach((value) => {
    const selectedDays = value.weekdays
      .sort((a, b) => a - b)
      .map(numberToDayOfWeek);
    const timeRanges = convertBackendToTimeRanges(value.timeRanges);
    rangeCards.push({
      id: `card-${Date.now()}-${cardIndex}-${Math.random()}`,
      selectedDays,
      timeRanges,
    });
    cardIndex++;
  });

  return rangeCards;
}

export function convertToScheduledTimeRangesConfig(
  selectedDays: DayOfWeek[],
  timeRanges: TimeRange[]
): ScheduledTimeRangesConfig[] {
  if (selectedDays.length === 0 || timeRanges.length === 0) return [];
  const validTimeRanges = convertTimeRangesToBackend(timeRanges);
  if (validTimeRanges.length === 0) return [];
  return selectedDays.map((day) => ({
    weekday: dayOfWeekToNumber(day),
    time_ranges: validTimeRanges,
  }));
}

export function convertRangeCardsToScheduledTimeRangesConfig(
  rangeCards: RangeCard[]
): ScheduledTimeRangesConfig[] {
  if (rangeCards.length === 0) return [];

  const weekdayMap = new Map<number, Array<{ start: string; end: string }>>();

  rangeCards.forEach((card) => {
    if (card.selectedDays.length === 0) return;
    const validTimeRanges = convertTimeRangesToBackend(card.timeRanges);
    if (validTimeRanges.length === 0) return;

    card.selectedDays.forEach((day) => {
      const weekday = dayOfWeekToNumber(day);
      const existing = weekdayMap.get(weekday) || [];
      validTimeRanges.forEach((tr) => {
        const exists = existing.some((e) => e.start === tr.start && e.end === tr.end);
        if (!exists) existing.push(tr);
      });
      weekdayMap.set(weekday, existing);
    });
  });

  const result: ScheduledTimeRangesConfig[] = [];
  weekdayMap.forEach((timeRanges, weekday) => {
    if (timeRanges.length > 0) {
      result.push({ weekday, time_ranges: timeRanges });
    }
  });

  return result.sort((a, b) => a.weekday - b.weekday);
}

function formatTime12(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export function formatCallWindowDisplay(cards: RangeCard[]): string {
  const parts: string[] = [];
  cards.forEach((card) => {
    const validRanges = card.timeRanges.filter((r) => r.fromTime && r.toTime);
    if (validRanges.length > 0 && card.selectedDays.length > 0) {
      const formatted = validRanges.map(
        (r) => `${formatTime12(r.fromTime!)} - ${formatTime12(r.toTime!)}`
      );
      const daysDisplay =
        card.selectedDays.length === 7 ? "Mon–Sun" : card.selectedDays.join(",");
      parts.push(`${formatted.join(" & ")}, ${daysDisplay}`);
    }
  });
  return parts.join(" | ");
}

export interface CampaignFormSetters {
  setCampaignName: (value: string) => void;
  setPhoneNumber: (value: string) => void;
  setAiAgent: (value: string) => void;
  setLaunchOption: (value: "now" | "later") => void;
  setSelectedDate: (value: Date | undefined) => void;
  setSelectedTime: (value: Date | undefined) => void;
  setTimezone: (value: string) => void;
  setIsEndOfConversationEnabled?: (value: boolean) => void;
  setIsVoicemailHangupEnabled: (value: boolean) => void;
  setMaxCallDuration: (value: string) => void;
  setSilenceTimeout?: (value: string) => void;
  setRingDuration?: (value: string) => void;
  setIsStoreTranscriptsEnabled?: (value: boolean) => void;
  setIsStoreCallRecordingEnabled?: (value: boolean) => void;
  setIsSilenceHangupEnabled?: (value: boolean) => void;
  setRangeCards?: (value: RangeCard[]) => void;
  setTransferToHuman?: (value: boolean) => void;
  setTransferNumber?: (value: string) => void;
  setTransferCriteria?: (value: string) => void;
  setEnforceE164?: (value: boolean) => void;
  setIsPostCallDataExtraction?: (value: boolean) => void;
  setDataPoints?: (value: CustomEvaluation[]) => void;
  setLlmSuccessEvaluationCriteria?: (value: string) => void;
}

export function populateCampaignFormFromDetails(
  campaignDetails: CampaignDetails,
  setters: CampaignFormSetters
): void {
  setters.setCampaignName(campaignDetails.campaign_name || "");
  setters.setPhoneNumber(campaignDetails.phone_number_id || "");
  setters.setAiAgent(campaignDetails.agent_uuid || "");

  const scheduledRaw = (campaignDetails.scheduled_start_time || "").trim();
  const isImmediate =
    typeof campaignDetails.is_send_immediately === "boolean"
      ? campaignDetails.is_send_immediately
      : !scheduledRaw;

  if (isImmediate) {
    setters.setLaunchOption("now");
    setters.setSelectedDate(undefined);
    setters.setSelectedTime(undefined);
  } else if (scheduledRaw) {
    const scheduledDate = new Date(scheduledRaw);
    if (!Number.isNaN(scheduledDate.getTime())) {
      setters.setSelectedDate(scheduledDate);
      setters.setSelectedTime(scheduledDate);
      setters.setLaunchOption("later");
    } else {
      setters.setLaunchOption("now");
      setters.setSelectedDate(undefined);
      setters.setSelectedTime(undefined);
    }
  } else {
    setters.setLaunchOption("later");
    setters.setSelectedDate(undefined);
    setters.setSelectedTime(undefined);
  }

  if (campaignDetails.timezone) {
    setters.setTimezone(campaignDetails.timezone);
  }

  if (campaignDetails.hangup_configuration) {
    setters.setMaxCallDuration(
      String(campaignDetails.hangup_configuration.max_duration_seconds ?? 300)
    );
    setters.setSilenceTimeout?.(
      String(campaignDetails.hangup_configuration.max_silence_duration_seconds ?? 120)
    );
    setters.setRingDuration?.(
      String(campaignDetails.hangup_configuration.max_ring_duration_seconds ?? 30)
    );
  }

  if (campaignDetails.switch_configuration) {
    setters.setIsStoreTranscriptsEnabled?.(
      campaignDetails.switch_configuration.enable_transcript ?? true
    );
    setters.setIsStoreCallRecordingEnabled?.(
      campaignDetails.switch_configuration.enable_recording ?? false
    );
    setters.setIsSilenceHangupEnabled?.(
      campaignDetails.switch_configuration.enable_max_silence_duration_hangup ?? false
    );
    if (campaignDetails.switch_configuration.enable_voicemail !== undefined) {
      setters.setIsVoicemailHangupEnabled(
        campaignDetails.switch_configuration.enable_voicemail
      );
    }
    setters.setIsEndOfConversationEnabled?.(
      campaignDetails.switch_configuration.enable_user_auto_hangup ?? false
    );
  }

  setters.setIsPostCallDataExtraction?.(
    campaignDetails.switch_configuration?.enable_llm_call_evaluation ?? false
  );

  if (campaignDetails.llm_call_evaluation_configuration) {
    const llm = campaignDetails.llm_call_evaluation_configuration;
    setters.setLlmSuccessEvaluationCriteria?.(
      llm.call_success_evaluation?.criteria ??
        "The call was successful if the customer confirmed their appointment."
    );
    setters.setDataPoints?.(llm.custom_evaluations ?? []);
  }

  setters.setTransferToHuman?.(campaignDetails.sip_transfer?.enable_sip_transfer ?? false);
  setters.setTransferNumber?.(campaignDetails.sip_transfer?.static_target?.phone_number || "");
  setters.setTransferCriteria?.(
    campaignDetails.sip_transfer?.static_target?.transfer_description || ""
  );
  setters.setEnforceE164?.(campaignDetails.sip_transfer?.format_e164 ?? true);

  if (
    campaignDetails.scheduled_time_ranges_config?.length &&
    setters.setRangeCards
  ) {
    setters.setRangeCards(convertBackendToRangeCards(campaignDetails.scheduled_time_ranges_config));
  }
}

/** Stub for edit mode when CSV cannot be fetched (CORS); keeps file_url for submit. */
export async function loadCSVFileFromUrl(
  fileUrl: string,
  contactCount?: number
): Promise<{
  name: string;
  contactCount: number;
  previewData: Array<{ phone_number: string; [key: string]: string | undefined }>;
  columnHeaders: string[];
  file_url: string;
}> {
  return {
    name: "recipients.csv",
    contactCount: contactCount ?? 0,
    previewData: [],
    columnHeaders: ["phone_number"],
    file_url: fileUrl,
  };
}
