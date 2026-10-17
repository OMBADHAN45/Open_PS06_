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
import { KanbanSquare, MessageSquarePlus, Search, Users, Calendar, TrendingUp } from "lucide-react";

export function ApplicationTrackerTab() {
  return (
    <Tabs defaultValue="tracker" className="space-y-4">
      <TabsList className="bg-slate-100/80 h-10 border border-indigo-100 p-1">
        <TabsTrigger value="tracker" className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm text-slate-600 font-semibold cursor-pointer">
          🔄 Application Tracker
        </TabsTrigger>
        <TabsTrigger value="prep" className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm text-slate-600 font-semibold cursor-pointer">
          📚 Interview Prep Bank
        </TabsTrigger>
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
  const student = students.find((s) => s.id === activeStudentId) ?? students[0];

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
      <div className="drishti-card flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white bg-white/85 p-4 shadow-[0_8px_30px_rgb(79,70,229,0.06)]">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <KanbanSquare className="h-4 w-4 text-indigo-600" /> Synchronized Application Pipeline
          </h2>
          <p className="text-[12px] text-slate-500">Stages sync live with Industry &amp; TPO portals. {myApps.length} active applications.</p>
        </div>
        <div className="flex gap-2">
          <Badge className="border-indigo-100 bg-indigo-50/60 text-indigo-700 font-semibold shadow-2xs">{myApps.length} Applied</Badge>
          <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800 font-semibold shadow-2xs">{myApps.filter((a) => a.stage === "Offer").length} Offers</Badge>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {PIPELINE_STAGES.map((stage) => {
          const count = byStage[stage].length;
          const isOffer = stage === "Offer";
          return (
            <div key={stage} className="w-64 shrink-0">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[12px] font-bold text-slate-900">{stage}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{count}</span>
              </div>
              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 shadow-2xs" style={{ minHeight: 90 }}>
                {count === 0 ? (
                  <p className="px-1 py-4 text-center text-[11px] text-slate-400">—</p>
                ) : (
                  byStage[stage].map((a) => {
                    const job = jobs.find((j) => j.id === a.jobId);
                    return (
                      <div key={a.id} className={`rounded-lg border p-3 shadow-2xs transition hover:shadow-xs ${isOffer ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-white"}`}>
                        <div className="flex items-center gap-2">
                          <AvatarCircle name={student.name} color={student.avatarColor} />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[12px] font-bold text-slate-900">{job?.company}</div>
                            <div className="truncate text-[10.5px] text-slate-500">{job?.role} · {job?.ctc}</div>
                          </div>
                        </div>
                        {a.fitScore != null && <div className="mt-2"><FitScoreBadge score={a.fitScore} /></div>}
                        <div className="mt-1.5 text-[10px] text-slate-400 font-medium">Applied {new Date(a.appliedAt).toLocaleDateString()}</div>
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
  const student = students.find((s) => s.id === activeStudentId) ?? students[0];
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
      <div className="drishti-card rounded-xl border border-white bg-white/85 p-5 shadow-[0_8px_30px_rgb(79,70,229,0.06)]">
        <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-900">
          <MessageSquarePlus className="h-4 w-4 text-amber-500" /> Log an Interview Question
        </h3>
        <p className="mb-3 text-[11.5px] text-slate-500">Help your batch — share real questions you faced. Contributions build the company-wise prep bank.</p>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <Select value={company} onValueChange={setCompany}>
            <SelectTrigger className="bg-white border-slate-200 text-slate-900 shadow-2xs"><SelectValue placeholder="Company" /></SelectTrigger>
            <SelectContent className="bg-white text-slate-900 border-slate-200 shadow-xl">{companies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role (e.g. SDE-1)" className="bg-white border-slate-200 text-slate-900 shadow-2xs" />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-white border-slate-200 text-slate-900 shadow-2xs"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white text-slate-900 border-slate-200 shadow-xl">{["Technical", "System Design", "Frontend", "Databases", "Machine Learning", "HR", "Behavioral"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="bg-white border-slate-200 text-slate-900 shadow-2xs"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white text-slate-900 border-slate-200 shadow-xl">{["Easy", "Medium", "Hard"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Type the interview question you were asked…" className="mt-2.5 bg-white border-slate-200 text-slate-900 shadow-2xs" />
        <Button onClick={submit} disabled={!question.trim() || !company.trim()} className="mt-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold shadow-md shadow-amber-500/25 hover:brightness-105 cursor-pointer">
          <MessageSquarePlus className="mr-1 h-4 w-4" /> Add to Prep Bank
        </Button>
      </div>

      <div className="drishti-card rounded-xl border border-white bg-white/85 p-5 shadow-[0_8px_30px_rgb(79,70,229,0.06)]">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <TrendingUp className="h-4 w-4 text-indigo-600" /> Crowdsourced Interview Prep Bank ({interviewQuestions.length})
          </h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search questions…" className="h-8 w-44 bg-white border-slate-200 pl-8 text-[12px] shadow-2xs" />
            </div>
            <Select value={filterCompany} onValueChange={setFilterCompany}>
              <SelectTrigger className="h-8 w-36 bg-white border-slate-200 text-[12px] shadow-2xs"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-white text-slate-900 border-slate-200 shadow-xl"><SelectItem value="all">All companies</SelectItem>{companies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          {filtered.map((q) => (
            <div key={q.id} className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] font-semibold text-slate-900">{q.question}</p>
                <Badge className={
                  q.difficulty === "Hard" ? "border-rose-200 bg-rose-100 text-rose-700 font-semibold" :
                  q.difficulty === "Medium" ? "border-amber-200 bg-amber-100 text-amber-700 font-semibold" :
                  "border-emerald-200 bg-emerald-100 text-emerald-700 font-semibold"
                }>{q.difficulty}</Badge>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-slate-900"><Users className="h-3 w-3 text-indigo-600" />{q.company}</span>
                <span>{q.role}</span>
                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">{q.category}</Badge>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-slate-400" />{new Date(q.reportedAt).toLocaleDateString()}</span>
                <span className="ml-auto text-slate-400">reported by <span className="font-semibold text-indigo-600">{q.reportedBy}</span></span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="py-4 text-center text-[12px] text-slate-400">No questions found. Be the first to contribute!</p>}
        </div>
      </div>
    </div>
  );
}
