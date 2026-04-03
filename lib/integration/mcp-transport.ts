import type { McpTransportApi } from "@/lib/types/api";

const TO_API: Record<string, McpTransportApi> = {
  sse: "sse",
  http: "http",
  streamable_http: "streamable_http",
};

export function uiTransportToApi(value: string): McpTransportApi {
  return TO_API[value] ?? "sse";
}

/** Normalize API / list quirks (e.g. SHTTP) for UI */
export function formatMcpTransport(transport: string): string {
  const t = transport?.toUpperCase?.() ?? "";
  if (t === "SHTTP" || t === "STREAMABLE_HTTP" || transport === "streamable_http")
    return "Streamable HTTP";
  if (t === "SSE" || transport === "sse") return "SSE";
  if (t === "HTTP" || transport === "http") return "HTTP";
  return transport || "—";
}
