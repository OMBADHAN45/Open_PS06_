"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { StudentPortal } from "@/components/student/StudentPortal";

export default function StudentPage() {
  const setView = useAppStore((s) => s.setView);

  useEffect(() => {
    setView("student");
  }, [setView]);

  return <StudentPortal />;
}
