"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { TpoPortal } from "@/components/tpo/TpoPortal";

export default function TpoPage() {
  const setView = useAppStore((s) => s.setView);

  useEffect(() => {
    setView("tpo");
  }, [setView]);

  return <TpoPortal />;
}
