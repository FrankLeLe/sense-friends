"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";

interface Msg {
  id: string;
  content: string;
  senderId: string;
  sender: { id: string; name: string };
  createdAt: string;
}

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: matchId } = use(params);
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [myId, setMyId] = useState("");
  const [otherName, setOtherName] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get current user
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.authenticated) setMyId(d.user.id); });
  }, []);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadMessages() {
    const res = await fetch(`/api/messages?matchId=${matchId}`);
    const d = await res.json();
    if (d.code === 0) {
      setMessages(d.data);
      // Find other user's name
      if (d.data.length > 0 && myId) {
        const other = d.data.find((m: Msg) => m.senderId !== myId);
        if (other) setOtherName(other.sender.name);
      }
    }
  }
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const content = input.trim();
    setInput("");

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, content }),
    });
    const d = await res.json();
    if (d.code === 0) {
      setMessages((prev) => [...prev, d.data]);
    }
  }

  return (
    <div className="flex h-screen flex-col" style={{ background: "var(--beige-light)" }}>
      {/* Header */}
      <header
        className="flex items-center gap-3 border-b px-4 py-3"
        style={{ borderColor: "var(--beige-dark)", background: "rgba(255,255,255,0.9)" }}
      >
        <button onClick={() => router.push("/messages")} className="text-lg" style={{ color: "#7A6B5D" }}>
          ←
        </button>
        <h1 className="text-base font-bold" style={{ color: "#2D2016" }}>
          {otherName || "聊天"}
        </h1>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-lg space-y-3">
          {messages.length === 0 && (
            <p className="py-8 text-center text-sm" style={{ color: "#7A6B5D" }}>
              打个招呼开始聊天吧
            </p>
          )}
          {messages.map((msg) => {
            const isMine = msg.senderId === myId;
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    isMine ? "rounded-tr-sm text-white" : "rounded-tl-sm bg-white"
                  }`}
                  style={isMine ? { background: "#FF8A00" } : { color: "#2D2016" }}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="border-t px-4 py-3"
        style={{ borderColor: "var(--beige-dark)", background: "rgba(255,255,255,0.95)" }}
      >
        <div className="mx-auto flex max-w-lg gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入消息..."
            className="flex-1 rounded-full border bg-white px-4 py-2.5 text-sm outline-none focus:border-[#FF8A00]"
            style={{ borderColor: "#E8D4B4" }}
          />
          <button type="submit" disabled={!input.trim()} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-40">
            发送
          </button>
        </div>
      </form>
    </div>
  );
}