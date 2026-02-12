"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";

export default function HealthCertPage() {
  const router = useRouter();
  const [certified, setCertified] = useState(false);
  const [certUrl, setCertUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated) {
          setCertified(d.user.healthCertified);
        }
      });
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: base64 }),
      });
      const uploadData = await uploadRes.json();
      if (uploadData.code === 0) {
        const certRes = await fetch("/api/user/health-cert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ certUrl: uploadData.data.url }),
        });
        const certData = await certRes.json();
        if (certData.code === 0) {
          setCertified(true);
          setCertUrl(uploadData.data.url);
          setToast("认证成功");
        }
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="px-4 py-6" style={{ background: "var(--beige-light)" }}>
      <div className="mx-auto max-w-lg space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-lg" style={{ color: "#7A6B5D" }}>←</button>
          <h1 className="text-xl font-bold" style={{ color: "#2D2016" }}>健康认证</h1>
        </div>

        <div className="sense-card p-5 text-center">
          {certified ? (
            <>
              <div className="mb-3 text-4xl">✅</div>
              <p className="text-lg font-bold" style={{ color: "#4CAF50" }}>已通过健康认证</p>
              <p className="mt-1 text-xs" style={{ color: "#7A6B5D" }}>你的健康认证已生效，匹配页将显示认证徽章</p>
              {certUrl && <img src={certUrl} alt="体检单" className="mx-auto mt-4 max-w-[200px] rounded-xl" />}
            </>
          ) : (
            <>
              <div className="mb-3 text-4xl">🏥</div>
              <p className="text-base font-bold" style={{ color: "#2D2016" }}>上传体检报告</p>
              <p className="mt-1 text-xs" style={{ color: "#7A6B5D" }}>上传近期体检单照片，通过审核后获得健康认证徽章</p>
              <div className="mt-4 rounded-xl border-2 border-dashed p-8" style={{ borderColor: "#E8D4B4" }}>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50"
                >
                  {uploading ? "上传中..." : "选择图片"}
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              {/* Progress indicator */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs" style={{ color: "#7A6B5D" }}>
                  <span>上传体检单</span>
                  <span>审核中</span>
                  <span>认证完成</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full" style={{ background: "#E8D4B4" }}>
                  <div className="h-full rounded-full" style={{ width: "0%", background: "#FF8A00" }} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
