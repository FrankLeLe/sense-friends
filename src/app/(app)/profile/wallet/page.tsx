"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  matchId: string;
  createdAt: string;
}

export default function WalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/wallet")
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0) {
          setBalance(d.data.balance);
          setTransactions(d.data.transactions);
        }
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><p style={{ color: "#7A6B5D" }}>加载中...</p></div>;
  }

  return (
    <div className="px-4 py-6" style={{ background: "var(--beige-light)" }}>
      <div className="mx-auto max-w-lg space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-lg" style={{ color: "#7A6B5D" }}>←</button>
          <h1 className="text-xl font-bold" style={{ color: "#2D2016" }}>我的钱包</h1>
        </div>

        {/* Balance card */}
        <div className="sense-card p-6 text-center" style={{ background: "linear-gradient(135deg, #FF8A00, #FFA940)" }}>
          <p className="text-sm text-white/80">味币余额</p>
          <p className="mt-1 text-3xl font-bold text-white">{balance}</p>
        </div>

        {/* Transactions */}
        <div className="sense-card">
          <h2 className="border-b px-5 py-3 text-sm font-bold" style={{ color: "#2D2016", borderColor: "var(--beige-dark)" }}>
            消费记录
          </h2>
          {transactions.length === 0 ? (
            <p className="p-5 text-center text-sm" style={{ color: "#7A6B5D" }}>暂无消费记录</p>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--beige-dark)" }}>
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm" style={{ color: "#2D2016" }}>
                      {t.type === "unlock" ? "解锁对味人" : t.type}
                    </p>
                    <p className="text-[10px]" style={{ color: "#7A6B5D" }}>
                      {new Date(t.createdAt).toLocaleDateString("zh-CN")}
                    </p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: "#F44336" }}>-{t.amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
