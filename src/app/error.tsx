"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Home, ShieldAlert } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("DRISHTI Application Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#02060f] px-6 text-center text-white">
      <div className="absolute inset-0 drishti-grid-bg opacity-20 pointer-events-none" />
      <div className="relative z-10 max-w-md space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight">Something went unexpected</h2>
          <p className="mt-1.5 text-[13px] text-[var(--drishti-sub)] leading-relaxed">
            DRISHTI encountered a temporary runtime error. All your profile evidence and saved states are safe.
          </p>
        </div>

        {error?.message && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-left font-mono text-[11px] text-red-300">
            {error.message}
          </div>
        )}

        <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Button
            onClick={() => reset()}
            className="bg-[var(--drishti-blue)] text-[#02060f] hover:bg-[#9fe0ff] font-semibold"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
            className="border-white/15 text-white hover:bg-white/10"
          >
            <Home className="mr-1.5 h-3.5 w-3.5" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
