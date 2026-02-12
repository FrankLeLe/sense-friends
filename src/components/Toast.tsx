"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = "info", onClose, duration = 2500 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgMap = { success: "#4CAF50", error: "#F44336", info: "#FF8A00" };

  return (
    <div className="fixed left-1/2 top-16 z-[100] -translate-x-1/2 animate-fade-in">
      <div
        className="rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-lg"
        style={{ background: bgMap[type] }}
      >
        {message}
      </div>
    </div>
  );
}
