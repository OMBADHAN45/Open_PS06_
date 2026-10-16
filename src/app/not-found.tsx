"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#02060f] px-6 text-center text-white">
      <div className="absolute inset-0 drishti-grid-bg opacity-20 pointer-events-none" />
      <div className="relative z-10 max-w-md space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[var(--drishti-gold)]/40 bg-[var(--drishti-gold)]/10 text-[var(--drishti-gold)] text-2xl font-black">
          404
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">Page Not Found</h1>
          <p className="mt-2 text-[13px] text-[var(--drishti-sub)] leading-relaxed">
            The page or route you requested could not be located in the DRISHTI evidence ledger.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button className="w-full bg-[var(--drishti-gold)] text-[#02060f] hover:bg-[#ffe2b2] font-semibold">
              <Home className="mr-1.5 h-3.5 w-3.5" />
              Return to Platform
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
