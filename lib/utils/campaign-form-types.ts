export type DayOfWeek = "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

export interface TimeRange {
  id: string;
  fromTime: Date | null;
  toTime: Date | null;
}

export interface RangeCard {
  id: string;
  selectedDays: DayOfWeek[];
  timeRanges: TimeRange[];
}
