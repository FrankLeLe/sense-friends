import BottomNav from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <main className="pb-nav">{children}</main>
      <BottomNav />
    </div>
  );
}
