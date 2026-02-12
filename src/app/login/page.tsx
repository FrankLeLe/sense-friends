"use client";

import Image from "next/image";

export default function LoginPage() {
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
