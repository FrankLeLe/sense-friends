"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const detail = searchParams.get("detail");

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6"
      style={{ background: "linear-gradient(180deg, #FFF8EF 0%, #F6E4C8 100%)" }}
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <Image src="/image1.png" alt="对味SENSE" width={80} height={80} priority />
        <div className="text-center">
          <h1 className="text-2xl font-bold" style={{ color: "#2D2016" }}>
            欢迎来到对味
          </h1>
          <p className="mt-2 text-sm" style={{ color: "#7A6B5D" }}>
            用 AI 发现你的口味DNA，匹配对味的人
          </p>
        </div>

        {error && (
          <div className="w-full rounded-xl border p-4 text-center" style={{ borderColor: "#F44336", background: "#FFF5F5" }}>
            <p className="text-sm font-medium" style={{ color: "#F44336" }}>
              登录失败: {error}
            </p>
            {detail && (
              <p className="mt-1 break-all text-xs" style={{ color: "#7A6B5D" }}>{detail}</p>
            )}
          </div>
        )}

        <a
          href="/api/auth/login"
          className="btn-primary flex w-full items-center justify-center gap-2 px-6 py-3.5 text-base"
        >
          使用 SecondMe 登录
        </a>

        <p className="text-center text-xs" style={{ color: "#7A6B5D" }}>
          登录即表示同意《用户协议》和《隐私政策》
        </p>
      </div>
    </div>
  );
}
