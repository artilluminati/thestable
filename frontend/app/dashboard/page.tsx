"use client";

import {
    Bell,
    Download,
    Folder,
    KeyRound,
    Link2,
    NotebookText,
    Search,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNotes } from "@/hooks/use-notes";
import { useReminders } from "@/hooks/use-reminders";
import { useUrls } from "@/hooks/use-urls";
import { pluralizeRu } from "@/lib/pluralize";
import { cn } from "@/lib/utils";

interface ModuleCard {
    key: string;
    name: string;
    description: string;
    href: string | null; // null = not built yet, shown greyed out
    icon: typeof Link2;
    stat: string;
}

export default function DashboardPage() {
    const [query, setQuery] = useState("");

    const { data: urls } = useUrls();
    const { data: notes } = useNotes();
    const { data: reminders } = useReminders();

    const modules: ModuleCard[] = useMemo(() => {
        const linksCount = urls?.length ?? null;
        const totalClicks = urls?.reduce((sum, u) => sum + u.clicks, 0) ?? 0;
        const notesCount = notes?.length ?? null;
        const remindersCount = reminders?.length ?? null;

        return [
            {
                key: "links",
                name: "Ссылки",
                description: "Короткие ссылки со статистикой переходов",
                href: "/dashboard/links",
                icon: Link2,
                stat:
                    linksCount === null
                        ? "..."
                        : `${linksCount} ${pluralizeRu(linksCount, "ссылка", "ссылки", "ссылок")} · ${totalClicks} ${pluralizeRu(totalClicks, "переход", "перехода", "переходов")}`,
            },
            {
                key: "notes",
                name: "Заметки",
                description: "Markdown-заметки поверх vault, backlinks, поиск",
                href: "/dashboard/notes",
                icon: NotebookText,
                stat:
                    notesCount === null
                        ? "..."
                        : `${notesCount} ${pluralizeRu(notesCount, "заметка", "заметки", "заметок")}`,
            },
            {
                key: "reminders",
                name: "Напоминания",
                description: "Разовые и повторяющиеся напоминания в Telegram",
                href: "/dashboard/reminders",
                icon: Bell,
                stat:
                    remindersCount === null
                        ? "..."
                        : `${remindersCount} ${pluralizeRu(remindersCount, "напоминание", "напоминания", "напоминаний")}`,
            },
            {
                key: "downloads",
                name: "Downloads",
                description: "Загрузка видео/аудио через yt-dlp",
                href: null,
                icon: Download,
                stat: "скоро",
            },
            {
                key: "passwords",
                name: "Passwords",
                description:
                    "Генератор паролей, UUID, JWT, base64 и другие утилиты",
                href: null,
                icon: KeyRound,
                stat: "скоро",
            },
            {
                key: "files",
                name: "Files",
                description: "Файловое хранилище с временными ссылками",
                href: null,
                icon: Folder,
                stat: "скоро",
            },
        ];
    }, [urls, notes, reminders]);

    const filtered = modules.filter((m) =>
        `${m.name} ${m.description}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-xl font-black font-climate-crisis-sans text-neutral-100">
                    Дашборд
                </h1>
                <p className="text-sm text-neutral-400">
                    Обзор твоих модулей и быстрый доступ к ним
                </p>
            </div>

            <div className="relative">
                <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Поиск модулей..."
                    className="pl-9"
                />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {filtered.map((module) => {
                    const Icon = module.icon;
                    const card = (
                        <Card
                            className={cn(
                                "flex h-full flex-col gap-2 p-4",
                                module.href
                                    ? "transition-colors hover:bg-neutral-800"
                                    : "opacity-50",
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <Icon size={18} className="text-emerald-400" />
                                <span className="font-medium text-neutral-100">
                                    {module.name}
                                </span>
                            </div>
                            <p className="text-sm text-neutral-400">
                                {module.description}
                            </p>
                            <p className="mt-auto text-xs text-neutral-500">
                                {module.stat}
                            </p>
                        </Card>
                    );

                    return module.href ? (
                        <Link key={module.key} href={module.href}>
                            {card}
                        </Link>
                    ) : (
                        <div key={module.key} className="cursor-not-allowed">
                            {card}
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <p className="text-sm text-neutral-400 sm:col-span-2">
                        Ничего не найдено
                    </p>
                )}
            </div>
        </div>
    );
}
