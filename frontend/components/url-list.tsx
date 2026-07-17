"use client";

import { Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { useDeleteUrl, useUrls } from "@/hooks/use-urls";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function UrlList() {
  const { data: urls, isLoading, isError } = useUrls();
  const deleteUrl = useDeleteUrl();

  if (isLoading) return <p className="text-sm text-neutral-400">Загрузка...</p>;
  if (isError) return <p className="text-sm text-red-400">Не удалось загрузить ссылки</p>;
  if (!urls || urls.length === 0) {
    return <p className="text-sm text-neutral-400">Пока нет ни одной ссылки</p>;
  }

  return (
    <div className="space-y-3">
      {urls.map((url) => (
        <Card key={url.id} className="flex items-center justify-between p-4">
          <div className="min-w-0">
            <a
              href={`${API_BASE_URL}/r/${url.short_code}`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-emerald-400 hover:text-emerald-300"
            >
              {API_BASE_URL.replace(/^https?:\/\//, "")}/r/{url.short_code}
            </a>
            <p className="truncate text-sm text-neutral-400">{url.original_url}</p>
            <p className="text-xs text-neutral-500">{url.clicks} переходов</p>
          </div>
          <button
            onClick={() => deleteUrl.mutate(url.id)}
            className="ml-4 shrink-0 text-neutral-500 hover:text-red-400"
            aria-label="Удалить"
          >
            <Trash2 size={18} />
          </button>
        </Card>
      ))}
    </div>
  );
}
