/** Path segment for console v2 MSW (no leading slash), e.g. api/v2 */
export function getConsoleV2MswSegment(): string {
  const p = process.env.NEXT_PUBLIC_API_CONSOLE_V2_PATH || "/api/v2";
  return p.replace(/^\//, "").replace(/\/$/, "");
}
