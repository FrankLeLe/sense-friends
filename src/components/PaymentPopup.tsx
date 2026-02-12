"use client";

import { useState } from "react";

interface PaymentPopupProps {
  cost: number;
  userName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function PaymentPopup({ cost, userName, onConfirm, onCancel, loading }: PaymentPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onCancel}>
      <div
        className="animate-slide-up w-full max-w-lg rounded-t-2xl bg-white px-6 pb-8 pt-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-300" />
        <h3 className="mb-2 text-center text-lg font-bold" style={{ color: "#2D2016" }}>
          解锁对味人
        </h3>
        <p className="mb-6 text-center text-sm" style={{ color: "#7A6B5D" }}>
          解锁 {userName} 的完整资料，开始聊天
        </p>
        <div className="mb-6 rounded-xl p-4 text-center" style={{ background: "#FFF8EF" }}>
          <p className="text-2xl font-bold" style={{ color: "#FF8A00" }}>{cost} 味币</p>
          <p className="mt-1 text-xs" style={{ color: "#7A6B5D" }}>解锁费用</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-full border py-3 text-sm font-medium"
            style={{ borderColor: "#E8D4B4", color: "#7A6B5D" }}
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn-primary flex-1 py-3 text-sm disabled:opacity-50"
          >
            {loading ? "解锁中..." : "确认解锁"}
          </button>
        </div>
      </div>
    </div>
  );
}
