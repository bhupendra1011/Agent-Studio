import { CallHistoryPageClient } from "@/components/observe/call-history-page-client";
import { Suspense } from "react";

export default function CallHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl p-8 text-sm text-muted-foreground">
          Loading call history…
        </div>
      }
    >
      <CallHistoryPageClient />
    </Suspense>
  );
}
