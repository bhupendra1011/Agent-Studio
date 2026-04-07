// Campaign-related utility functions and constants

// Timezone option interface
export interface TimezoneOption {
  value: string;
  display: string;
  group: string;
  offset: string;
}

// Timezone options with GMT offsets and grouping
// Format: { value: "timezone/name", display: "timezone/name (GMT±offset)", group: "Continent (UTC±offset)", offset: "GMT±offset" }
const timezoneData: TimezoneOption[] = [
  {
    value: "Pacific/Honolulu",
    display: "Pacific/Honolulu",
    group: "Pacific (UTC-10)",
    offset: "GMT-10",
  },
  {
    value: "America/Anchorage",
    display: "America/Anchorage",
    group: "America (UTC-9)",
    offset: "GMT-9",
  },
  {
    value: "America/Los_Angeles",
    display: "America/Los_Angeles",
    group: "America (UTC-8)",
    offset: "GMT-8",
  },
  {
    value: "America/Vancouver",
    display: "America/Vancouver",
    group: "America (UTC-8)",
    offset: "GMT-8",
  },
  {
    value: "America/Denver",
    display: "America/Denver",
    group: "America (UTC-7)",
    offset: "GMT-7",
  },
  {
    value: "America/Chicago",
    display: "America/Chicago",
    group: "America (UTC-6)",
    offset: "GMT-6",
  },
  {
    value: "America/Mexico_City",
    display: "America/Mexico_City",
    group: "America (UTC-6)",
    offset: "GMT-6",
  },
  {
    value: "America/New_York",
    display: "America/New_York",
    group: "America (UTC-5)",
    offset: "GMT-5",
  },
  {
    value: "America/Sao_Paulo",
    display: "America/Sao_Paulo",
    group: "America (UTC-3)",
    offset: "GMT-3",
  },
  {
    value: "Atlantic/Azores",
    display: "Atlantic/Azores",
    group: "Atlantic (UTC-1)",
    offset: "GMT-1",
  },
  {
    value: "Europe/London",
    display: "Europe/London",
    group: "Europe (UTC+0)",
    offset: "GMT+0",
  },
  {
    value: "Europe/Berlin",
    display: "Europe/Berlin",
    group: "Europe (UTC+1)",
    offset: "GMT+1",
  },
  {
    value: "Africa/Johannesburg",
    display: "Africa/Johannesburg",
    group: "Africa (UTC+2)",
    offset: "GMT+2",
  },
  {
    value: "Africa/Cairo",
    display: "Africa/Cairo",
    group: "Africa (UTC+2)",
    offset: "GMT+2",
  },
  {
    value: "Europe/Moscow",
    display: "Europe/Moscow",
    group: "Europe (UTC+3)",
    offset: "GMT+3",
  },
  {
    value: "Europe/Istanbul",
    display: "Europe/Istanbul",
    group: "Europe (UTC+3)",
    offset: "GMT+3",
  },
  {
    value: "Asia/Tehran",
    display: "Asia/Tehran",
    group: "Asia (UTC+3:30)",
    offset: "GMT+3:30",
  },
  {
    value: "Asia/Dubai",
    display: "Asia/Dubai",
    group: "Asia (UTC+4)",
    offset: "GMT+4",
  },
  {
    value: "Asia/Karachi",
    display: "Asia/Karachi",
    group: "Asia (UTC+5)",
    offset: "GMT+5",
  },
  {
    value: "Asia/Kolkata",
    display: "Asia/Kolkata",
    group: "Asia (UTC+5:30)",
    offset: "GMT+5:30",
  },
  {
    value: "Asia/Kathmandu",
    display: "Asia/Kathmandu",
    group: "Asia (UTC+5:45)",
    offset: "GMT+5:45",
  },
  {
    value: "Asia/Dhaka",
    display: "Asia/Dhaka",
    group: "Asia (UTC+6)",
    offset: "GMT+6",
  },
  {
    value: "Asia/Bangkok",
    display: "Asia/Bangkok",
    group: "Asia (UTC+7)",
    offset: "GMT+7",
  },
  {
    value: "Asia/Shanghai",
    display: "Asia/Shanghai",
    group: "Asia (UTC+8)",
    offset: "GMT+8",
  },
  {
    value: "Asia/Tokyo",
    display: "Asia/Tokyo",
    group: "Asia (UTC+9)",
    offset: "GMT+9",
  },
  {
    value: "Australia/Sydney", // i18n-ignore
    display: "Australia/Sydney", // i18n-ignore
    group: "Australia (UTC+10)",
    offset: "GMT+10",
  },
  {
    value: "Pacific/Guam",
    display: "Pacific/Guam",
    group: "Pacific (UTC+10)",
    offset: "GMT+10",
  },
  {
    value: "Pacific/Noumea",
    display: "Pacific/Noumea",
    group: "Pacific (UTC+11)",
    offset: "GMT+11",
  },
  {
    value: "Pacific/Auckland",
    display: "Pacific/Auckland",
    group: "Pacific (UTC+12)",
    offset: "GMT+12",
  },
  {
    value: "Pacific/Fiji",
    display: "Pacific/Fiji",
    group: "Pacific (UTC+12)",
    offset: "GMT+12",
  },
  {
    value: "Pacific/Chatham",
    display: "Pacific/Chatham",
    group: "Pacific (UTC+12:45)",
    offset: "GMT+12:45",
  },
  {
    value: "Pacific/Tongatapu",
    display: "Pacific/Tongatapu",
    group: "Pacific (UTC+13)",
    offset: "GMT+13",
  },
];

