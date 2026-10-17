"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAppStore, type ActiveRole, type ChatMessage, type ChatAction } from "@/lib/store";
import { ROLE_CONFIGS, getDrishtiBotResponse } from "@/lib/chatbot-mock";
import {
  Bot,
  Sparkles,
  X,
  Send,
  Trash2,
  Moon,
  Sun,
  ShieldAlert,
  ChevronDown,
  UserCheck,
  Building2,
  GraduationCap,
  ArrowRight,
  Copy,
  Check,
  Flame,
  Search,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function GlobalChatbot() {
  const isOpen = useAppStore((s) => s.isOpen);
  const setIsOpen = useAppStore((s) => s.setIsOpen);
  const toggleIsOpen = useAppStore((s) => s.toggleIsOpen);
  const activeRole = useAppStore((s) => s.activeRole);
  const setActiveRole = useAppStore((s) => s.setActiveRole);
  const chatHistory = useAppStore((s) => s.chatHistory);
  const addChatMessage = useAppStore((s) => s.addChatMessage);
  const clearChatHistory = useAppStore((s) => s.clearChatHistory);
  const isProctoringActive = useAppStore((s) => s.isProctoringActive);
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const openInspector = useAppStore((s) => s.openInspector);
  const openProof = useAppStore((s) => s.openProof);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronize active role based on current portal / view
  useEffect(() => {
    if (view === "student") {
      setActiveRole("Student");
    } else if (view === "industry") {
      setActiveRole("Industry");
    } else if (view === "tpo") {
      setActiveRole("TPO");
    }
  }, [view, setActiveRole]);

  // Synchronize theme state with documentElement classList
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    }
  }, []);

  const toggleTheme = () => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      const willBeDark = !root.classList.contains("dark");
      if (willBeDark) {
        root.classList.add("dark");
        setIsDarkMode(true);
      } else {
        root.classList.remove("dark");
        setIsDarkMode(false);
      }
    }
  };

  // Scroll to bottom on chat update or typing state change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, chatHistory, isTyping]);

  // If chat history is empty, populate with role welcome message
  useEffect(() => {
    if (chatHistory.length === 0) {
      const config = ROLE_CONFIGS[activeRole];
      const initialGreeting: ChatMessage = {
        id: "greet_" + activeRole.toLowerCase(),
        sender: "ai",
        role: activeRole,
        timestamp: Date.now(),
        text: config.welcomeMessage,
      };
      addChatMessage(initialGreeting);
    }
  }, [activeRole, chatHistory.length, addChatMessage]);

  // Close chat immediately if proctoring becomes active to prevent cheating
  useEffect(() => {
    if (isProctoringActive && isOpen) {
      setIsOpen(false);
    }
  }, [isProctoringActive, isOpen, setIsOpen]);

  // Handle message send
  const handleSend = async (textToSend?: string) => {
    const query = (textToSend ?? input).trim();
    if (!query || isTyping) return;

    setInput("");

    // 1. Add user message
    const userMsg: ChatMessage = {
      id: "user_" + Math.random().toString(36).slice(2, 9),
      sender: "user",
      role: activeRole,
      timestamp: Date.now(),
      text: query,
    };
    addChatMessage(userMsg);

    // 2. Trigger AI thinking
    setIsTyping(true);

    try {
      const aiReply = await getDrishtiBotResponse(query, activeRole);
      addChatMessage(aiReply);
    } catch {
      const errorReply: ChatMessage = {
        id: "err_" + Math.random().toString(36).slice(2, 9),
        sender: "ai",
        role: activeRole,
        timestamp: Date.now(),
        text: "I encountered a transient issue processing your request. Please try again.",
      };
      addChatMessage(errorReply);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle Quick Prompt Click
  const handleQuickPrompt = (promptText: string) => {
    handleSend(promptText);
  };

  // Handle Action Button click (e.g. navigate to tab, inspect candidate)
  const handleAction = (action: ChatAction) => {
    if (action.action === "tab" && action.payload) {
      // Navigate to portal if needed
      if (activeRole === "Student" && view !== "student") setView("student");
      if (activeRole === "Industry" && view !== "industry") setView("industry");
      if (activeRole === "TPO" && view !== "tpo") setView("tpo");

      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("drishti:goto-tab", { detail: action.payload })
        );
      }, 80);
    } else if (action.action === "inspector" && action.payload?.studentId) {
      if (view !== "industry") setView("industry");
      setTimeout(() => {
        openInspector(action.payload.studentId, action.payload.jobId);
      }, 80);
    } else if (action.action === "proof" && action.payload) {
      openProof(action.payload.studentId, action.payload.skill);
    }
  };

  // Copy message to clipboard
  const handleCopy = (id: string, text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  // =========================================================================
  // CRITICAL ANTI-CHEAT ENFORCEMENT:
  // If the student is inside the Online Assessment Proctoring System,
  // the entire chatbot widget is completely suppressed from the DOM.
  // =========================================================================
  if (isProctoringActive) {
    return (
      <div
        className="fixed bottom-4 right-4 z-[100] hidden items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-900 shadow-md md:flex"
        title="Drishti AI Copilot is disabled during proctored exams to prevent cheating."
      >
        <ShieldAlert className="h-4 w-4 text-amber-600" />
        <span>Copilot Locked: Assessment Active</span>
      </div>
    );
  }

  const currentConfig = ROLE_CONFIGS[activeRole];

  return (
    <>
      {/* ----------------------------------------------------------------- */}
      {/* 1. FLOATING ACTION BUTTON (FAB)                                  */}
      {/* ----------------------------------------------------------------- */}
      <div className="fixed bottom-5 right-5 z-[100] flex items-center gap-3">
        {/* Subtle pill hint when closed on desktop */}
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 drishti-glass border border-indigo-200/50 dark:border-white/10 px-3.5 py-1.5 rounded-full shadow-lg text-[12px] font-medium text-[var(--ink)] cursor-pointer hover:border-indigo-400 transition-all active:scale-95 animate-in fade-in slide-in-from-right-4 duration-300"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            <span>Ask Drishti AI</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold">
              {currentConfig.title}
            </span>
          </div>
        )}

        <button
          id="drishti-copilot-fab"
          type="button"
          onClick={toggleIsOpen}
          aria-label={isOpen ? "Minimize Drishti Copilot" : "Open Drishti Copilot"}
          className={cn(
            "relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 cursor-pointer active:scale-95",
            "bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400",
            isOpen ? "ring-4 ring-indigo-300/40 rotate-90" : "hover:scale-105"
          )}
        >
          {isOpen ? (
            <X className="h-6 w-6 transition-transform" />
          ) : (
            <>
              <Bot className="h-7 w-7 transition-transform group-hover:scale-110" />
              {/* Online Green Pulsing Indicator */}
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-900" />
              </span>
            </>
          )}
        </button>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 2. CHAT WINDOW (SLIDE-UP WIDGET)                                  */}
      {/* ----------------------------------------------------------------- */}
      {isOpen && (
        <div
          id="drishti-copilot-window"
          className={cn(
            "fixed bottom-22 right-5 z-[100] flex flex-col overflow-hidden rounded-2xl shadow-2xl transition-all duration-300",
            "w-[380px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-6.5rem)]",
            "drishti-glass border border-indigo-200/70 dark:border-white/10",
            "bg-[var(--bg-surface)] text-[var(--ink)]",
            "animate-in fade-in slide-in-from-bottom-8 duration-200"
          )}
        >
          {/* ----- FIXED HEADER ----- */}
          <div className="relative flex items-center justify-between border-b border-indigo-100/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 px-4 py-3 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] font-bold tracking-tight text-[var(--ink)] leading-none">
                    Drishti Copilot
                  </h3>
                  {/* Live Green Online Dot */}
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </div>
                {/* Role Switcher Pill / Selector */}
                <div className="relative mt-1">
                  <button
                    type="button"
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                  >
                    <span>Persona: <strong>{currentConfig.title}</strong></span>
                    <ChevronDown className="h-3 w-3" />
                  </button>

                  {/* Dropdown for Manual Role Preview */}
                  {roleDropdownOpen && (
                    <div className="absolute left-0 top-6 z-50 w-44 rounded-xl border border-indigo-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl text-[12px]">
                      {(["Student", "Industry", "TPO"] as ActiveRole[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => {
                            setActiveRole(r);
                            setRoleDropdownOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition cursor-pointer",
                            activeRole === r
                              ? "bg-indigo-50 dark:bg-indigo-950/60 font-semibold text-indigo-600 dark:text-indigo-300"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          )}
                        >
                          {r === "Student" && <GraduationCap className="h-3.5 w-3.5" />}
                          {r === "Industry" && <Building2 className="h-3.5 w-3.5" />}
                          {r === "TPO" && <UserCheck className="h-3.5 w-3.5" />}
                          <span>{ROLE_CONFIGS[r].title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Header Control Buttons */}
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              {/* Theme Toggle (Vibrant Enterprise Light <-> NEURAL Dark) */}
              <button
                type="button"
                onClick={toggleTheme}
                className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                title={isDarkMode ? "Switch to Vibrant Enterprise Light" : "Switch to NEURAL Dark"}
                aria-label="Toggle Theme"
              >
                {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* Clear Chat Button */}
              <button
                type="button"
                onClick={clearChatHistory}
                className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                title="Clear Chat History"
                aria-label="Clear chat"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

              {/* Minimize (X) Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                title="Minimize Copilot"
                aria-label="Minimize"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ----- PERSONA SUB-BANNER ----- */}
          <div className="flex items-center justify-between border-b border-indigo-50 dark:border-white/5 bg-indigo-50/50 dark:bg-indigo-950/20 px-3.5 py-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500" />
              {currentConfig.description}
            </span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {currentConfig.badge}
            </span>
          </div>

          {/* ----- SCROLLABLE MESSAGE AREA ----- */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-[13px] leading-relaxed select-text">
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col gap-1.5 max-w-[90%]",
                  msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                {/* Bubble Container */}
                <div
                  className={cn(
                    "relative group rounded-2xl p-3.5 shadow-sm transition-all text-[13px]",
                    msg.sender === "user"
                      ? "rounded-br-xs bg-gradient-to-r from-blue-600 to-indigo-500 text-white"
                      : "rounded-bl-xs bg-[var(--bg-base)] border border-[var(--hair)] text-[var(--ink)]"
                  )}
                >
                  {/* Markdown-style Content Formatting */}
                  <FormattedMessageContent content={msg.text} isUser={msg.sender === "user"} />

                  {/* Metadata: Candidate Cards if provided */}
                  {msg.metadata?.candidateCards && msg.metadata.candidateCards.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-indigo-100 dark:border-white/10 pt-2">
                      {msg.metadata.candidateCards.map((card) => (
                        <div
                          key={card.id}
                          className="flex items-center justify-between gap-2 rounded-xl border border-indigo-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-2.5 shadow-xs"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="flex h-7 w-7 items-center justify-center rounded-full text-white text-[11px] font-bold"
                              style={{ backgroundColor: card.avatarColor || "#4f46e5" }}
                            >
                              {card.name[0]}
                            </div>
                            <div>
                              <div className="text-[12px] font-bold text-slate-900 dark:text-slate-100 leading-tight">
                                {card.name}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                SQL: <span className="text-emerald-600 font-semibold">{card.sqlScore}%</span> · Fit: {card.overallFit}%
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAction({ action: "inspector", label: "Inspect", payload: { studentId: card.id } })}
                            className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950/70 px-2 py-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 cursor-pointer"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Metadata: Metrics Chips */}
                  {msg.metadata?.metrics && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-indigo-100 dark:border-white/10 pt-2">
                      {msg.metadata.metrics.map((m, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-0.5 text-[10.5px] font-medium text-indigo-700 dark:text-indigo-300"
                        >
                          <span>{m.label}:</span>
                          <strong>{m.value}</strong>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons if returned */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-indigo-100 dark:border-white/10 pt-2">
                      {msg.actions.map((act, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAction(act)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white/90 dark:bg-slate-800/90 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-300 shadow-2xs hover:bg-indigo-50 dark:hover:bg-slate-700 transition cursor-pointer active:scale-95"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Copy Button (AI messages) */}
                  {msg.sender === "ai" && (
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  )}
                </div>

                {/* Timestamp */}
                <span className="text-[10px] text-slate-400 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}

            {/* AI Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-400 mr-auto p-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500 text-white">
                  <Bot className="h-3.5 w-3.5 animate-bounce" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl bg-[var(--bg-base)] border border-[var(--hair)] px-3 py-2 shadow-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse delay-150" />
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse delay-300" />
                  <span className="ml-1 text-[11px] font-medium text-slate-500">Drishti AI is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ----- SUGGESTED QUICK PROMPTS ----- */}
          <div className="border-t border-indigo-50 dark:border-white/5 bg-slate-50/70 dark:bg-slate-900/50 p-2">
            <div className="text-[10.5px] font-semibold text-slate-400 dark:text-slate-500 mb-1 px-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>Suggested for {currentConfig.title}:</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {currentConfig.quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickPrompt(prompt)}
                  disabled={isTyping}
                  className="whitespace-nowrap shrink-0 rounded-full border border-indigo-100 dark:border-slate-800 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-300 hover:bg-indigo-50/80 dark:hover:bg-slate-700 transition cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* ----- STICKY INPUT AREA ----- */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="border-t border-indigo-100/80 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 p-3 backdrop-blur-md"
          >
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={currentConfig.placeholder}
                disabled={isTyping}
                className="w-full rounded-full border border-indigo-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 pl-4 pr-11 text-[13px] text-[var(--ink)] placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-inner"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                aria-label="Send message"
                className={cn(
                  "absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-md transition-all cursor-pointer",
                  input.trim() && !isTyping
                    ? "bg-gradient-to-r from-blue-600 to-indigo-500 hover:scale-105 active:scale-95"
                    : "bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-60"
                )}
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-1.5 flex items-center justify-between px-2 text-[10px] text-slate-400 dark:text-slate-500">
              <span>Press Enter to send · Role-aware AI</span>
              <span className="font-mono">{input.length}/280</span>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

/**
 * Lightweight helper to render bold text, bullet points, headers, and code tags
 * without requiring bulky external dependencies.
 */
function FormattedMessageContent({ content, isUser }: { content: string; isUser: boolean }) {
  if (isUser) {
    return <p className="whitespace-pre-wrap">{content}</p>;
  }

  const lines = content.split("\n");

  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Headers ###
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="font-bold text-[13.5px] text-slate-900 dark:text-slate-100 mt-2 mb-1">
              {trimmed.replace(/^###\s+/, "")}
            </h4>
          );
        }
        if (trimmed.startsWith("#### ")) {
          return (
            <h5 key={idx} className="font-semibold text-[12.5px] text-indigo-700 dark:text-indigo-300 mt-1.5 mb-0.5">
              {trimmed.replace(/^####\s+/, "")}
            </h5>
          );
        }

        // Bullet points
        if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
          const itemText = trimmed.replace(/^[\*\-•]\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-1.5 ml-1">
              <span className="text-indigo-500 dark:text-indigo-400 mt-1 text-[10px]">•</span>
              <span className="flex-1">
                <InlineMarkup text={itemText} />
              </span>
            </div>
          );
        }

        // Numbered list items
        if (/^\d+\.\s+/.test(trimmed)) {
          const match = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (match) {
            return (
              <div key={idx} className="flex items-start gap-1.5 ml-1 mt-1">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-[11px] shrink-0">
                  {match[1]}.
                </span>
                <span className="flex-1">
                  <InlineMarkup text={match[2]} />
                </span>
              </div>
            );
          }
        }

        // Empty line
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Standard paragraph
        return (
          <p key={idx}>
            <InlineMarkup text={line} />
          </p>
        );
      })}
    </div>
  );
}

/**
 * Parses bold text (**text**), italics (*text*), and inline code (`code`)
 */
function InlineMarkup({ text }: { text: string }) {
  // Regex to split by `code`, **bold**, *italic*
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={i}
              className="rounded bg-slate-100 dark:bg-slate-800 px-1 py-0.5 font-mono text-[11px] text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-slate-700"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-slate-900 dark:text-slate-100">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return (
            <em key={i} className="italic text-slate-600 dark:text-slate-400">
              {part.slice(1, -1)}
            </em>
          );
        }
        return part;
      })}
    </>
  );
}
