"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      r: number; alpha: number; color: string; life: number; maxLife: number;
    }

    const particles: Particle[] = [];
    const colors = ["#FF8A00", "#FFA940", "#FFD700", "#FF6B35", "#F6E4C8"];

    function spawn() {
      for (let i = 0; i < 3; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8 - 0.3,
          r: Math.random() * 3 + 1,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 0,
          maxLife: 60 + Math.random() * 60,
        });
      }
    }

    let animId: number;
    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      spawn();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = 1 - p.life / p.maxLife;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * 0.6;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(animate);
    }

    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="animate-fade-in relative w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ zIndex: 1 }}
        />
        <div className="relative" style={{ zIndex: 2 }}>
          <DnaCard title={title} slogan={slogan} tags={tags} radarData={radarData} />
        </div>
        <div className="relative flex gap-3" style={{ zIndex: 2 }}>
          <button onClick={() => router.push("/match")} className="btn-primary flex-1 py-3 text-sm">
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
