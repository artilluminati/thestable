"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/use-auth";
import { loginSchema, type LoginInput } from "@/lib/schemas";

export function LoginForm() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  return (
    <Card className="w-full max-w-sm p-6">
      <h1 className="mb-6 text-xl font-semibold">Вход</h1>
      <form onSubmit={handleSubmit((data) => login.mutate(data))} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="username">Имя пользователя</Label>
          <Input id="username" {...register("username")} />
          {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Пароль</Label>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>
        {login.isError && <p className="text-sm text-red-500">{(login.error as Error).message}</p>}
        <Button type="submit" className="w-full" disabled={login.isPending}>
          {login.isPending ? "Вход..." : "Войти"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-500">
        Нет аккаунта?{" "}
        <Link href="/register" className="text-neutral-900 underline">
          Зарегистрироваться
        </Link>
      </p>
    </Card>
  );
}
