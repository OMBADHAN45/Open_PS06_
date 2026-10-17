"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { PROCTOR_CONFIG, pickQuestions, type MCQ, type WarningEvent, type WarningType } from "@/lib/proctor-config";
import {
  loadCocoSsd,
  loadFaceDetector,
  detectObjects,
  detectFaces,
  drawBoxes,
  captureSnapshot,
} from "@/lib/proctor-engine";
import { skillsByCategory } from "@/lib/taxonomy";
import {
  Camera,
  Mic,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  Download,
  RotateCcw,
  Eye,
  EyeOff,
  Volume2,
  Monitor,
  Ban,
  Lock,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Phase = "idle" | "handshake" | "loading" | "exam" | "report";

const MONITORS = [
  { id: 1, name: "Fullscreen Enforcement", icon: Monitor },
  { id: 2, name: "Tab / Window Switch", icon: EyeOff },
  { id: 3, name: "Camera Stream Monitor", icon: Camera },
  { id: 4, name: "Microphone Audio Monitor", icon: Volume2 },
  { id: 5, name: "Face Detection (MediaPipe)", icon: Eye },
  { id: 6, name: "Object Detection (COCO-SSD)", icon: Ban },
  { id: 7, name: "Action & Shortcut Blocker", icon: Lock },
  { id: 8, name: "Cooldown & Auto-Submit", icon: ShieldCheck },
];

export function ProctoringTab() {
  const activeStudentId = useAppStore((s) => s.activeStudentId);
  const students = useAppStore((s) => s.students);
  const recordSession = useAppStore((s) => s.recordProctorSession);
  const applyResult = useAppStore((s) => s.applyAssessmentResult);
  const setIsProctoringActive = useAppStore((s) => s.setIsProctoringActive);
  const student = students.find((s) => s.id === activeStudentId) ?? students[0];

  const [phase, setPhase] = useState<Phase>("idle");

  // Disable global chatbot during active proctored assessment to enforce anti-cheat policy
  useEffect(() => {
    if (phase === "exam" || phase === "loading" || phase === "handshake") {
      setIsProctoringActive(true);
    } else {
      setIsProctoringActive(false);
    }
    return () => {
      setIsProctoringActive(false);
    };
  }, [phase, setIsProctoringActive]);
  const [skill, setSkill] = useState<string>("");
  const [questions, setQuestions] = useState<MCQ[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [secondsLeft, setSecondsLeft] = useState(PROCTOR_CONFIG.EXAM_MINUTES * 60);
  const [warnings, setWarnings] = useState<WarningEvent[]>([]);
  const [warnCount, setWarnCount] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [modelStatus, setModelStatus] = useState<{ coco: string; face: string }>({ coco: "idle", face: "idle" });
  const [report, setReport] = useState<{
    score: number;
    passed: boolean;
    correct: number;
    total: number;
    events: WarningEvent[];
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cocoModelRef = useRef<any>(null);
  const faceDetectorRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const detectIntervalRef = useRef<any>(null);
  const countdownRef = useRef<any>(null);
  const warnCountRef = useRef(0);
  const lastWarnRef = useRef<Record<string, number>>({});
  const faceAwaySinceRef = useRef<number | null>(null);
  const loudSinceRef = useRef<number | null>(null);
  const submittedRef = useRef(false);
  const eventsRef = useRef<WarningEvent[]>([]);
  const videoRef2 = useRef<HTMLVideoElement | null>(null); // keep latest video for snapshots

  const chooseSkill = (s: string) => {
    setSkill(s);
    setPhase("handshake");
  };

  const logWarning = useCallback(
    (type: WarningType, message: string, snapshot?: string) => {
      const now = Date.now();
      const last = lastWarnRef.current[type] || 0;
      if (now - last < PROCTOR_CONFIG.COOLDOWN_MS) return; // cooldown
      lastWarnRef.current[type] = now;
      const ev: WarningEvent = { type, time: now, message, snapshot: snapshot ?? (videoRef2.current ? captureSnapshot(videoRef2.current, 0.4) : undefined) };
      eventsRef.current = [...eventsRef.current, ev];
      setWarnings([...eventsRef.current]);
      const c = warnCountRef.current + 1;
      warnCountRef.current = c;
      setWarnCount(c);
      if (c >= PROCTOR_CONFIG.MAX_WARNINGS && !submittedRef.current) {
        submitExam(true);
      }
    },
    []
  );

  const submitExam = useCallback(
    (auto = false) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      // compute score
      let correct = 0;
      const qs = questionsRef.current;
      for (let i = 0; i < qs.length; i++) {
        if (answersRef.current[i] === qs[i].answer) correct++;
      }
      const total = qs.length || 1;
      const score = Math.round((correct / total) * 100);
      const passed = score >= PROCTOR_CONFIG.PASS_THRESHOLD;
      const evs = eventsRef.current;
      setReport({ score, passed, correct, total, events: evs });
      recordSession({ skill: skillRef.current, score, passed, warnings: evs.length, log: evs, takenAt: Date.now() });
      applyResult(activeStudentIdRef.current, skillRef.current, score, passed, evs.length);
      // cleanup
      cleanup();
      setPhase("report");
      void auto;
    },
    []
  );

  // keep refs in sync
  const questionsRef = useRef<MCQ[]>([]);
  const answersRef = useRef<Record<number, number>>({});
  const skillRef = useRef("");
  const activeStudentIdRef = useRef(activeStudentId);
  useEffect(() => { questionsRef.current = questions; }, [questions]);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { skillRef.current = skill; }, [skill]);
  useEffect(() => { activeStudentIdRef.current = activeStudentId; }, [activeStudentId]);

  const cleanup = useCallback(() => {
    if (detectIntervalRef.current) clearInterval(detectIntervalRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch { /* ignore */ }
      audioCtxRef.current = null;
    }
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  // ---- shortcut / action blocker ----
  useEffect(() => {
    if (phase !== "exam") return;
    const block = (e: Event, type: WarningType, msg: string) => {
      e.preventDefault();
      logWarning(type, msg);
    };
    const onContext = (e: MouseEvent) => block(e, "shortcut_blocked", "Right-click blocked");
    const onCopy = (e: ClipboardEvent) => block(e, "shortcut_blocked", "Copy blocked");
    const onPaste = (e: ClipboardEvent) => block(e, "shortcut_blocked", "Paste blocked");
    const onCut = (e: ClipboardEvent) => block(e, "shortcut_blocked", "Cut blocked");
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "f12" || (e.ctrlKey && (k === "c" || k === "v" || k === "u" || k === "p")) || (e.ctrlKey && e.shiftKey && k === "i")) {
        block(e, "shortcut_blocked", `Shortcut ${e.ctrlKey ? "Ctrl+" : ""}${e.shiftKey ? "Shift+" : ""}${e.key} blocked`);
      } else if (e.key === "PrintScreen") {
        block(e, "shortcut_blocked", "PrintScreen blocked");
      }
    };
    document.addEventListener("contextmenu", onContext);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    document.addEventListener("cut", onCut);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("cut", onCut);
      document.removeEventListener("keydown", onKey);
    };
  }, [phase, logWarning]);

  // ---- visibility / fullscreen / camera monitors ----
  useEffect(() => {
    if (phase !== "exam") return;
    const onVis = () => {
      if (document.hidden) logWarning("tab_switch", "Tab/window switched (Page Visibility API)");
    };
    const onBlur = () => logWarning("tab_switch", "Window lost focus (blur)");
    const onFsChange = () => {
      if (!document.fullscreenElement) logWarning("fullscreen_exit", "Exited fullscreen during exam");
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onBlur);
    document.addEventListener("fullscreenchange", onFsChange);
    // camera stream monitor
    const camInterval = setInterval(() => {
      const stream = streamRef.current;
      const video = videoRef.current;
      if (!stream || !video) return;
      const live = stream.getVideoTracks().some((t) => t.readyState === "live" && !t.muted);
      if (!live) logWarning("camera_off", "Camera stream stopped or disconnected");
    }, 2000);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("fullscreenchange", onFsChange);
      clearInterval(camInterval);
    };
  }, [phase, logWarning]);

  // ---- audio meter + loud noise monitor ----
  useEffect(() => {
    if (phase !== "exam") return;
    let mounted = true;
    const stream = streamRef.current;
    if (!stream) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyserRef.current = analyser;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!mounted) return;
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const avg = sum / data.length;
        setAudioLevel(Math.min(100, Math.round(avg)));
        if (avg > PROCTOR_CONFIG.LOUD_LIMIT) {
          if (loudSinceRef.current === null) loudSinceRef.current = Date.now();
          else if (Date.now() - loudSinceRef.current > PROCTOR_CONFIG.FACE_AWAY_SECONDS * 1000) {
            logWarning("loud_noise", `Ambient noise exceeded ${PROCTOR_CONFIG.LOUD_LIMIT} for >${PROCTOR_CONFIG.FACE_AWAY_SECONDS}s`);
            loudSinceRef.current = null;
          }
        } else {
          loudSinceRef.current = null;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      /* audio not available */
    }
    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase, logWarning]);

  // ---- object + face detection loop ----
  useEffect(() => {
    if (phase !== "exam") return;
    let active = true;
    // best-effort model load
    loadCocoSsd()
      .then((m) => {
        if (!active) return;
        cocoModelRef.current = m;
        setModelStatus((s) => ({ ...s, coco: "ready" }));
      })
      .catch(() => setModelStatus((s) => ({ ...s, coco: "offline" })));
    loadFaceDetector()
      .then((d) => {
        if (!active) return;
        faceDetectorRef.current = d;
        setModelStatus((s) => ({ ...s, face: "ready" }));
      })
      .catch(() => setModelStatus((s) => ({ ...s, face: "offline" })));

    const run = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        detectIntervalRef.current = setTimeout(run, PROCTOR_CONFIG.DETECT_INTERVAL_MS);
        return;
      }
      let objects: any[] = [];
      let faces = { count: 0, faces: [] as any[] };
      try {
        if (cocoModelRef.current) objects = await detectObjects(cocoModelRef.current, video);
      } catch { /* ignore */ }
      try {
        if (faceDetectorRef.current) faces = await detectFaces(faceDetectorRef.current, video, Date.now());
      } catch { /* ignore */ }

      drawBoxes(canvas, video, objects, faces, [...PROCTOR_CONFIG.BAD_OBJECTS]);

      // object-based warnings
      const persons = objects.filter((o) => o.class === "person");
      if (persons.length > 1) {
        logWarning("multiple_persons", `Multiple persons detected (${persons.length})`);
      }
      const bad = objects.find((o) => PROCTOR_CONFIG.BAD_OBJECTS.includes(o.class));
      if (bad) {
        logWarning("bad_object", `Forbidden object detected: ${bad.class}`);
      }

      // face-based warnings (use face detector if available, else infer from person count)
      const faceCount = faces.count || persons.length;
      if (faceCount === 0) {
        if (faceAwaySinceRef.current === null) faceAwaySinceRef.current = Date.now();
        else if (Date.now() - faceAwaySinceRef.current > PROCTOR_CONFIG.FACE_AWAY_SECONDS * 1000) {
          logWarning("no_face", "No face detected for >3s");
          faceAwaySinceRef.current = null;
        }
      } else if (faceCount > 1) {
        if (faceDetectorRef.current) logWarning("multiple_faces", `Multiple faces detected (${faceCount})`);
      } else {
        faceAwaySinceRef.current = null;
      }

      detectIntervalRef.current = setTimeout(run, PROCTOR_CONFIG.DETECT_INTERVAL_MS);
    };
    run();
    return () => {
      active = false;
      if (detectIntervalRef.current) clearTimeout(detectIntervalRef.current);
    };
  }, [phase, logWarning]);

  // ---- countdown ----
  useEffect(() => {
    if (phase !== "exam") return;
    countdownRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          submitExam(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [phase, submitExam]);

  // ---- start exam ----
  const startExam = async () => {
    setPhase("loading");
    submittedRef.current = false;
    warnCountRef.current = 0;
    eventsRef.current = [];
    setWarnings([]);
    setWarnCount(0);
    setAnswers({});
    setSecondsLeft(PROCTOR_CONFIG.EXAM_MINUTES * 60);
    const qs = pickQuestions(skill, 5);
    setQuestions(qs);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: true });
      streamRef.current = stream;
      // wait for video element
      await new Promise<void>((resolve) => {
        const v = videoRef.current;
        if (!v) return resolve();
        v.srcObject = stream;
        v.onloadedmetadata = () => v.play().then(() => resolve()).catch(() => resolve());
      });
      videoRef2.current = videoRef.current;
      // enter fullscreen
      try {
        await document.documentElement.requestFullscreen();
      } catch { /* fullscreen may be blocked */ }
      setPhase("exam");
    } catch (e) {
      console.error(e);
      // If camera denied, still allow exam with degraded mode
      setPhase("exam");
    }
  };

  const resetToIdle = () => {
    cleanup();
    setPhase("idle");
    setSkill("");
    setReport(null);
    setWarnings([]);
    setWarnCount(0);
  };

  // ---------- RENDER ----------
  if (!student) return <div className="p-8 text-slate-800">No student selected.</div>;

  const verifiedSkills = student.skills.filter((s) => s.status === "verified").map((s) => s.canonical);
  const unverified = student.skills.filter((s) => s.status === "unverified").map((s) => s.canonical);
  const cats = skillsByCategory();

  return (
    <div className="space-y-5">
      {/* Header summary */}
      <div className="drishti-card flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white bg-white/85 p-4 shadow-[0_8px_30px_rgb(79,70,229,0.06)]">
        <div>
          <h2 className="text-lg font-bold text-slate-900">🛡️ Assessment &amp; Proctoring</h2>
          <p className="text-[12.5px] text-slate-500">
            Take proctored skill assessments. Pass with ≥{PROCTOR_CONFIG.PASS_THRESHOLD}% to unlock the{" "}
            <span className="font-semibold text-emerald-700">✓ Verified</span> badge. Fail, and the skill is auto-stripped from your profile.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800 font-semibold shadow-2xs">✓ {verifiedSkills.length} Verified</Badge>
          <Badge className="border-amber-200 bg-amber-100 text-amber-800 font-semibold shadow-2xs">⚠ {unverified.length} Unverified</Badge>
        </div>
      </div>

      {phase === "idle" && (
        <SkillPicker student={student} cats={cats} verifiedSkills={verifiedSkills} unverified={unverified} onPick={chooseSkill} proctorSessions={useAppStore.getState().proctorSessions} />
      )}

      {phase === "handshake" && (
        <HandshakeScreen skill={skill} onCancel={resetToIdle} onStart={startExam} />
      )}

      {phase === "loading" && (
        <div className="drishti-card flex flex-col items-center gap-3 rounded-xl border border-white bg-white/85 p-12 text-center shadow-[0_8px_30px_rgb(79,70,229,0.06)]">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-slate-800 font-medium">Requesting camera &amp; microphone, entering fullscreen, loading AI models…</p>
        </div>
      )}

      {phase === "exam" && (
        <ExamStage
          skill={skill}
          questions={questions}
          answers={answers}
          setAnswers={setAnswers}
          secondsLeft={secondsLeft}
          warnCount={warnCount}
          warnings={warnings}
          audioLevel={audioLevel}
          modelStatus={modelStatus}
          videoRef={videoRef}
          canvasRef={canvasRef}
          onSubmit={() => submitExam(false)}
        />
      )}

      {phase === "report" && report && (
        <ReportStage
          skill={skill}
          report={report}
          studentName={student.name}
          onRetake={resetToIdle}
        />
      )}
    </div>
  );
}

