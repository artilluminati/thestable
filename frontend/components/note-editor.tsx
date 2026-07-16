"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useNote, useNoteBacklinks, useUpdateNote } from "@/hooks/use-notes";
import { encodeNotePath } from "@/lib/notes-path";

export function NoteEditor({ path }: { path: string }) {
  const { data: note, isLoading, isError } = useNote(path);
  const { data: backlinks } = useNoteBacklinks(path);
  const updateNote = useUpdateNote(path);

  const [content, setContent] = useState("");

  // Seed the editable content once the note loads (and whenever the path
  // changes, since this component is reused across /dashboard/notes/[...path]).
  useEffect(() => {
    if (note) setContent(note.content);
  }, [note]);

  if (isLoading) return <p className="text-sm text-neutral-500">Загрузка...</p>;
  if (isError || !note) return <p className="text-sm text-red-500">Заметка не найдена</p>;

  const isDirty = content !== note.content;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold">{note.title}</h1>
          <p className="text-sm text-neutral-500">{note.path}</p>
        </div>
        <Button
          onClick={() => updateNote.mutate({ content })}
          disabled={!isDirty || updateNote.isPending}
        >
          {updateNote.isPending ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>

      <Card className="p-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={16}
          spellCheck={false}
        />
      </Card>

      {updateNote.isError && (
        <p className="text-sm text-red-500">{(updateNote.error as Error).message}</p>
      )}
      {updateNote.isSuccess && !isDirty && <p className="text-sm text-green-600">Сохранено</p>}

      {note.outbound_links.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-neutral-700">Ссылки из этой заметки</h2>
          <div className="flex flex-wrap gap-2">
            {note.outbound_links.map((link) => (
              <Link
                key={link}
                href={`/dashboard/notes/${encodeNotePath(link)}`}
                className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-700 hover:bg-neutral-200"
              >
                {link}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-neutral-700">Backlinks</h2>
        {!backlinks || backlinks.length === 0 ? (
          <p className="text-sm text-neutral-500">Пока никто не ссылается на эту заметку</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {backlinks.map((b) => (
              <Link
                key={b.path}
                href={`/dashboard/notes/${encodeNotePath(b.path)}`}
                className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-700 hover:bg-neutral-200"
              >
                {b.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
