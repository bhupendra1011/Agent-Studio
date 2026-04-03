import { getStudioEnPath } from "@/lib/studio-en-path";

/** MSW + same-origin Studio/Console API bases. Set NEXT_PUBLIC_MOCK_ENABLED=true (local + Vercel). */
export const IS_MOCK_MODE_ENABLED =
  process.env.NEXT_PUBLIC_MOCK_ENABLED === "true";

function mockSsrOrigin(): string {
  return (
    process.env.MOCK_SSR_ORIGIN ||
    `http://127.0.0.1:${process.env.PORT ?? "3000"}`
  );
}

export function mockApiOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return mockSsrOrigin();
}

function getConsoleV2Path(): string {
  const p = process.env.NEXT_PUBLIC_API_CONSOLE_V2_PATH || "/api/v2";
  return p.startsWith("/") ? p : `/${p}`;
}

/**
 * Axios base URL for Studio EN routes (paths like /agent-pipeline).
 */
export function getStudioAxiosBaseUrl(): string {
  if (!IS_MOCK_MODE_ENABLED) {
    return (process.env.NEXT_PUBLIC_API_STUDIO_BASE_URL ?? "").replace(
      /\/$/,
      ""
    );
  }
  return `${mockApiOrigin()}${getStudioEnPath()}`;
}

/**
 * Axios base URL for console API v2 (paths like /projects).
 */
export function getConsoleV2AxiosBaseUrl(): string {
  if (!IS_MOCK_MODE_ENABLED) {
    const explicit = process.env.NEXT_PUBLIC_API_CONSOLE_V2_BASE_URL?.replace(
      /\/$/,
      ""
    );
    if (explicit) return explicit;
    const studio = process.env.NEXT_PUBLIC_API_STUDIO_BASE_URL || "";
    try {
      const u = new URL(studio);
      return `${u.origin}${getConsoleV2Path()}`;
    } catch {
      return "";
    }
  }
  return `${mockApiOrigin()}${getConsoleV2Path()}`;
}
