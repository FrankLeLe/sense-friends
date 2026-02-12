"use client";

import { useRouter } from "next/navigation";
import DnaCard from "./DnaCard";

interface DnaPopupProps {
  title: string;
  slogan: string;
  tags: string[];
  radarData: { spicy: number; sweet: number; fresh: number; adventurous: number; social: number; refined: number };
  onClose: () => void;
}

export default function DnaPopup({ title, slogan, tags, radarData, onClose }: DnaPopupProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="animate-fade-in w-full max-w-sm space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <DnaCard title={title} slogan={slogan} tags={tags} radarData={radarData} />
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/match")}
            className="btn-primary flex-1 py-3 text-sm"
          >
            去匹配对味人
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-full border py-3 text-sm font-medium"
            style={{ borderColor: "#E8D4B4", color: "#7A6B5D" }}
          >
            返回聊天
          </button>
        </div>
      </div>
    </div>
  );
}
