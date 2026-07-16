"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { logout } from "@/hooks/use-auth";

export function LogoutButton() {
  const router = useRouter();
  return (
    <Button variant="ghost" onClick={() => logout(router)}>
      Выйти
    </Button>
  );
}
