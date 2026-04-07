/** Unix timestamps in seconds (UTC). */

export function getCurrentUnixTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

export function getUnixTimestampDaysAgo(daysAgo: number): number {
  return getCurrentUnixTimestamp() - daysAgo * 24 * 60 * 60;
}

/** Default window for global call history list when the API requires a range. */
export function getDefaultCallHistoryTimeRange(): {
  fromTime: number;
  toTime: number;
} {
  const toTime = getCurrentUnixTimestamp();
  const fromTime = getUnixTimestampDaysAgo(90);
  return { fromTime, toTime };
}

export function calculatePreviousPeriodRange(
  fromTime: number,
  toTime: number
): { fromTime: number; toTime: number } {
  const duration = toTime - fromTime;
  const prevToTime = fromTime - 1;
  const prevFromTime = prevToTime - duration;
  return { fromTime: prevFromTime, toTime: prevToTime };
}

export function getStartOfDayInTimezone(date: Date, timezone: string): number {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dateStr = formatter.format(date);
  const [year, month, day] = dateStr.split("-").map(Number);
  const testDateUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const tzFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = tzFormatter.formatToParts(testDateUTC);
  const tzHour = parseInt(parts.find((p) => p.type === "hour")?.value || "12");
  const tzMinute = parseInt(parts.find((p) => p.type === "minute")?.value || "0");
  const offsetHours = tzHour - 12;
  const offsetMinutes = tzMinute;
  const midnightUTC = Date.UTC(year, month - 1, day, -offsetHours, -offsetMinutes, 0, 0);
  return Math.floor(midnightUTC / 1000);
}

export function getEndOfDayInTimezone(date: Date, timezone: string): number {
  return getStartOfDayInTimezone(date, timezone) + 86399;
}

export function getStartOfDayDaysAgoInTimezone(
  daysAgo: number,
  timezone: string
): number {
  const today = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayStr = formatter.format(today);
  const [year, month, day] = todayStr.split("-").map(Number);
  const todayInTz = new Date(year, month - 1, day);
  const daysAgoDate = new Date(todayInTz);
  daysAgoDate.setDate(daysAgoDate.getDate() - daysAgo);
  return getStartOfDayInTimezone(daysAgoDate, timezone);
}

export function getEndOfTodayInTimezone(timezone: string): number {
  return getEndOfDayInTimezone(new Date(), timezone);
}
