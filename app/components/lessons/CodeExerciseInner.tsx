"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { validators } from "@/lib/validators/rust";
import { playChime } from "@/lib/hooks/use-sound";

interface Props {
  lessonId: string;
  initialCode: string;
  onPass?: () => void;
}

export function CodeExerciseInner({ lessonId, initialCode, onPass }: Props) {
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<
    { ok: true } | { ok: false; msg: string } | null
  >(null);

  function check() {
    const validator = validators[lessonId];
    if (!validator) {
      setResult({ ok: false, msg: `No validator for lesson "${lessonId}"` });
      return;
    }
    const res = validator(code);
    setResult(res);
    if (res.ok) {
      playChime();
      onPass?.();
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-xl border border-border-low">
        <Editor
          height="220px"
          defaultLanguage="rust"
          value={code}
          onChange={(v) => setCode(v ?? "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "off",
            scrollBeyondLastLine: false,
            wordWrap: "on",
          }}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={check}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Check
        </button>

        {result !== null && (
          <span
            className={`text-sm font-medium ${
              result.ok ? "text-green-500" : "text-red-500"
            }`}
          >
            {result.ok ? "✓ Correct!" : `✗ ${result.msg}`}
          </span>
        )}
      </div>
    </div>
  );
}
