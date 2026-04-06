"use client";

import { useEffect, useState, type ReactNode } from "react";

import { IS_MOCK_MODE_ENABLED } from "@/lib/mock-api-bases";

const IS_MOCK_ENABLED = IS_MOCK_MODE_ENABLED;

export function MSWProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!IS_MOCK_ENABLED);

  useEffect(() => {
    if (!IS_MOCK_ENABLED) return;

    import("@/mocks").then(({ initMocks }) =>
      initMocks().then(() => setReady(true))
    );
  }, []);

  // if (!ready) {
  //   return (
  //     <div className="flex min-h-[40vh] items-center justify-center text-sm text-[var(--studio-ink-muted)]">
  //       Loading mock API…
  //     </div>
  //   );
  // }

  return <>{children}</>;
}
