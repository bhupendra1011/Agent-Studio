import type { TimeRange } from "@/lib/utils/campaign-form-types";

export function validateCallIntervalMs(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return "Minimum interval between calls is required.";
  const parsed = parseInt(trimmed, 10);
  if (Number.isNaN(parsed)) return "Enter a whole number (milliseconds).";
  if (parsed < 100) return "Minimum is 100 ms.";
  if (parsed > 10000) return "Maximum is 10,000 ms.";
  return null;
}

export interface CampaignFormData {
  campaignName: string;
  phoneNumber: string;
  aiAgent: string;
  uploadedFile: { file_url: string } | null;
  launchOption: "now" | "later";
  selectedDate?: Date;
  selectedTime?: Date;
  timezone: string;
  callWindowTimeRanges?: TimeRange[];
  callIntervalMsRaw?: string;
}

export function validateCampaignForm(formData: CampaignFormData): string | null {
  const missing: string[] = [];
  if (!formData.campaignName.trim()) missing.push("Campaign name");
  if (!formData.phoneNumber) missing.push("Phone number");
  if (!formData.aiAgent) missing.push("AI agent");
  if (!formData.uploadedFile?.file_url) missing.push("CSV file");
  if (formData.launchOption === "later") {
    if (!formData.selectedDate || !formData.selectedTime) {
      missing.push("Campaign start date and time");
    } else {
      const combined = new Date(formData.selectedDate);
      combined.setHours(formData.selectedTime.getHours());
      combined.setMinutes(formData.selectedTime.getMinutes());
      combined.setSeconds(0, 0);
      if (combined < new Date()) {
        return "Campaign start time cannot be in the past.";
      }
    }
  }
  if (!formData.timezone) missing.push("Timezone");

  if (formData.callWindowTimeRanges?.length) {
    const invalid = formData.callWindowTimeRanges.filter((range) => {
      if (!range.fromTime || !range.toTime) return true;
      return range.toTime.getTime() <= range.fromTime.getTime();
    });
    if (invalid.length > 0) {
      return "Each call window needs a valid start and end time (end after start).";
    }
  }

  if (formData.callIntervalMsRaw !== undefined) {
    const dialErr = validateCallIntervalMs(formData.callIntervalMsRaw);
    if (dialErr) return dialErr;
  }

  if (missing.length > 0) {
    return `Please complete: ${missing.join(", ")}.`;
  }
  return null;
}

export function formatScheduledStartTime(
  selectedDate?: Date,
  selectedTime?: Date
): string | undefined {
  if (!selectedDate || !selectedTime) return undefined;
  const y = selectedDate.getFullYear();
  const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
  const d = String(selectedDate.getDate()).padStart(2, "0");
  const h = String(selectedTime.getHours()).padStart(2, "0");
  const min = String(selectedTime.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d} ${h}:${min}:00`;
}
