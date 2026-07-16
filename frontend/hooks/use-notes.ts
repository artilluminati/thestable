"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { encodeNotePath } from "@/lib/notes-path";
import type { CreateNoteInput, UpdateNoteInput } from "@/lib/schemas";
import type { Note, NoteSummary } from "@/lib/types";

export function useNotes() {
  return useQuery({
    queryKey: ["notes"],
    queryFn: () => apiFetch<NoteSummary[]>("/api/v1/notes"),
  });
}

export function useNoteSearch(query: string) {
  return useQuery({
    queryKey: ["notes", "search", query],
    queryFn: () => apiFetch<NoteSummary[]>(`/api/v1/notes/search?q=${encodeURIComponent(query)}`),
    enabled: query.trim().length > 0,
  });
}

export function useNote(path: string) {
  return useQuery({
    queryKey: ["notes", path],
    queryFn: () => apiFetch<Note>(`/api/v1/notes/${encodeNotePath(path)}`),
    enabled: Boolean(path),
  });
}

export function useNoteBacklinks(path: string) {
  return useQuery({
    queryKey: ["notes", path, "backlinks"],
    queryFn: () => apiFetch<NoteSummary[]>(`/api/v1/notes/${encodeNotePath(path)}/backlinks`),
    enabled: Boolean(path),
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNoteInput) =>
      apiFetch<Note>("/api/v1/notes", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useUpdateNote(path: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateNoteInput) =>
      apiFetch<Note>(`/api/v1/notes/${encodeNotePath(path)}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["notes", path] });
      queryClient.invalidateQueries({ queryKey: ["notes", path, "backlinks"] });
    },
  });
}
