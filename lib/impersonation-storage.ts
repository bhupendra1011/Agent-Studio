/** Client-only POC: simulate “view as user” for admins. Does not switch server identity. */
export const IMPERSONATION_STORAGE_KEY = "studio_impersonate_v1";

export interface ImpersonationPayload {
  label: string;
  note?: string;
}

export function readImpersonation(): ImpersonationPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(IMPERSONATION_STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as ImpersonationPayload;
    if (p && typeof p.label === "string" && p.label.trim()) return p;
    return null;
  } catch {
    return null;
  }
}

export function writeImpersonation(payload: ImpersonationPayload): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(IMPERSONATION_STORAGE_KEY, JSON.stringify(payload));
}

export function clearImpersonation(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(IMPERSONATION_STORAGE_KEY);
}
