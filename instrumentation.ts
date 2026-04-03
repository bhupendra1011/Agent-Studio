import { IS_MOCK_MODE_ENABLED } from "@/lib/mock-api-bases";

export async function register() {
  if (IS_MOCK_MODE_ENABLED && process.env.NEXT_RUNTIME === "nodejs") {
    const { server } = await import("./mocks/server");
    server.listen({ onUnhandledRequest: "bypass" });
  }
}
