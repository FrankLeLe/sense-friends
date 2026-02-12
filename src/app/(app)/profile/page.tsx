"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DnaCard from "@/components/DnaCard";
import DnaPopup from "@/components/DnaPopup";
import ConfirmDialog from "@/components/ConfirmDialog";

interface UserInfo {
  id: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  industry?: string;
  job?: string;
  mbti?: string;
  ageRange?: string;
  bio?: string;
  healthCertified?: boolean;
  balance?: number;
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
  const [showLogout, setShowLogout] = useState(false);
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
      if (searchParams.get("showDna") === "1" && dnaData.data) setShowDna(true);
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

  const menuItems = [
    { label: "编辑资料", icon: "✏️", action: () => router.push("/profile/edit") },
    { label: "健康认证", icon: "🏥", action: () => router.push("/profile/health"), badge: user?.healthCertified ? "已认证" : undefined },
    { label: "我的钱包", icon: "💰", action: () => router.push("/profile/wallet") },
    { label: "帮助与反馈", icon: "💬", action: () => router.push("/profile/help") },
  ];

  return (
    <div className="px-4 py-6" style={{ background: "var(--beige-light)" }}>
      <div className="mx-auto max-w-lg space-y-5">
        <h1 className="text-xl font-bold" style={{ color: "#2D2016" }}>我的</h1>

        {/* User card */}
        <div className="sense-card flex items-center gap-4 p-5" onClick={() => router.push("/profile/edit")} role="button">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name || "头像"} className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white" style={{ background: "#FF8A00" }}>
              {user?.name?.[0] || "?"}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold" style={{ color: "#2D2016" }}>{user?.name || "未知用户"}</p>
              {user?.healthCertified && (
                <span className="rounded-full px-1.5 py-0.5 text-[10px]" style={{ background: "#E8F5E9", color: "#4CAF50" }}>已认证</span>
              )}
            </div>
            <p className="text-xs" style={{ color: "#7A6B5D" }}>
              ID: {user?.id?.slice(0, 8)} {user?.industry && `· ${user.industry}`} {user?.mbti && `· ${user.mbti}`}
            </p>
            {user?.bio && <p className="mt-1 text-xs" style={{ color: "#7A6B5D" }}>{user.bio}</p>}
          </div>
          <span style={{ color: "#7A6B5D" }}>→</span>
        </div>

        {/* DNA card */}
        {dna ? (
          <button onClick={() => setShowDna(true)} className="w-full text-left">
            <DnaCard {...dna} compact />
          </button>
        ) : (
          <div className="sense-card p-5 text-center">
            <p className="text-sm" style={{ color: "#7A6B5D" }}>还没有口味DNA</p>
            <button onClick={() => router.push("/ai-chat")} className="btn-primary mt-3 px-6 py-2 text-sm">去生成</button>
          </div>
        )}

        {/* Menu */}
        <div className="sense-card divide-y" style={{ borderColor: "var(--beige-dark)" }}>
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="flex w-full items-center justify-between px-5 py-3.5 text-sm transition-colors hover:bg-white/50"
              style={{ color: "#2D2016" }}
            >
              <span>{item.icon} {item.label}</span>
              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ background: "#E8F5E9", color: "#4CAF50" }}>{item.badge}</span>
                )}
                <span style={{ color: "#7A6B5D" }}>→</span>
              </div>
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={() => setShowLogout(true)}
          className="w-full rounded-xl border py-3 text-sm font-medium transition-colors hover:bg-white/50"
          style={{ borderColor: "#E8D4B4", color: "#7A6B5D" }}
        >
          退出登录
        </button>
      </div>

      {showDna && dna && <DnaPopup {...dna} onClose={() => setShowDna(false)} />}
      {showLogout && (
        <ConfirmDialog
          title="退出登录"
          message="确定要退出登录吗？"
          confirmText="退出"
          onConfirm={handleLogout}
          onCancel={() => setShowLogout(false)}
          danger
        />
      )}
    </div>
  );
}