import { z } from "zod";

/** Server-side validation for username/password sign-in (see Auth.js credentials guide). */
export const credentialsSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .max(128, "Username is too long"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password is too long"),
});
