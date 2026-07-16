import { NavBar } from "@/components/nav-bar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  );
}
