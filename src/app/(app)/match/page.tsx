"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PaymentPopup from "@/components/PaymentPopup";
import Toast from "@/components/Toast";

interface MatchData {
  id: string;
  score: number;
  unlocked: boolean;
  restaurantName: string | null;
  budget: string | null;
  paymentRule: string | null;
  icebreaker: string | null;
  user: {
    id: string;
    name: string;
    avatarUrl: string;
    industry: string | null;
    job: string | null;
    mbti: string | null;
    ageRange: string | null;
    healthCertified: boolean;
  };
  dna: {
    title: string;
    slogan: string;
    tags: string[];
    radarData: Record<string, number>;
  } | null;
}

const foodIcons = ["🍜", "🍣", "🥗", "🍕", "🍰", "🌮", "🍲", "🥘"];

export default function MatchPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlockTarget, setUnlockTarget] = useState<MatchData | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/matches")
      .then((r) => r.json())
      .then((d) => { if (d.code === 0) setMatches(d.data); })
      .finally(() => setLoading(false));
  }, []);

  async function handleUnlock() {
    if (!unlockTarget) return;
    setUnlocking(true);
    try {
      const res = await fetch(`/api/matches/${unlockTarget.id}/unlock`, { method: "POST" });
      const d = await res.json();
      if (d.code === 0) {
        setMatches((prev) =>
          prev.map((m) =>
            m.id === unlockTarget.id
              ? { ...m, unlocked: true, ...d.data }
              : m
          )
        );
        setToast("解锁成功！");
      }
    } catch {
      setToast("解锁失败，请重试");
    }
    setUnlocking(false);
    setUnlockTarget(null);
  }

  if (loading) {
    return (
      <div className="px-4 py-6" style={{ background: "var(--beige-light)" }}>
        <div className="mx-auto max-w-lg">
          <div className="mb-5 h-7 w-32 animate-pulse rounded bg-gray-200" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="sense-card mb-4 p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-40 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const todayCount = matches.length;

  return (
    <div className="px-4 py-6" style={{ background: "var(--beige-light)" }}>
      <div className="mx-auto max-w-lg">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-bold" style={{ color: "#2D2016" }}>对味人</h1>
          <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: "#FFF3E0", color: "#FF8A00" }}>
            今日推荐 {todayCount} 人
          </span>
        </div>

        {matches.length === 0 ? (
          <div className="sense-card p-8 text-center">
            <p className="text-3xl mb-3">🍽️</p>
            <p className="text-sm" style={{ color: "#7A6B5D" }}>
              还没有匹配结果，先去完成口味DNA吧
            </p>
            <button onClick={() => router.push("/ai-chat")} className="btn-primary mt-4 px-6 py-2 text-sm">
              去对话
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match, idx) => (
              <div key={match.id} className="sense-card overflow-hidden animate-fade-in" style={{ animationDelay: `${idx * 0.08}s` }}>
                {/* Card header */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full text-xl"
                      style={{ background: "#FFF3E0" }}
                    >
                      {foodIcons[idx % foodIcons.length]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold" style={{ color: "#2D2016" }}>
                          {match.unlocked ? match.user.name : match.dna?.title || "???"}
                        </p>
                        {match.user.healthCertified && (
                          <span className="rounded-full px-1.5 py-0.5 text-[10px]" style={{ background: "#E8F5E9", color: "#4CAF50" }}>
                            已认证
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs" style={{ color: "#7A6B5D" }}>
                        {match.user.industry && <span>{match.user.industry}</span>}
                        {match.user.job && <span>{match.user.job}</span>}
                        {match.user.mbti && <span>{match.user.mbti}</span>}
                        {match.user.ageRange && <span>{match.user.ageRange}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-full px-3 py-1 text-sm font-bold" style={{ background: "#FFF3E0", color: "#FF8A00" }}>
                    {match.score}%
                  </div>
                </div>

                {/* Tags */}
                {match.dna && (
                  <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                    {match.dna.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded-full px-2.5 py-0.5 text-xs" style={{ background: "#FFF3E0", color: "#E67A00" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Unlocked extra info */}
                {match.unlocked && (
                  <div className="mx-4 mb-3 rounded-xl p-3" style={{ background: "#FFF8EF" }}>
                    {match.icebreaker && (
                      <p className="mb-2 text-sm italic" style={{ color: "#FF8A00" }}>"{match.icebreaker}"</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs" style={{ color: "#7A6B5D" }}>
                      {match.restaurantName && <span>📍 {match.restaurantName}</span>}
                      {match.budget && <span>💰 {match.budget}</span>}
                      {match.paymentRule && <span>🤝 {match.paymentRule}</span>}
                    </div>
                  </div>
                )}

                {/* Action */}
                <div className="border-t p-4" style={{ borderColor: "var(--beige-dark)" }}>
                  {match.unlocked ? (
                    <button
                      onClick={() => router.push(`/messages/${match.id}`)}
                      className="btn-primary w-full py-2.5 text-sm"
                    >
                      发起聊天
                    </button>
                  ) : (
                    <button
                      onClick={() => setUnlockTarget(match)}
                      className="w-full rounded-full py-2.5 text-sm font-bold text-white"
                      style={{ background: "#FF8A00" }}
                    >
                      解锁 Ta
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {unlockTarget && (
        <PaymentPopup
          cost={10}
          userName={unlockTarget.dna?.title || "对味人"}
          onConfirm={handleUnlock}
          onCancel={() => setUnlockTarget(null)}
          loading={unlocking}
        />
      )}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
