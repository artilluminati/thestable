"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNoteSearch, useNotes } from "@/hooks/use-notes";
import { encodeNotePath } from "@/lib/notes-path";

export function NotesList() {
  const [query, setQuery] = useState("");
  const { data: allNotes, isLoading } = useNotes();
  const { data: searchResults, isFetching: isSearching } = useNoteSearch(query);

  const isSearchMode = query.trim().length > 0;
  const notes = isSearchMode ? searchResults : allNotes;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Поиск по заметкам..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Link href="/dashboard/notes/new">
          <Button className="w-full sm:w-auto">Новая заметка</Button>
        </Link>
      </div>

      {(isLoading || (isSearchMode && isSearching)) && (
        <p className="text-sm text-neutral-500">Загрузка...</p>
      )}

      {!isLoading && notes && notes.length === 0 && (
        <p className="text-sm text-neutral-500">
          {isSearchMode ? "Ничего не найдено" : "Пока нет ни одной заметки"}
        </p>
      )}

      <div className="space-y-2">
        {notes?.map((note) => (
          <Link key={note.path} href={`/dashboard/notes/${encodeNotePath(note.path)}`}>
            <Card className="p-4 transition-colors hover:bg-neutral-50">
              <p className="font-medium text-neutral-900">{note.title}</p>
              <p className="text-sm text-neutral-500">{note.path}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