/* ---------------- Skill Picker ---------------- */
function SkillPicker({
  student,
  cats,
  verifiedSkills,
  unverified,
  onPick,
  proctorSessions,
}: {
  student: any;
  cats: Record<string, string[]>;
  verifiedSkills: string[];
  unverified: string[];
  onPick: (s: string) => void;
  proctorSessions: Record<string, any>;
}) {
  return (
    <div className="space-y-4">
      <div className="drishti-card rounded-xl border border-white bg-white/85 p-5 shadow-[0_8px_30px_rgb(79,70,229,0.06)]">
        <h3 className="mb-1 text-sm font-bold text-slate-900">Choose a skill to assess</h3>
        <p className="mb-3 text-[12px] text-slate-500">
          Unverified skills are highlighted in amber. Verified skills can be re-tested to improve your score.
        </p>
        <div className="space-y-3">
          {Object.entries(cats).map(([cat, skills]) => (
            <div key={cat}>
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{cat}</div>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => {
                  const isVerified = verifiedSkills.includes(s);
                  const isUnverified = unverified.includes(s);
                  const hasSession = !!proctorSessions[s];
                  return (
                    <button
                      key={s}
                      onClick={() => onPick(s)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-[12px] font-medium transition cursor-pointer shadow-2xs",
                        isVerified && "border-emerald-200 bg-emerald-100 text-emerald-800 font-semibold hover:bg-emerald-200/80",
                        isUnverified && "border-amber-200 bg-amber-100 text-amber-800 font-semibold hover:bg-amber-200/80",
                        !isVerified && !isUnverified && "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-800"
                      )}
                    >
                      {s}
                      {isVerified && " ✓"}
                      {hasSession && " ↻"}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Handshake ---------------- */
function HandshakeScreen({ skill, onCancel, onStart }: { skill: string; onCancel: () => void; onStart: () => void }) {
  return (
    <div className="drishti-card mx-auto max-w-2xl rounded-xl border border-white bg-white/85 p-6 shadow-[0_8px_30px_rgb(79,70,229,0.06)]">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-indigo-600" />
        <h3 className="text-base font-bold text-slate-900">Proctored Assessment — {skill}</h3>
      </div>
      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-[12.5px] text-amber-800 leading-relaxed shadow-2xs">
        <strong>Privacy notice:</strong> This assessment will access your <strong>camera</strong>, <strong>microphone</strong>, and record an <strong>event log</strong> (tab switches, object detections, audio levels, webcam snapshots on warnings). Data stays on-device for this demo.
      </div>
      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        {MONITORS.map((m) => (
          <div key={m.id} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 text-[12.5px] text-slate-800 shadow-2xs">
            <m.icon className="h-4 w-4 text-indigo-600" />
            <span className="font-medium">{m.id}. {m.name}</span>
          </div>
        ))}
      </div>
      <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-[12.5px] text-slate-600 shadow-2xs">
        <div className="mb-1 font-bold text-slate-900">Exam config</div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5">
          <li>• {PROCTOR_CONFIG.EXAM_MINUTES} minutes</li>
          <li>• 5 randomized MCQs</li>
          <li>• Pass threshold: {PROCTOR_CONFIG.PASS_THRESHOLD}%</li>
          <li>• Max warnings: {PROCTOR_CONFIG.MAX_WARNINGS}</li>
          <li>• Bad objects: {PROCTOR_CONFIG.BAD_OBJECTS.join(", ")}</li>
          <li>• Loud noise limit: {PROCTOR_CONFIG.LOUD_LIMIT}</li>
        </ul>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={onCancel} className="text-slate-500 hover:text-slate-900 cursor-pointer">Cancel</Button>
        <Button onClick={onStart} className="bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-semibold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 transition-all cursor-pointer">
          <Play className="mr-1 h-4 w-4" /> Start Proctored Assessment
        </Button>
      </div>
    </div>
  );
}

/* ---------------- Exam Stage ---------------- */
function ExamStage({
  skill,
  questions,
  answers,
  setAnswers,
  secondsLeft,
  warnCount,
  warnings,
  audioLevel,
  modelStatus,
  videoRef,
  canvasRef,
  onSubmit,
}: {
  skill: string;
  questions: MCQ[];
  answers: Record<number, number>;
  setAnswers: (a: Record<number, number>) => void;
  secondsLeft: number;
  warnCount: number;
  warnings: WarningEvent[];
  audioLevel: number;
  modelStatus: { coco: string; face: string };
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onSubmit: () => void;
}) {
  const mm = Math.floor(secondsLeft / 60);
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const lowTime = secondsLeft < 60;
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      {/* Questions */}
      <div className="space-y-4">
        <div className="drishti-card flex items-center justify-between rounded-xl border border-white bg-white/85 p-3.5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Clock className={cn("h-4 w-4", lowTime ? "text-rose-600" : "text-indigo-600")} />
            {skill} Assessment
          </div>
          <div className={cn("font-mono text-lg font-bold", lowTime ? "text-rose-600" : "text-slate-900")}>{mm}:{ss}</div>
        </div>
        {questions.map((q, i) => (
          <div key={q.id} className="drishti-card rounded-xl border border-white bg-white/85 p-4 shadow-[0_8px_30px_rgb(79,70,229,0.06)]">
            <div className="mb-3 text-[13px] font-semibold text-slate-900">
              <span className="mr-2 text-slate-400">Q{i + 1}.</span>{q.question}
            </div>
            <div className="space-y-1.5">
              {q.options.map((opt, oi) => {
                const sel = answers[i] === oi;
                return (
                  <button
                    key={oi}
                    onClick={() => setAnswers({ ...answers, [i]: oi })}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left text-[12.5px] transition cursor-pointer shadow-2xs",
                      sel ? "border-indigo-500 bg-indigo-50/80 text-indigo-950 font-semibold" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <span className={cn("flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-bold", sel ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 text-slate-500")}>
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <Button onClick={onSubmit} className="w-full bg-emerald-600 text-white font-bold hover:bg-emerald-500 shadow-md shadow-emerald-500/25 cursor-pointer">
          <CheckCircle2 className="mr-1 h-4 w-4" /> Submit Assessment
        </Button>
      </div>

      {/* Proctor panel */}
      <div className="space-y-3">
        <div className="drishti-card rounded-xl border border-white bg-white/85 p-3.5 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[12px] font-bold text-slate-900">Live Webcam + AI Overlay</span>
            <div className="flex items-center gap-1.5">
              <span className="live-dot inline-block h-2 w-2 rounded-full bg-rose-500" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600">REC</span>
            </div>
          </div>
          <div className="proctor-stage relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-slate-950">
            <video ref={videoRef} muted playsInline />
            <canvas ref={canvasRef} />
            <div className="pointer-events-none absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">
              {modelStatus.face === "ready" ? "Face: MediaPipe ✓" : modelStatus.face === "offline" ? "Face: offline" : "Face: loading…"}
              {" · "}
              {modelStatus.coco === "ready" ? "Objects: COCO-SSD ✓" : modelStatus.coco === "offline" ? "Objects: offline" : "Objects: loading…"}
            </div>
          </div>
        </div>

        {/* Audio meter */}
        <div className="drishti-card rounded-xl border border-white bg-white/85 p-3.5 shadow-sm">
          <div className="mb-1.5 flex items-center justify-between text-[12px]">
            <span className="flex items-center gap-1.5 font-bold text-slate-900"><Volume2 className="h-3.5 w-3.5 text-indigo-600" /> Audio Level</span>
            <span className={cn("font-semibold", audioLevel > PROCTOR_CONFIG.LOUD_LIMIT ? "text-rose-600" : "text-slate-500")}>{audioLevel}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn("h-full rounded-full transition-all", audioLevel > PROCTOR_CONFIG.LOUD_LIMIT ? "bg-rose-500" : "bg-emerald-500")}
              style={{ width: `${Math.min(100, audioLevel)}%` }}
            />
          </div>
        </div>

        {/* Warning counter */}
        <div className="drishti-card rounded-xl border border-white bg-white/85 p-3.5 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[12px] font-bold text-slate-900">Warnings</span>
            <span className={cn("font-mono text-lg font-bold", warnCount >= PROCTOR_CONFIG.MAX_WARNINGS ? "text-rose-600" : warnCount > 0 ? "text-amber-600" : "text-emerald-600")}>
              {warnCount} / {PROCTOR_CONFIG.MAX_WARNINGS}
            </span>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: PROCTOR_CONFIG.MAX_WARNINGS }).map((_, i) => (
              <div key={i} className={cn("h-1.5 flex-1 rounded-full", i < warnCount ? "bg-rose-500" : "bg-slate-200")} />
            ))}
          </div>
          <p className="mt-2 text-[10.5px] text-slate-500">Auto-submit triggers at {PROCTOR_CONFIG.MAX_WARNINGS} warnings.</p>
        </div>

        {/* Event log */}
        <div className="drishti-card max-h-72 overflow-y-auto rounded-xl border border-white bg-white/85 p-3.5 shadow-sm">
          <div className="mb-2 text-[12px] font-bold text-slate-900">Live Event Log</div>
          {warnings.length === 0 ? (
            <p className="text-[11px] text-slate-400">No warnings. Stay focused 👀</p>
          ) : (
            <div className="space-y-1.5">
              {[...warnings].reverse().map((w, i) => (
                <div key={i} className="flex items-start gap-2 rounded border border-slate-200 bg-slate-50/70 p-2 shadow-2xs">
                  {w.snapshot ? (
                    <img src={w.snapshot} alt="snap" className="h-8 w-10 shrink-0 rounded object-cover" />
                  ) : (
                    <div className="flex h-8 w-10 shrink-0 items-center justify-center rounded bg-slate-100"><AlertTriangle className="h-3.5 w-3.5 text-amber-500" /></div>
                  )}
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-amber-700">{w.type.replace(/_/g, " ")}</div>
                    <div className="truncate text-[10.5px] text-slate-600">{w.message}</div>
                    <div className="text-[9.5px] text-slate-400">{new Date(w.time).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Report ---------------- */
function ReportStage({ skill, report, studentName, onRetake }: { skill: string; report: { score: number; passed: boolean; correct: number; total: number; events: WarningEvent[] }; studentName: string; onRetake: () => void }) {
  const downloadLog = () => {
    const blob = new Blob([JSON.stringify({ skill, student: studentName, ...report, timestamp: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proctor-log-${skill}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-4">
      <div className="drishti-card rounded-xl border border-white bg-white/85 p-6 text-center shadow-[0_8px_30px_rgb(79,70,229,0.06)]">
        <div className={cn("mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full shadow-xs", report.passed ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
          {report.passed ? <CheckCircle2 className="h-9 w-9" /> : <XCircle className="h-9 w-9" />}
        </div>
        <h3 className="text-2xl font-bold text-slate-900">{report.score}/100</h3>
        <p className={cn("mt-1 text-sm font-bold", report.passed ? "text-emerald-700" : "text-rose-700")}>
          {report.passed ? `PASSED — ${skill} badge unlocked ✓` : `FAILED — ${skill} removed from your profile`}
        </p>
        <p className="mt-1 text-[12px] text-slate-500">
          {report.correct}/{report.total} correct · {report.events.length} proctoring warning(s)
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button onClick={downloadLog} variant="outline" className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium shadow-xs cursor-pointer">
            <Download className="mr-1 h-4 w-4 text-indigo-600" /> Download JSON Log
          </Button>
          <Button onClick={onRetake} className="bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-semibold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 cursor-pointer">
            <RotateCcw className="mr-1 h-4 w-4" /> Retake / New Assessment
          </Button>
        </div>
      </div>

      <div className="drishti-card rounded-xl border border-white bg-white/85 p-5 shadow-[0_8px_30px_rgb(79,70,229,0.06)]">
        <h4 className="mb-3 text-sm font-bold text-slate-900">Proctor Event Log ({report.events.length})</h4>
        {report.events.length === 0 ? (
          <p className="text-[12px] font-semibold text-emerald-700">✓ Clean session — zero proctoring violations.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr className="border-b border-slate-200">
                  <th className="py-2.5 pr-2">#</th>
                  <th className="py-2.5 pr-2">Type</th>
                  <th className="py-2.5 pr-2">Message</th>
                  <th className="py-2.5 pr-2">Time</th>
                  <th className="py-2.5">Snapshot</th>
                </tr>
              </thead>
              <tbody>
                {report.events.map((e, i) => (
                  <tr key={i} className="border-b border-slate-100 align-top hover:bg-slate-50/60">
                    <td className="py-2.5 pr-2 text-slate-400">{i + 1}</td>
                    <td className="py-2.5 pr-2"><Badge className="border-amber-200 bg-amber-100 text-amber-800 font-semibold">{e.type.replace(/_/g, " ")}</Badge></td>
                    <td className="py-2.5 pr-2 font-medium text-slate-800">{e.message}</td>
                    <td className="py-2.5 pr-2 text-slate-500">{new Date(e.time).toLocaleTimeString()}</td>
                    <td className="py-2.5">
                      {e.snapshot ? <img src={e.snapshot} alt="snap" className="h-10 w-14 rounded object-cover shadow-2xs" /> : <span className="text-slate-400">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
