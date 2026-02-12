"use client";

import { useState } from "react";
import type { Question } from "@/lib/questions";

interface QuestionSelectorProps {
  question: Question;
  current: number;
  total: number;
  onSelect: (answer: string) => void;
}

export default function QuestionSelector({
  question,
  current,
  total,
  onSelect,
}: QuestionSelectorProps) {
  const [custom, setCustom] = useState("");
  const progress = ((current + 1) / total) * 100;

  return (
    <div className="animate-fade-in space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-2 text-xs" style={{ color: "#7A6B5D" }}>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "#E8D4B4" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: "#FF8A00" }}
          />
        </div>
        <span>{current + 1}/{total}</span>
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-2">
        {question.options.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className="rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:border-[#FF8A00] hover:text-[#FF8A00]"
            style={{ borderColor: "#E8D4B4", color: "#2D2016" }}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Custom input */}
      {question.allowCustom && (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (custom.trim()) {
              onSelect(custom.trim());
              setCustom("");
            }
          }}
        >
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="或者输入你的答案..."
            className="flex-1 rounded-full border bg-white px-4 py-2 text-sm outline-none focus:border-[#FF8A00]"
            style={{ borderColor: "#E8D4B4" }}
          />
          <button
            type="submit"
            disabled={!custom.trim()}
            className="btn-primary px-4 py-2 text-sm disabled:opacity-40"
          >
            发送
          </button>
        </form>
      )}
    </div>
  );
}
