"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api-client";
import { clearToken, setToken } from "@/lib/auth";
import type { LoginInput, RegisterInput } from "@/lib/schemas";
import type { AuthToken, User } from "@/lib/types";

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginInput) =>
      apiFetch<AuthToken>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
        auth: false,
      }),
    onSuccess: (data) => {
      setToken(data.access_token);
      router.push("/dashboard");
      router.refresh();
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterInput) =>
      apiFetch<User>("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
        auth: false,
      }),
    onSuccess: () => {
      router.push("/login");
    },
  });
}

export function logout(router: ReturnType<typeof useRouter>) {
  clearToken();
  router.push("/login");
  router.refresh();
}
