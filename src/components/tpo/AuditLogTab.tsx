"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvatarCircle } from "@/components/shared/primitives";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShieldAlert,
  XCircle,
  Ban,
  AlertTriangle,
  ScrollText,
  Filter,
} from "lucide-react";

type Severity = "violation" | "warning" | "info";
type EventType = "Proctoring Violation" | "Failed Assessment" | "Resume Claim Blocked" | "Low Verification";

interface AuditEvent {
  id: string;
  studentId: string;
  studentName: string;
  eventType: EventType;
  message: string;
  timestamp: number;
  severity: Severity;
}

const SEVERITY_STYLE: Record<Severity, { color: string; bg: string; border: string; label: string }> = {
  violation: { color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.35)", label: "Violation" },
  warning: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.35)", label: "Warning" },
  info: { color: "#9fe0ff", bg: "rgba(159,224,255,0.08)", border: "rgba(159,224,255,0.35)", label: "Info" },
};

const EVENT_ICON: Record<EventType, React.ReactNode> = {
  "Proctoring Violation": <ShieldAlert className="h-3.5 w-3.5" />,
  "Failed Assessment": <XCircle className="h-3.5 w-3.5" />,
  "Resume Claim Blocked": <Ban className="h-3.5 w-3.5" />,
  "Low Verification": <AlertTriangle className="h-3.5 w-3.5" />,
};

// Simulated resume claim blocks (per spec) — derived from the inflated resume demo.
const SIMULATED_CLAIM_BLOCKS: { studentId: string; claim: string }[] = [
  { studentId: "stu_om", claim: "Kubernetes & Redis Microservices" },
  { studentId: "stu_om", claim: "AWS EKS deployment serving 10M req/s" },
  { studentId: "stu_viraj", claim: "Distributed tracing with OpenTelemetry" },
  { studentId: "stu_mayur", claim: "Cassandra multi-region replication" },
];

export function AuditLogTab() {
  const students = useAppStore((s) => s.students);
  const [filter, setFilter] = useState<Severity | "all">("all");

  const events: AuditEvent[] = useMemo(() => {
    const out: AuditEvent[] = [];
    let simIdx = 0;
    for (const student of students) {
      for (const a of student.assessments) {
        if (a.warnings > 0) {
          out.push({
            id: `${student.id}-prov-${a.id}`,
            studentId: student.id,
            studentName: student.name,
            eventType: "Proctoring Violation",
            message: `Proctoring warning during ${a.skill} assessment (${a.warnings} warning${a.warnings === 1 ? "" : "s"})`,
            timestamp: a.takenAt,
            severity: "violation",
          });
        }
        if (!a.passed) {
          out.push({
            id: `${student.id}-fail-${a.id}`,
            studentId: student.id,
            studentName: student.name,
            eventType: "Failed Assessment",
            message: `FAILED ${a.skill} assessment (${a.score}%) — skill removed from verified profile`,
            timestamp: a.takenAt,
            severity: "violation",
          });
        }
      }
      if (student.verificationScore < 80) {
        out.push({
          id: `${student.id}-lowverify`,
          studentId: student.id,
          studentName: student.name,
          eventType: "Low Verification",
          message: `Verification score ${student.verificationScore}% is below institutional threshold (80%)`,
          timestamp: Date.now() - 6 * 3600000,
          severity: "warning",
        });
      }
      for (const block of SIMULATED_CLAIM_BLOCKS.filter((b) => b.studentId === student.id)) {
        out.push({
          id: `${student.id}-block-${simIdx++}`,
          studentId: student.id,
          studentName: student.name,
          eventType: "Resume Claim Blocked",
          message: `Blocked unsupported claim '${block.claim}' on resume`,
          timestamp: Date.now() - (simIdx + 1) * 7200000,
          severity: "warning",
        });
      }
    }
    return out.sort((a, b) => b.timestamp - a.timestamp);
  }, [students]);

  const counts = useMemo(() => {
    const c = { violation: 0, warning: 0, info: 0 };
    for (const e of events) c[e.severity]++;
    return c;
  }, [events]);

  const visible = filter === "all" ? events : events.filter((e) => e.severity === filter);

  return (
    <div className="space-y-5">
      {/* Summary + filter */}
      <div className="drishti-card rounded-2xl p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ef4444]/10 text-[#ef4444]">
              <ScrollText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-white">Audit Log & Violations</h3>
              <p className="text-[11px] text-[var(--drishti-sub)]">
                {events.length} events across the institution · {counts.violation} violations · {counts.warning} warnings
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Filter className="mr-1 h-3.5 w-3.5 text-[var(--drishti-sub)]" />
            <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label="All" color="#a2a9b8" count={events.length} />
            <FilterChip active={filter === "violation"} onClick={() => setFilter("violation")} label="Violations" color="#ef4444" count={counts.violation} />
            <FilterChip active={filter === "warning"} onClick={() => setFilter("warning")} label="Warnings" color="#f59e0b" count={counts.warning} />
            <FilterChip active={filter === "info"} onClick={() => setFilter("info")} label="Info" color="#9fe0ff" count={counts.info} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="drishti-card rounded-2xl p-4">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead className="w-[180px] text-[11px] uppercase tracking-wider text-[var(--drishti-sub)]">Student</TableHead>
              <TableHead className="w-[170px] text-[11px] uppercase tracking-wider text-[var(--drishti-sub)]">Event Type</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider text-[var(--drishti-sub)]">Message</TableHead>
              <TableHead className="w-[110px] text-[11px] uppercase tracking-wider text-[var(--drishti-sub)]">Severity</TableHead>
              <TableHead className="w-[150px] text-right text-[11px] uppercase tracking-wider text-[var(--drishti-sub)]">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 && (
              <TableRow className="border-white/5">
                <TableCell colSpan={5} className="py-10 text-center text-[12px] text-[var(--drishti-sub)]">
                  No audit events match this filter.
                </TableCell>
              </TableRow>
            )}
            {visible.map((e) => {
              const style = SEVERITY_STYLE[e.severity];
              const student = students.find((s) => s.id === e.studentId);
              return (
                <TableRow key={e.id} className="border-white/5 align-top">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {student && <AvatarCircle name={student.name} color={student.avatarColor} />}
                      <div className="min-w-0">
                        <div className="truncate text-[12px] font-semibold text-white">{e.studentName}</div>
                        <div className="text-[10px] text-[var(--drishti-sub)]">{student?.roll}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                      style={{ color: style.color, borderColor: style.border, background: style.bg }}
                    >
                      {EVENT_ICON[e.eventType]}
                      {e.eventType}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[420px]">
                    <span className="text-[12px] leading-relaxed text-white/85">{e.message}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="font-semibold"
                      style={{ color: style.color, borderColor: style.border, background: style.bg }}
                    >
                      {style.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-[11px] text-[var(--drishti-sub)]">
                      {new Date(e.timestamp).toLocaleString()}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  color,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color: string;
  count: number;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={`h-7 gap-1.5 px-2.5 text-[11px] transition ${
        active
          ? "border-white/30 bg-white/10 text-white"
          : "border-white/10 bg-transparent text-[var(--drishti-sub)] hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
      <span className="rounded-full bg-white/10 px-1 text-[10px] text-[var(--drishti-sub)]">{count}</span>
    </Button>
  );
}
