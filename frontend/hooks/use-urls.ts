"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { CreateUrlInput } from "@/lib/schemas";
import type { ShortUrl } from "@/lib/types";

export function useUrls() {
  return useQuery({
    queryKey: ["urls"],
    queryFn: () => apiFetch<ShortUrl[]>("/api/v1/links"),
  });
}

export function useCreateUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUrlInput) =>
      apiFetch<ShortUrl>("/api/v1/links", {
        method: "POST",
        body: JSON.stringify({
          original_url: data.original_url,
          custom_alias: data.custom_alias || null,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["urls"] });
    },
  });
}

export function useDeleteUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiFetch<void>(`/api/v1/links/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["urls"] });
    },
  });
}
