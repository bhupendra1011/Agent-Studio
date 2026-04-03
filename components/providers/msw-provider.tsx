"use client";

import { useEffect, useState, type ReactNode } from "react";

const IS_MOCK_ENABLED =
  process.env.NEXT_PUBLIC_MOCK_ENABLED === "true";

export function MSWProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!IS_MOCK_ENABLED);

  useEffect(() => {
    if (!IS_MOCK_ENABLED) return;

    import("@/mocks").then(({ initMocks }) =>
      initMocks().then(() => setReady(true))
    );
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-[var(--studio-ink-muted)]">
        Loading mock API…
      </div>
    );
  }

  return <>{children}</>;
}
