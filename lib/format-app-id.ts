export function maskAppId(key: string | undefined): string {
  if (!key || key.length < 4) return "—";
  return `****${key.slice(-4)}`;
}
