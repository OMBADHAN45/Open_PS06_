"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { IndustryPortal } from "@/components/industry/IndustryPortal";

export default function IndustryPage() {
  const setView = useAppStore((s) => s.setView);

  useEffect(() => {
    setView("industry");
  }, [setView]);

  return <IndustryPortal />;
}
