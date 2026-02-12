"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Conversation {
  matchId: string;
  user: { id: string; name: string; avatarUrl: string };
  lastMessage: string | null;
  lastMessageAt: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((d) => { if (d.code === 0) setConversations(d.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p style={{ color: "#7A6B5D" }}>加载中...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6" style={{ background: "var(--beige-light)" }}>
      <div className="mx-auto max-w-lg">
        <h1 className="mb-5 text-xl font-bold" style={{ color: "#2D2016" }}>消息</h1>

        {conversations.length === 0 ? (
          <div className="sense-card p-8 text-center">
            <p className="text-sm" style={{ color: "#7A6B5D" }}>
              还没有对话，先去匹配页解锁对味人吧
            </p>
            <button
              onClick={() => router.push("/match")}
              className="btn-primary mt-4 px-6 py-2 text-sm"
            >
              去匹配
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.matchId}
                onClick={() => router.push(`/messages/${conv.matchId}`)}
                className="sense-card flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-white"
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: "#FF8A00" }}
                >
                  {conv.user.name?.[0] || "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium" style={{ color: "#2D2016" }}>
                    {conv.user.name}
                  </p>
                  <p className="truncate text-xs" style={{ color: "#7A6B5D" }}>
                    {conv.lastMessage || "还没有消息，打个招呼吧"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
