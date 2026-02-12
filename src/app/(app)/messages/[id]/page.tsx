"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import VoiceInput from "@/components/VoiceInput";

interface Msg {
  id: string;
  content: string;
  senderId: string;
  sender: { id: string; name: string };
  type: string;
  createdAt: string;
}

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: matchId } = use(params);
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [myId, setMyId] = useState("");
  const [otherName, setOtherName] = useState("");
  const [matchScore, setMatchScore] = useState(0);
  const [icebreaker, setIcebreaker] = useState<string | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const icebreakerSent = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.authenticated) setMyId(d.user.id); });
  }, []);

  useEffect(() => {
    // Fetch match info for score and icebreaker
    fetch("/api/matches")
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0) {
          const m = d.data.find((x: { id: string }) => x.id === matchId);
          if (m) {
            setMatchScore(m.score);
            setIcebreaker(m.icebreaker);
          }
        }
      });
  }, [matchId]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read on enter
  useEffect(() => {
    fetch("/api/messages/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId }),
    });
  }, [matchId]);

  // Send icebreaker as system message on first visit
  useEffect(() => {
    if (icebreaker && messages.length === 0 && myId && !icebreakerSent.current) {
      icebreakerSent.current = true;
      fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, content: icebreaker, type: "system" }),
      }).then((r) => r.json()).then((d) => {
        if (d.code === 0) setMessages([d.data]);
      });
    }
  }, [icebreaker, messages.length, myId, matchId]);

  async function loadMessages() {
    const res = await fetch(`/api/messages?matchId=${matchId}`);
    const d = await res.json();
    if (d.code === 0) {
      setMessages(d.data);
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
    setShowEmoji(false);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, content }),
    });
    const d = await res.json();
    if (d.code === 0) setMessages((prev) => [...prev, d.data]);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: base64 }),
      });
      const uploadData = await uploadRes.json();
      if (uploadData.code === 0) {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ matchId, content: uploadData.data.url, type: "image" }),
        });
        const d = await res.json();
        if (d.code === 0) setMessages((prev) => [...prev, d.data]);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleLocationSend() {
    setShowMore(false);
    fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, content: "📍 我的位置（位置功能开发中）", type: "text" }),
    }).then((r) => r.json()).then((d) => {
      if (d.code === 0) setMessages((prev) => [...prev, d.data]);
    });
  }

  const emojis = ["😊", "😂", "🥰", "😋", "🤤", "👍", "❤️", "🔥", "🍜", "🍣", "🥗", "🍕", "🎉", "😎", "🤗", "😘"];

  return (
    <div className="flex h-screen flex-col" style={{ background: "var(--beige-light)" }}>
      {/* Header */}
      <header
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: "var(--beige-dark)", background: "rgba(255,255,255,0.9)" }}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/messages")} className="text-lg" style={{ color: "#7A6B5D" }}>←</button>
          <h1 className="text-base font-bold" style={{ color: "#2D2016" }}>{otherName || "聊天"}</h1>
        </div>
        {matchScore > 0 && (
          <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: "#FFF3E0", color: "#FF8A00" }}>
            {matchScore}% 契合
          </span>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-lg space-y-3">
          {messages.length === 0 && (
            <p className="py-8 text-center text-sm" style={{ color: "#7A6B5D" }}>打个招呼开始聊天吧</p>
          )}
          {messages.map((msg) => {
            const isMine = msg.senderId === myId;
            if (msg.type === "system") {
              return (
                <div key={msg.id} className="py-2 text-center">
                  <span className="rounded-full px-3 py-1 text-xs" style={{ background: "#FFF3E0", color: "#FF8A00" }}>
                    {msg.content}
                  </span>
                </div>
              );
            }
            if (msg.type === "image") {
              return (
                <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <img src={msg.content} alt="图片" className="max-w-[60%] rounded-xl" />
                </div>
              );
            }
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${isMine ? "rounded-tr-sm text-white" : "rounded-tl-sm bg-white"}`}
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

      {/* Emoji picker */}
      {showEmoji && (
        <div className="border-t px-4 py-3" style={{ borderColor: "var(--beige-dark)", background: "#fff" }}>
          <div className="mx-auto grid max-w-lg grid-cols-8 gap-2">
            {emojis.map((e) => (
              <button key={e} onClick={() => setInput((prev) => prev + e)} className="text-xl p-1 hover:bg-gray-100 rounded">
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* More menu */}
      {showMore && (
        <div className="border-t px-4 py-3" style={{ borderColor: "var(--beige-dark)", background: "#fff" }}>
          <div className="mx-auto flex max-w-lg gap-4">
            <button onClick={() => { fileInputRef.current?.click(); setShowMore(false); }} className="flex flex-col items-center gap-1">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xl">🖼️</span>
              <span className="text-[10px]" style={{ color: "#7A6B5D" }}>图片</span>
            </button>
            <button onClick={handleLocationSend} className="flex flex-col items-center gap-1">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xl">📍</span>
              <span className="text-[10px]" style={{ color: "#7A6B5D" }}>位置</span>
            </button>
          </div>
        </div>
      )}

      {/* Input bar */}
      <form
        onSubmit={handleSend}
        className="border-t px-4 py-3"
        style={{ borderColor: "var(--beige-dark)", background: "rgba(255,255,255,0.95)" }}
      >
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <button type="button" onClick={() => { setShowEmoji(!showEmoji); setShowMore(false); }} className="text-xl shrink-0">
            😊
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入消息..."
            className="flex-1 rounded-full border bg-white px-4 py-2.5 text-sm outline-none focus:border-[#FF8A00]"
            style={{ borderColor: "#E8D4B4" }}
          />
          <button type="button" onClick={() => { setShowMore(!showMore); setShowEmoji(false); }} className="text-xl shrink-0">
            ➕
          </button>
          <VoiceInput onResult={(text) => setInput((prev) => prev + text)} />
          <button type="submit" disabled={!input.trim()} className="btn-primary px-4 py-2.5 text-sm disabled:opacity-40">
            发送
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </form>
    </div>
  );
}
