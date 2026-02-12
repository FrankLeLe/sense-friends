"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated) {
          router.replace("/ai-chat");
        } else {
          router.replace("/login");
        }
      } catch {
        router.replace("/login");
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center"
      style={{ background: "linear-gradient(180deg, #FFF8EF 0%, #F6E4C8 100%)" }}
    >
      <div className="animate-fade-in flex flex-col items-center gap-6">
        <Image src="/image2.png" alt="对味SENSE" width={120} height={120} priority />
        <h1 className="text-3xl font-bold" style={{ color: "#FF8A00" }}>
          对味SENSE
        </h1>
        <p className="text-base" style={{ color: "#7A6B5D" }}>
          找到对味的人，一起吃饭
        </p>
      </div>
    </div>
  );
}