// Legacy format for backward compatibility
export const timezoneOptions = timezoneData.map(tz => ({
  value: tz.value,
  display: `${tz.display} (${tz.offset})`,
}));

// Grouped timezone options for UI display
export interface GroupedTimezoneOption {
  group: string;
  timezones: TimezoneOption[];
}

export const groupedTimezoneOptions: GroupedTimezoneOption[] = (() => {
  const groups = new Map<string, TimezoneOption[]>();

  timezoneData.forEach(tz => {
    if (!groups.has(tz.group)) {
      groups.set(tz.group, []);
    }
    groups.get(tz.group)!.push(tz);
  });

  // Sort timezones within each group alphabetically
  groups.forEach((timezones, group) => {
    timezones.sort((a, b) => a.display.localeCompare(b.display));
  });

  // Convert to array and sort groups alphabetically
  return Array.from(groups.entries())
    .map(([group, timezones]) => ({ group, timezones }))
    .sort((a, b) => a.group.localeCompare(b.group));
})();

/**
 * Detect timezone from IP address
 * Uses a free IP geolocation service
 */
export async function detectTimezoneFromIP(): Promise<string | null> {
  try {
    // Using ipapi.co for IP-based timezone detection
    const response = await fetch("https://ipapi.co/json/", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch IP geolocation");
    }

    const data = await response.json();

    // Check if we got a valid timezone
    if (data.timezone && typeof data.timezone === "string") {
      // Verify the timezone exists in our options
      const isValid = timezoneData.some(tz => tz.value === data.timezone);
      if (isValid) {
        return data.timezone;
      }
    }

    return null;
  } catch (error) {
    console.warn("Failed to detect timezone from IP:", error);
    return null;
  }
}

/**
 * Map country/region to timezone
 * Used as fallback when IP detection fails
 */
const countryToTimezoneMap: Record<string, string> = {
  // China
  CN: "Asia/Shanghai",
  // United States
  US: "America/New_York",
  // Add more mappings as needed
};

/**
 * Get default timezone based on:
 * 1. IP address detection
 * 2. Registration region (from user account)
 * 3. Fallback to Asia/Shanghai (domestic) or America/New_York (international)
 */
export async function getDefaultTimezone(
  userCountry?: string,
  isDomestic: boolean = true
): Promise<string> {
  // Try IP-based detection first
  const ipTimezone = await detectTimezoneFromIP();
  if (ipTimezone) {
    return ipTimezone;
  }

  // Try registration region
  if (userCountry) {
    const mappedTimezone = countryToTimezoneMap[userCountry.toUpperCase()];
    if (mappedTimezone) {
      return mappedTimezone;
    }
  }

  // Fallback based on user type
  return isDomestic ? "Asia/Shanghai" : "America/New_York";
}

// Helper function to convert column names to Title Case
// Converts snake_case, kebab-case, or space-separated to Title Case
export const formatColumnName = (columnName: string): string => {
  if (!columnName) return "";

  // Replace underscores and hyphens with spaces, then split by spaces
  const words = columnName
    .replace(/[_-]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 0);

  // Capitalize first letter of each word
  return words
    .map(word => {
      const safeWord = word || "";
      return safeWord.charAt(0).toUpperCase() + safeWord.slice(1).toLowerCase();
    })
    .join(" ");
};
