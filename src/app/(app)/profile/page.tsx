"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DnaCard from "@/components/DnaCard";
import DnaPopup from "@/components/DnaPopup";

interface UserInfo {
  id: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
}

interface DnaData {
  title: string;
  slogan: string;
  tags: string[];
  radarData: { spicy: number; sweet: number; fresh: number; adventurous: number; social: number; refined: number };
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p style={{ color: "#7A6B5D" }}>加载中...</p></div>}>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [dna, setDna] = useState<DnaData | null>(null);
  const [showDna, setShowDna] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/dna").then((r) => r.json()),
    ]).then(([authData, dnaData]) => {
      if (authData.authenticated) setUser(authData.user);
      else router.replace("/login");
      if (dnaData.code === 0 && dnaData.data) setDna(dnaData.data);
      setLoading(false);

      if (searchParams.get("showDna") === "1" && dnaData.data) {
        setShowDna(true);
      }
    });
  }, [router, searchParams]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
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
      <div className="mx-auto max-w-lg space-y-5">
        <h1 className="text-xl font-bold" style={{ color: "#2D2016" }}>我的</h1>

        {/* User card */}
        <div className="sense-card flex items-center gap-4 p-5">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name || "头像"}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white"
              style={{ background: "#FF8A00" }}
            >
              {user?.name?.[0] || "?"}
            </div>
          )}
          <div>
            <p className="text-lg font-bold" style={{ color: "#2D2016" }}>
              {user?.name || "未知用户"}
            </p>
            {user?.email && (
              <p className="text-xs" style={{ color: "#7A6B5D" }}>{user.email}</p>
            )}
          </div>
        </div>
        {/* DNA card */}
        {dna ? (
          <button onClick={() => setShowDna(true)} className="w-full text-left">
            <DnaCard {...dna} compact />
          </button>
        ) : (
          <div className="sense-card p-5 text-center">
            <p className="text-sm" style={{ color: "#7A6B5D" }}>还没有口味DNA</p>
            <button
              onClick={() => router.push("/ai-chat")}
              className="btn-primary mt-3 px-6 py-2 text-sm"
            >
              去生成
            </button>
          </div>
        )}

        {/* Menu */}
        <div className="sense-card divide-y" style={{ borderColor: "var(--beige-dark)" }}>
          {[
            { label: "重新生成口味DNA", action: () => router.push("/ai-chat") },
            { label: "我的匹配", action: () => router.push("/match") },
            { label: "消息中心", action: () => router.push("/messages") },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="flex w-full items-center justify-between px-5 py-3.5 text-sm transition-colors hover:bg-white/50"
              style={{ color: "#2D2016" }}
            >
              {item.label}
              <span style={{ color: "#7A6B5D" }}>→</span>
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full rounded-xl border py-3 text-sm font-medium transition-colors hover:bg-white/50"
          style={{ borderColor: "#E8D4B4", color: "#7A6B5D" }}
        >
          退出登录
        </button>
      </div>

      {showDna && dna && (
        <DnaPopup {...dna} onClose={() => setShowDna(false)} />
      )}
    </div>
  );
}
