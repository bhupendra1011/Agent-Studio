/**
 * Path segment for Studio EN API (must match MSW handlers and mock-mode axios base).
 * Example: /api/v1/studio/en or /your-prefix/api/v1/studio/en
 */
export function getStudioEnPath(): string {
  const p = process.env.NEXT_PUBLIC_STUDIO_EN_PATH || "/api/v1/studio/en";
  return p.startsWith("/") ? p : `/${p}`;
}

/** MSW pathname wildcard prefix, e.g. *api/v1/studio/en (leading * + path without leading slash) */
export function getStudioEnMswPatternPrefix(): string {
  return `*${getStudioEnPath().replace(/^\//, "")}`;
}
