import type { Session } from "next-auth";

function normalizeList(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Env: comma-separated emails (OAuth) or usernames / user ids (credentials). */
export function isStudioAdminIdentity(input: {
  email?: string | null;
  name?: string | null;
  id?: string | null;
}): boolean {
  const adminEmails = normalizeList(process.env.STUDIO_ADMIN_EMAILS);
  const adminUsers = normalizeList(process.env.STUDIO_ADMIN_USERNAMES);
  const email = input.email?.trim().toLowerCase();
  const name = input.name?.trim().toLowerCase();
  const id = input.id?.trim().toLowerCase();
  if (email && adminEmails.includes(email)) return true;
  if (name && adminUsers.includes(name)) return true;
  if (id && adminUsers.includes(id)) return true;
  return false;
}

export function isStudioAdminSession(session: Session | null): boolean {
  return session?.user?.role === "admin";
}
