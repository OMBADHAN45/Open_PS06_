"use client";

import { useMemo, useState } from "react";
import { useAppStore, PIPELINE_STAGES } from "@/lib/store";
import { FitScoreBadge, AvatarCircle } from "@/components/shared/primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { KanbanSquare, MessageSquarePlus, Search, ChevronRight, Users, Calendar, TrendingUp } from "lucide-react";

export function ApplicationTrackerTab() {
  return (
    <Tabs defaultValue="tracker" className="space-y-4">
      <TabsList className="bg-white/5">
        <TabsTrigger value="tracker" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">🔄 Application Tracker</TabsTrigger>
        <TabsTrigger value="prep" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">📚 Interview Prep Bank</TabsTrigger>
      </TabsList>
      <TabsContent value="tracker"><KanbanBoard /></TabsContent>
      <TabsContent value="prep"><PrepBank /></TabsContent>
    </Tabs>
  );
}

function KanbanBoard() {
  const activeStudentId = useAppStore((s) => s.activeStudentId);
  const students = useAppStore((s) => s.students);
  const applications = useAppStore((s) => s.applications);
  const jobs = useAppStore((s) => s.jobs);
  const student = students.find((s) => s.id === activeStudentId);

  const myApps = applications.filter((a) => a.studentId === activeStudentId);

  const byStage = useMemo(() => {
    const map: Record<string, typeof myApps> = {};
    for (const st of PIPELINE_STAGES) map[st] = [];
    for (const a of myApps) map[a.stage].push(a);
    return map;
  }, [myApps]);

  if (!student) return null;

  return (
    <div className="space-y-3">
      <div className="drishti-card flex flex-wrap items-center justify-between gap-3 rounded-xl p-4">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white"><KanbanSquare className="h-4 w-4 text-[var(--drishti-blue)]" /> Synchronized Application Pipeline</h2>
          <p className="text-[12px] text-[var(--drishti-sub)]">Stages sync live with Industry & TPO portals. {myApps.length} active applications.</p>
        </div>
        <div className="flex gap-2">
          <Badge className="border-white/15 bg-white/5 text-white">{myApps.length} Applied</Badge>
          <Badge className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400">{myApps.filter((a) => a.stage === "Offer").length} Offers</Badge>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {PIPELINE_STAGES.map((stage) => {
          const count = byStage[stage].length;
          const isOffer = stage === "Offer";
          return (
            <div key={stage} className="w-64 shrink-0">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[12px] font-semibold text-white">{stage}</span>
                <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-[var(--drishti-sub)]">{count}</span>
              </div>
              <div className="space-y-2 rounded-lg border border-white/10 bg-white/[0.02] p-2" style={{ minHeight: 80 }}>
                {count === 0 ? (
                  <p className="px-1 py-3 text-center text-[11px] text-[var(--drishti-sub)]">—</p>
                ) : (
                  byStage[stage].map((a) => {
                    const job = jobs.find((j) => j.id === a.jobId);
                    return (
                      <div key={a.id} className={`rounded-lg border p-2.5 ${isOffer ? "border-emerald-500/40 bg-emerald-500/5" : "border-white/10 bg-white/[0.03]"}`}>
                        <div className="flex items-center gap-2">
                          <AvatarCircle name={student.name} color={student.avatarColor} />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[12px] font-semibold text-white">{job?.company}</div>
                            <div className="truncate text-[10.5px] text-[var(--drishti-sub)]">{job?.role} · {job?.ctc}</div>
                          </div>
                        </div>
                        {a.fitScore != null && <div className="mt-2"><FitScoreBadge score={a.fitScore} /></div>}
                        <div className="mt-1.5 text-[10px] text-[var(--drishti-sub)]">Applied {new Date(a.appliedAt).toLocaleDateString()}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PrepBank() {
  const interviewQuestions = useAppStore((s) => s.interviewQuestions);
  const jobs = useAppStore((s) => s.jobs);
  const students = useAppStore((s) => s.students);
  const addQ = useAppStore((s) => s.addInterviewQuestion);
  const activeStudentId = useAppStore((s) => s.activeStudentId);
  const student = students.find((s) => s.id === activeStudentId);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("Technical");
  const [difficulty, setDifficulty] = useState("Medium");
  const [search, setSearch] = useState("");
  const [filterCompany, setFilterCompany] = useState("all");

  const companies = Array.from(new Set(jobs.map((j) => j.company)));
  const filtered = interviewQuestions
    .filter((q) => filterCompany === "all" || q.company === filterCompany)
    .filter((q) => !search || q.question.toLowerCase().includes(search.toLowerCase()) || q.company.toLowerCase().includes(search.toLowerCase()));

  const submit = () => {
    if (!question.trim() || !company.trim() || !student) return;
    addQ({ company, role: role || "General", question, category, difficulty: difficulty as any, reportedBy: student.name });
    setQuestion("");
    window.dispatchEvent(new CustomEvent("drishti:toast", { detail: { title: "Question logged", description: `Added to ${company} prep bank` } }));
  };

  return (
    <div className="space-y-4">
      <div className="drishti-card rounded-xl p-4">
        <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-white"><MessageSquarePlus className="h-4 w-4 text-[var(--drishti-gold)]" /> Log an Interview Question</h3>
        <p className="mb-3 text-[11.5px] text-[var(--drishti-sub)]">Help your batch — share real questions you faced. Contributions build the company-wise prep bank.</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Select value={company} onValueChange={setCompany}>
            <SelectTrigger className="bg-[#0a0f1c]"><SelectValue placeholder="Company" /></SelectTrigger>
            <SelectContent className="bg-[#0a0f1c] text-white">{companies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" className="bg-[#0a0f1c]" />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-[#0a0f1c]"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#0a0f1c] text-white">{["Technical", "System Design", "Frontend", "Databases", "Machine Learning", "HR", "Behavioral"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="bg-[#0a0f1c]"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#0a0f1c] text-white">{["Easy", "Medium", "Hard"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Type the interview question you were asked…" className="mt-2 bg-[#0a0f1c]" />
        <Button onClick={submit} disabled={!question.trim() || !company.trim()} className="mt-2 bg-[var(--drishti-gold)] text-[#02060f] hover:bg-[#ffe2b2]">
          <MessageSquarePlus className="mr-1 h-4 w-4" /> Add to Prep Bank
        </Button>
      </div>

      <div className="drishti-card rounded-xl p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white"><TrendingUp className="h-4 w-4 text-[var(--drishti-blue)]" /> Crowdsourced Interview Prep Bank ({interviewQuestions.length})</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--drishti-sub)]" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search questions…" className="h-8 w-44 bg-[#0a0f1c] pl-7 text-[12px]" />
            </div>
            <Select value={filterCompany} onValueChange={setFilterCompany}>
              <SelectTrigger className="h-8 w-36 bg-[#0a0f1c] text-[12px]"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#0a0f1c] text-white"><SelectItem value="all">All companies</SelectItem>{companies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          {filtered.map((q) => (
            <div key={q.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] text-white">{q.question}</p>
                <Badge className={
                  q.difficulty === "Hard" ? "border-red-500/40 bg-red-500/10 text-red-400" :
                  q.difficulty === "Medium" ? "border-amber-500/40 bg-amber-500/10 text-amber-400" :
                  "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                }>{q.difficulty}</Badge>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--drishti-sub)]">
                <span className="flex items-center gap-1 text-white"><Users className="h-3 w-3" />{q.company}</span>
                <span>{q.role}</span>
                <Badge variant="outline" className="border-white/15 text-[var(--drishti-sub)]">{q.category}</Badge>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(q.reportedAt).toLocaleDateString()}</span>
                <span className="ml-auto">reported by <span className="text-[var(--drishti-blue)]">{q.reportedBy}</span></span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="py-4 text-center text-[12px] text-[var(--drishti-sub)]">No questions found. Be the first to contribute!</p>}
        </div>
      </div>
    </div>
  );
}
