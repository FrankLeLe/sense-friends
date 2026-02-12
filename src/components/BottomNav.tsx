"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const tabs = [
  { href: "/ai-chat", label: "对话", icon: ChatIcon },
  { href: "/match", label: "匹配", icon: MatchIcon },
  { href: "/messages", label: "消息", icon: MessageIcon, badge: true },
  { href: "/profile", label: "我的", icon: ProfileIcon },
];

function ChatIcon({ active }: { active: boolean }) {
  const c = active ? "#FF8A00" : "#7A6B5D";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 3C7.03 3 3 6.58 3 11c0 2.42 1.33 4.58 3.4 6.02L5 21l4.2-2.1c.9.2 1.84.1 2.8.1 4.97 0 9-3.58 9-8s-4.03-8-9-8z" stroke={c} strokeWidth="1.8" fill={active ? "#FFF3E0" : "none"} />
    </svg>
  );
}

function MatchIcon({ active }: { active: boolean }) {
  const c = active ? "#FF8A00" : "#7A6B5D";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="10" r="4" stroke={c} strokeWidth="1.8" fill={active ? "#FFF3E0" : "none"} />
      <circle cx="15" cy="10" r="4" stroke={c} strokeWidth="1.8" fill={active ? "#FFF3E0" : "none"} />
      <path d="M4 19c0-3 3-5 8-5s8 2 8 5" stroke={c} strokeWidth="1.8" fill="none" />
    </svg>
  );
}

function MessageIcon({ active }: { active: boolean }) {
  const c = active ? "#FF8A00" : "#7A6B5D";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="13" rx="3" stroke={c} strokeWidth="1.8" fill={active ? "#FFF3E0" : "none"} />
      <path d="M8 10h8M8 14h5" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  const c = active ? "#FF8A00" : "#7A6B5D";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="9" r="4" stroke={c} strokeWidth="1.8" fill={active ? "#FFF3E0" : "none"} />
      <path d="M5 20c0-3.5 3.13-6 7-6s7 2.5 7 6" stroke={c} strokeWidth="1.8" fill="none" />
    </svg>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    function fetchUnread() {
      fetch("/api/messages/unread-count")
        .then((r) => r.json())
        .then((d) => { if (d.code === 0) setUnreadCount(d.data.count); })
        .catch(() => {});
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/90 backdrop-blur-md"
      style={{ borderColor: "var(--beige-dark)" }}
    >
      <div className="mx-auto flex max-w-lg items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1"
            >
              <tab.icon active={active} />
              {tab.badge && unreadCount > 0 && (
                <span className="absolute -right-0.5 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
              <span
                className="text-[10px] font-medium"
                style={{ color: active ? "#FF8A00" : "#7A6B5D" }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
