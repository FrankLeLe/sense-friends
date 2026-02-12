"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ChatBubble from "@/components/ChatBubble";
import QuestionSelector from "@/components/QuestionSelector";
import VoiceInput from "@/components/VoiceInput";
import { questions } from "@/lib/questions";

interface Message {
  role: "ai" | "user";
  content: string;
}

export default function AIChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [freeInput, setFreeInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Initial greeting
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    setMessages([
      { role: "ai", content: "嗨！我是对味AI，接下来我会问你几个问题，帮你生成专属的口味DNA 🧬" },
      { role: "ai", content: questions[0].text },
    ]);
  }, []);
  function handleSelect(answer: string) {
    const q = questions[step];
    const newAnswers = { ...answers, [q.id]: answer };
    setAnswers(newAnswers);

    // Add user message
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: answer },
    ];

    const nextStep = step + 1;
    if (nextStep < questions.length) {
      newMessages.push({ role: "ai", content: `好的！${questions[nextStep].text}` });
      setStep(nextStep);
    } else {
      newMessages.push({ role: "ai", content: "太棒了！我已经了解你的口味偏好了，点击下方按钮生成你的口味DNA吧！" });
      setDone(true);
    }
    setMessages(newMessages);
  }

  function handleFreeChat(e: React.FormEvent) {
    e.preventDefault();
    if (!freeInput.trim() || generating) return;
    const text = freeInput.trim();
    setFreeInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    // For free chat after completion, just echo a friendly response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "收到！如果你准备好了，就点击「生成口味DNA」按钮吧～" },
      ]);
    }, 500);
  }

  async function handleGenerate() {
    setGenerating(true);
    setMessages((prev) => [...prev, { role: "ai", content: "正在为你生成口味DNA，请稍候..." }]);
    try {
      const res = await fetch("/api/dna/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) throw new Error("生成失败");
      router.push("/profile?showDna=1");
    } catch {
      setMessages((prev) => [...prev, { role: "ai", content: "生成失败了，请稍后再试～" }]);
      setGenerating(false);
    }
  }

  return (
    <div className="flex h-screen flex-col" style={{ background: "var(--beige-light)" }}>
      {/* Header */}
      <header className="flex items-center justify-center border-b px-4 py-3" style={{ borderColor: "var(--beige-dark)", background: "rgba(255,255,255,0.9)" }}>
        <h1 className="text-base font-bold" style={{ color: "#2D2016" }}>对味AI</h1>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-lg space-y-3">
          {messages.map((msg, i) => (
            <ChatBubble key={i} role={msg.role} content={msg.content} />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Bottom area */}
      <div className="border-t px-4 py-3" style={{ borderColor: "var(--beige-dark)", background: "rgba(255,255,255,0.95)" }}>
        <div className="mx-auto max-w-lg">
          {!done && step < questions.length && (
            <QuestionSelector
              question={questions[step]}
              current={step}
              total={questions.length}
              onSelect={handleSelect}
            />
          )}
          {done && !generating && (
            <div className="space-y-3">
              <button
                onClick={handleGenerate}
                className="btn-primary animate-pulse-glow w-full py-3 text-base"
              >
                生成口味DNA 🧬
              </button>
              <form onSubmit={handleFreeChat} className="flex gap-2">
                <input
                  value={freeInput}
                  onChange={(e) => setFreeInput(e.target.value)}
                  placeholder="还想聊点什么..."
                  className="flex-1 rounded-full border bg-white px-4 py-2 text-sm outline-none focus:border-[#FF8A00]"
                  style={{ borderColor: "#E8D4B4" }}
                />
                <VoiceInput onResult={(text) => setFreeInput((prev) => prev + text)} />
                <button type="submit" className="btn-primary px-4 py-2 text-sm">发送</button>
              </form>
            </div>
          )}
          {generating && (
            <div className="py-3 text-center text-sm" style={{ color: "#7A6B5D" }}>
              正在生成中...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}