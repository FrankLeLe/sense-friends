"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";

const MBTI_OPTIONS = ["INTJ", "INFP", "ENFP", "ENTJ", "ISFJ", "ESTP", "INTP", "ENTP", "ISFP", "ESFP", "INFJ", "ENFJ", "ISTJ", "ESTJ", "ISTP", "ESFJ"];
const AGE_OPTIONS = ["18-22", "23-25", "25-30", "30-35", "35-40", "40+"];
const INDUSTRY_OPTIONS = ["互联网/科技", "金融", "教育", "医疗", "创意/设计", "自由职业", "餐饮", "其他"];

export default function ProfileEditPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", industry: "", job: "", mbti: "", ageRange: "", bio: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated) {
          setForm({
            name: d.user.name || "",
            industry: d.user.industry || "",
            job: d.user.job || "",
            mbti: d.user.mbti || "",
            ageRange: d.user.ageRange || "",
            bio: d.user.bio || "",
          });
        }
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await res.json();
    setSaving(false);
    if (d.code === 0) {
      setToast("保存成功");
      setTimeout(() => router.back(), 1000);
    } else {
      setToast("保存失败");
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><p style={{ color: "#7A6B5D" }}>加载中...</p></div>;
  }

  return (
    <div className="px-4 py-6" style={{ background: "var(--beige-light)" }}>
      <div className="mx-auto max-w-lg space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-lg" style={{ color: "#7A6B5D" }}>←</button>
          <h1 className="text-xl font-bold" style={{ color: "#2D2016" }}>编辑资料</h1>
        </div>

        <div className="sense-card space-y-4 p-5">
          <Field label="昵称" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "#7A6B5D" }}>行业</label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRY_OPTIONS.map((opt) => (
                <button key={opt} onClick={() => setForm({ ...form, industry: opt })}
                  className={`rounded-full border px-3 py-1.5 text-xs ${form.industry === opt ? "border-[#FF8A00] text-[#FF8A00] bg-[#FFF3E0]" : ""}`}
                  style={form.industry !== opt ? { borderColor: "#E8D4B4", color: "#2D2016" } : undefined}
                >{opt}</button>
              ))}
            </div>
          </div>
          <Field label="职位" value={form.job} onChange={(v) => setForm({ ...form, job: v })} />
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "#7A6B5D" }}>MBTI</label>
            <div className="flex flex-wrap gap-2">
              {MBTI_OPTIONS.map((opt) => (
                <button key={opt} onClick={() => setForm({ ...form, mbti: opt })}
                  className={`rounded-full border px-3 py-1.5 text-xs ${form.mbti === opt ? "border-[#FF8A00] text-[#FF8A00] bg-[#FFF3E0]" : ""}`}
                  style={form.mbti !== opt ? { borderColor: "#E8D4B4", color: "#2D2016" } : undefined}
                >{opt}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "#7A6B5D" }}>年龄段</label>
            <div className="flex flex-wrap gap-2">
              {AGE_OPTIONS.map((opt) => (
                <button key={opt} onClick={() => setForm({ ...form, ageRange: opt })}
                  className={`rounded-full border px-3 py-1.5 text-xs ${form.ageRange === opt ? "border-[#FF8A00] text-[#FF8A00] bg-[#FFF3E0]" : ""}`}
                  style={form.ageRange !== opt ? { borderColor: "#E8D4B4", color: "#2D2016" } : undefined}
                >{opt}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "#7A6B5D" }}>个人简介</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="介绍一下自己..."
              maxLength={200}
              rows={3}
              className="w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none focus:border-[#FF8A00]"
              style={{ borderColor: "#E8D4B4" }}
            />
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-3 text-sm disabled:opacity-50">
          {saving ? "保存中..." : "保存"}
        </button>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium" style={{ color: "#7A6B5D" }}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-full border bg-white px-4 py-2.5 text-sm outline-none focus:border-[#FF8A00]"
        style={{ borderColor: "#E8D4B4" }}
      />
    </div>
  );
}
