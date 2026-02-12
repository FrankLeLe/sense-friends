"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DnaCard from "@/components/DnaCard";

interface MatchData {
  id: string;
  score: number;
  unlocked: boolean;
  user: { id: string; name: string; avatarUrl: string };
  dna: {
    title: string;
    slogan: string;
    tags: string[];
    radarData: { spicy: number; sweet: number; fresh: number; adventurous: number; social: number; refined: number };
  } | null;
}

export default function MatchPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/matches")
      .then((r) => r.json())
      .then((d) => { if (d.code === 0) setMatches(d.data); })
      .finally(() => setLoading(false));
  }, []);

  async function handleUnlock(matchId: string) {
    const res = await fetch(`/api/matches/${matchId}/unlock`, { method: "POST" });
    if (res.ok) {
      setMatches((prev) =>
        prev.map((m) => (m.id === matchId ? { ...m, unlocked: true } : m))
      );
    }
  }

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
        <h1 className="mb-5 text-xl font-bold" style={{ color: "#2D2016" }}>
          对味人
        </h1>
        {matches.length === 0 ? (
          <div className="sense-card p-8 text-center">
            <p className="text-sm" style={{ color: "#7A6B5D" }}>
              还没有匹配结果，先去完成口味DNA吧
            </p>
            <button
              onClick={() => router.push("/ai-chat")}
              className="btn-primary mt-4 px-6 py-2 text-sm"
            >
              去对话
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div key={match.id} className="sense-card overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ background: "#FF8A00" }}
                    >
                      {match.user.name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: "#2D2016" }}>
                        {match.unlocked ? match.user.name : "???"}
                      </p>
                      <p className="text-xs" style={{ color: "#7A6B5D" }}>
                        {match.dna?.title || "未知口味"}
                      </p>
                    </div>
                  </div>
                  <div
                    className="rounded-full px-3 py-1 text-sm font-bold"
                    style={{ background: "#FFF3E0", color: "#FF8A00" }}
                  >
                    {match.score}% 对味
                  </div>
                </div>

                {/* DNA preview */}
                {match.dna && (
                  <div className={`px-4 pb-2 ${!match.unlocked ? "blur-sm" : ""}`}>
                    <DnaCard {...match.dna} compact />
                  </div>
                )}

                {/* Action */}
                <div className="border-t p-4" style={{ borderColor: "var(--beige-dark)" }}>
                  {match.unlocked ? (
                    <button
                      onClick={() => router.push(`/messages/${match.id}`)}
                      className="btn-primary w-full py-2.5 text-sm"
                    >
                      开始聊天
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnlock(match.id)}
                      className="w-full rounded-full border py-2.5 text-sm font-medium transition-colors hover:border-[#FF8A00] hover:text-[#FF8A00]"
                      style={{ borderColor: "#E8D4B4", color: "#2D2016" }}
                    >
                      解锁 Ta 的口味DNA
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}