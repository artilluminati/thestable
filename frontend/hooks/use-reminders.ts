"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { encodeNotePath } from "@/lib/notes-path";
import type { Reminder } from "@/lib/types";

export function useReminders() {
  return useQuery({
    queryKey: ["reminders"],
    queryFn: () => apiFetch<Reminder[]>("/api/v1/reminders"),
  });
}

export function useTestReminder() {
  return useMutation({
    mutationFn: (path: string) =>
      apiFetch<void>(`/api/v1/reminders/${encodeNotePath(path)}/test`, { method: "POST" }),
  });
}
