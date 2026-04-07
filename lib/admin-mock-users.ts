export type AdminPortalUserRole = "admin" | "user";

export interface AdminPortalUserRow {
  id: string;
  email: string;
  role: AdminPortalUserRole;
  /** Tenant / ISV display name; null for platform admin row */
  isv: string | null;
  /** Last 4 shown masked */
  agoraIdSuffix: string;
}

export const INITIAL_ADMIN_MOCK_USERS: AdminPortalUserRow[] = [
  {
    id: "u1",
    email: "john@acme.com",
    role: "user",
    isv: "Acme Corp",
    agoraIdSuffix: "7890",
  },
  {
    id: "u2",
    email: "jane@beta.io",
    role: "user",
    isv: "Beta Inc",
    agoraIdSuffix: "1234",
  },
  {
    id: "u3",
    email: "admin@studio.com",
    role: "admin",
    isv: null,
    agoraIdSuffix: "9999",
  },
];
