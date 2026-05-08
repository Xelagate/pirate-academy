"use client";

import { useState } from "react";

const QUESTIONS = [
  {
    id: 0,
    question: "Do you know Rust or any systems language?",
    options: ["No, complete beginner", "A little bit", "Yes, comfortable with it"],
  },
  {
    id: 1,
    question: "Have you written smart contracts before?",
    options: ["Never", "Tried once or twice", "Yes, on Solana or other chains"],
  },
  {
    id: 2,
    question: "What's your main goal?",
    options: ["Get a job in Web3", "Build my own product on Solana", "Understand how it all works"],
  },
  {
    id: 3,
    question: "How familiar are you with blockchain concepts?",
    options: ["Not at all", "I know the basics", "Pretty comfortable"],
  },
  {
    id: 4,
    question: "How many hours per week can you dedicate?",
    options: ["2–5 hours", "5–10 hours", "10+ hours"],
  },
];

export function OnboardingFlow() {
  const [answers, setAnswers] = useState<string[]>(Array(5).fill(""));
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const allAnswered = answers.every((a) => a !== "");

  async function submit() {
    setLoading(true);
    setRecommendation("");
    setDone(false);

    const res = await fetch("/api/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });

    if (!res.body) return;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done: streamDone, value } = await reader.read();
      if (streamDone) break;
      setRecommendation((prev) => prev + decoder.decode(value));
    }

    setLoading(false);
    setDone(true);
  }

  return (
    <div className="min-h-screen bg-[#060d1a] text-white flex flex-col items-center justify-center px-6 py-16">
      <a href="/" className="text-amber-500 font-black text-sm tracking-[3px] uppercase mb-10 hover:text-amber-400 transition-colors">
        ⚓ Pirate Academy
      </a>

      <h1 className="text-4xl font-black mb-2 text-center">Find Your Path</h1>
      <p className="text-slate-400 text-sm mb-12 text-center max-w-sm">
        Answer 5 questions. Your AI Captain charts the course.
      </p>

      <div className="w-full max-w-xl flex flex-col gap-8">
        {QUESTIONS.map((q) => (
          <div key={q.id}>
            <p className="text-sm font-semibold text-slate-300 mb-3">
              {q.id + 1}. {q.question}
            </p>
            <div className="flex flex-col gap-2">
              {q.options.map((opt) => {
                const selected = answers[q.id] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      const next = [...answers];
                      next[q.id] = opt;
                      setAnswers(next);
                    }}
                    className={[
                      "text-left px-4 py-3 rounded-xl border text-sm transition-all",
                      selected
                        ? "border-amber-500 bg-amber-500/10 text-amber-400 font-semibold"
                        : "border-slate-700 text-slate-400 hover:border-slate-500",
                    ].join(" ")}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <button
          onClick={submit}
          disabled={!allAnswered || loading}
          className={[
            "w-full py-4 rounded-2xl font-black text-lg transition-all",
            allAnswered && !loading
              ? "bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.4)]"
              : "bg-slate-800 text-slate-600 cursor-not-allowed",
          ].join(" ")}
        >
          {loading ? "Your Captain is thinking…" : "Chart My Course →"}
        </button>

        {(recommendation || loading) && (
          <div className="border border-amber-500/20 bg-amber-500/5 rounded-2xl p-6">
            <p className="text-[10px] font-bold tracking-[3px] text-amber-500 uppercase mb-3">
              🏴‍☠️ Your Captain Says
            </p>
            <p className="text-slate-200 leading-relaxed text-sm whitespace-pre-wrap">
              {recommendation}
              {loading && <span className="animate-pulse">▌</span>}
            </p>
          </div>
        )}

        {done && (
          <a
            href={
              answers[0] === "Yes, comfortable with it"
                ? "/island/anchor-harbor/01"
                : "/island/crab-forge/01"
            }
            className="block text-center py-3 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition-all"
          >
            {answers[0] === "Yes, comfortable with it"
              ? "Start at Anchor Harbor ⚓ →"
              : "Start at Crab Forge 🦀 →"}
          </a>
        )}
      </div>
    </div>
  );
}
