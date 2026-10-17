"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f4f7fe] px-6 text-center text-slate-900">
      <div className="absolute inset-0 drishti-grid-bg opacity-40 pointer-events-none" />
      <div className="relative z-10 max-w-md space-y-6 rounded-2xl border border-slate-200/80 bg-white p-8 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 text-indigo-600 text-2xl font-black shadow-sm">
          404
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Page Not Found</h1>
          <p className="mt-2 text-[13px] text-slate-500 leading-relaxed">
            The page or route you requested could not be located in the DRISHTI evidence ledger.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button className="w-full bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all">
              <Home className="mr-1.5 h-3.5 w-3.5" />
              Return to Platform
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
