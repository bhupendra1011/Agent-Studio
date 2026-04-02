/**
 * Expected username/password for the Credentials provider.
 * Set AUTH_USERNAME and AUTH_PASSWORD in `.env.local` for real use.
 * In development only, defaults to demo/demo if unset.
 */
export function getExpectedCredentials():
  | { username: string; password: string }
  | null {
  const fromEnv =
    process.env.AUTH_USERNAME && process.env.AUTH_PASSWORD
      ? {
          username: process.env.AUTH_USERNAME,
          password: process.env.AUTH_PASSWORD,
        }
      : null;

  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV === "development") {
    return { username: "demo", password: "demo" };
  }

  return null;
}
