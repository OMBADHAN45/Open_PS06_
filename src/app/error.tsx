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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f4f7fe] px-6 text-center text-slate-900">
      <div className="absolute inset-0 drishti-grid-bg opacity-40 pointer-events-none" />
      <div className="relative z-10 max-w-md space-y-5 rounded-2xl border border-slate-200/80 bg-white p-8 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600 shadow-sm">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Something went unexpected</h2>
          <p className="mt-1.5 text-[13px] text-slate-500 leading-relaxed">
            DRISHTI encountered a temporary runtime error. All your profile evidence and saved states are safe.
          </p>
        </div>

        {error?.message && (
          <div className="rounded-lg border border-rose-200 bg-rose-50/70 p-3 text-left font-mono text-[11px] text-rose-700">
            {error.message}
          </div>
        )}

        <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Button
            onClick={() => reset()}
            className="bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-semibold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            <Home className="mr-1.5 h-3.5 w-3.5" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
