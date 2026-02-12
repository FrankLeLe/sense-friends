"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Conversation {
  matchId: string;
  score: number;
  user: { id: string; name: string; avatarUrl: string };
  lastMessage: string | null;
  lastMessageAt: string;
  lastMessageType: string;
  unreadCount: number;
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
      <div className="px-4 py-6" style={{ background: "var(--beige-light)" }}>
        <div className="mx-auto max-w-lg">
          <div className="mb-5 h-7 w-20 animate-pulse rounded bg-gray-200" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="sense-card mb-2 flex items-center gap-3 p-4">
              <div className="h-11 w-11 animate-pulse rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-36 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6" style={{ background: "var(--beige-light)" }}>
      <div className="mx-auto max-w-lg">
        <h1 className="mb-5 text-xl font-bold" style={{ color: "#2D2016" }}>消息</h1>

        {conversations.length === 0 ? (
          <div className="sense-card p-8 text-center">
            <p className="mb-2 text-3xl">💬</p>
            <p className="text-sm" style={{ color: "#7A6B5D" }}>
              暂无消息，快去解锁对味人吧
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
            {conversations.map((conv) => {
              const preview = conv.lastMessageType === "image" ? "[图片]" : conv.lastMessage;
              return (
                <button
                  key={conv.matchId}
                  onClick={() => router.push(`/messages/${conv.matchId}`)}
                  className="sense-card flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-white"
                >
                  <div className="relative">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ background: "#FF8A00" }}
                    >
                      {conv.user.name?.[0] || "?"}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium" style={{ color: "#2D2016" }}>{conv.user.name}</p>
                      <span className="text-[10px]" style={{ color: "#7A6B5D" }}>
                        {conv.score}% 对味
                      </span>
                    </div>
                    <p className="truncate text-xs" style={{ color: "#7A6B5D" }}>
                      {preview || "还没有消息，打个招呼吧"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}