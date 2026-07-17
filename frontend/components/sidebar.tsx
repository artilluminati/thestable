"use client";

import {
    Bell,
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    Link2,
    LogOut,
    NotebookText,
} from "lucide-react";
import Logo from "../public/logo.svg";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { logout } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { href: "/dashboard", label: "Дашборд", icon: LayoutDashboard },
    { href: "/dashboard/links", label: "Ссылки", icon: Link2 },
    { href: "/dashboard/notes", label: "Заметки", icon: NotebookText },
    { href: "/dashboard/reminders", label: "Напоминания", icon: Bell },
];

const COLLAPSE_STORAGE_KEY = "pp_sidebar_collapsed";

interface SidebarProps {
    mobileOpen: boolean;
    onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    // Desktop-only "collapse to icons" state, remembered across visits.
    // Starts expanded on the very first render (both server and client) to
    // avoid a hydration mismatch, then reads localStorage right after mount.
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        if (localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1") {
            setCollapsed(true);
        }
    }, []);

    const toggleCollapsed = () => {
        setCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
            return next;
        });
    };

    return (
        <>
            {/* Backdrop - mobile drawer only, tapping it closes the menu */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/60 md:hidden"
                    onClick={onCloseMobile}
                    aria-hidden="true"
                />
            )}

            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 flex h-screen shrink-0 flex-col border-r border-neutral-800 bg-neutral-900 transition-transform duration-200 ease-out",
                    "md:static md:translate-x-0",
                    mobileOpen ? "translate-x-0" : "-translate-x-full",
                    // Collapse only ever applies at md: and up - on mobile the drawer
                    // is always shown at full width when open (collapsing an
                    // overlay drawer doesn't make sense, you'd just close it instead).
                    collapsed ? "w-64 md:w-16" : "w-64",
                )}
            >
                <div
                    className={cn(
                        "flex items-center gap-2 px-5 py-5",
                        collapsed && "md:justify-center md:px-0",
                    )}
                >
                    <Logo
                        className="flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold text-neutral-950"
                        width={28}
                        height={28}
                        viewBox="0 0 85 69"
                    />
                    <span
                        className={cn(
                            "text-sm font-black font-climate-crisis-sans text-neutral-100",
                            collapsed && "md:hidden",
                        )}
                    >
                        The Stable
                    </span>
                </div>

                <nav className="flex-1 space-y-1 px-3">
                    {NAV_ITEMS.map((item) => {
                        // "/dashboard" itself must match exactly - otherwise it would
                        // stay "active" while browsing /dashboard/notes etc. too.
                        const isActive =
                            item.href === "/dashboard"
                                ? pathname === "/dashboard"
                                : pathname.startsWith(item.href);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onCloseMobile}
                                title={collapsed ? item.label : undefined}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                                    collapsed && "md:justify-center md:px-2",
                                    isActive
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100",
                                )}
                            >
                                <Icon
                                    size={17}
                                    strokeWidth={2}
                                    className="shrink-0"
                                />
                                <span className={cn(collapsed && "md:hidden")}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-neutral-800 p-3">
                    <button
                        onClick={() => logout(router)}
                        title={collapsed ? "Выйти" : undefined}
                        className={cn(
                            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-100",
                            collapsed && "md:justify-center md:px-2",
                        )}
                    >
                        <LogOut
                            size={17}
                            strokeWidth={2}
                            className="shrink-0"
                        />
                        <span className={cn(collapsed && "md:hidden")}>
                            Выйти
                        </span>
                    </button>

                    {/* Collapse toggle - desktop only, mobile has no use for it */}
                    <button
                        onClick={toggleCollapsed}
                        className="mt-1 hidden w-full items-center justify-center rounded-md px-3 py-2 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-100 md:flex"
                        aria-label={
                            collapsed ? "Развернуть меню" : "Свернуть меню"
                        }
                    >
                        {collapsed ? (
                            <ChevronRight size={17} />
                        ) : (
                            <ChevronLeft size={17} />
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
}
