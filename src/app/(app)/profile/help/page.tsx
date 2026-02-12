"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";

const faqs = [
  { q: "如何生成口味DNA？", a: "进入「对话」页面，回答AI的几个问题后即可生成专属口味DNA。" },
  { q: "解锁对味人需要多少味币？", a: "每次解锁需要10味币，解锁后可以查看对方完整资料并发起聊天。" },
  { q: "如何获得健康认证？", a: "在「我的」→「健康认证」中上传近期体检报告，审核通过后即可获得认证徽章。" },
  { q: "消息没有收到怎么办？", a: "请检查网络连接，消息会每5秒自动刷新。如果持续无法收到，请尝试退出重新登录。" },
];

export default function HelpPage() {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  function handleSubmit() {
    if (!feedback.trim()) return;
    setToast("感谢你的反馈！");
    setFeedback("");
  }

  return (
    <div className="px-4 py-6" style={{ background: "var(--beige-light)" }}>
      <div className="mx-auto max-w-lg space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-lg" style={{ color: "#7A6B5D" }}>←</button>
          <h1 className="text-xl font-bold" style={{ color: "#2D2016" }}>帮助与反馈</h1>
        </div>

        {/* FAQ */}
        <div className="sense-card">
          <h2 className="border-b px-5 py-3 text-sm font-bold" style={{ color: "#2D2016", borderColor: "var(--beige-dark)" }}>
            常见问题
          </h2>
          <div className="divide-y" style={{ borderColor: "var(--beige-dark)" }}>
            {faqs.map((faq, i) => (
              <button
                key={i}
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full px-5 py-3 text-left"
              >
                <p className="text-sm font-medium" style={{ color: "#2D2016" }}>{faq.q}</p>
                {expandedFaq === i && (
                  <p className="mt-2 text-xs" style={{ color: "#7A6B5D" }}>{faq.a}</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback form */}
        <div className="sense-card p-5 space-y-3">
          <h2 className="text-sm font-bold" style={{ color: "#2D2016" }}>意见反馈</h2>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="告诉我们你的想法..."
            rows={4}
            maxLength={500}
            className="w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none focus:border-[#FF8A00]"
            style={{ borderColor: "#E8D4B4" }}
          />
          <button onClick={handleSubmit} disabled={!feedback.trim()} className="btn-primary w-full py-2.5 text-sm disabled:opacity-40">
            提交反馈
          </button>
        </div>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
