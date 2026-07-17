"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import { Sidebar } from "@/components/sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-neutral-950">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* The sidebar itself is off-canvas below md, so the button that
            opens it has to live outside it, in a small mobile-only bar. */}
        <div className="flex items-center gap-3 border-b border-neutral-800 px-4 py-3 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
            aria-label="Открыть меню"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold text-neutral-100">Personal Platform</span>
        </div>

        <main className="flex-1 overflow-y-auto px-4 py-6 text-neutral-100 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-3xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
