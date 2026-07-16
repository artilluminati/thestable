import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";

const NAV_LINKS = [
    { href: "/dashboard", label: "Ссылки" },
    { href: "/dashboard/notes", label: "Заметки" },
    { href: "/dashboard/reminders", label: "Напоминания" },
];

export function NavBar() {
    return (
        <header className="border-b border-mist-700 bg-mist-900">
            <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-4 py-4">
                <div className="flex flex-wrap items-center gap-6">
                    <span className="font-semibold">Personal Platform</span>
                    <nav className="flex flex-wrap gap-4">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm text-neutral-600 hover:text-neutral-900"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <LogoutButton />
            </div>
        </header>
    );
}
