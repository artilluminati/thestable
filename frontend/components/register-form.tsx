"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/hooks/use-auth";
import { registerSchema, type RegisterInput } from "@/lib/schemas";

export function RegisterForm() {
  const registerUser = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  return (
    <Card className="w-full max-w-sm p-6">
      <h1 className="mb-6 text-xl font-semibold">Регистрация</h1>
      <form onSubmit={handleSubmit((data) => registerUser.mutate(data))} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="username">Имя пользователя</Label>
          <Input id="username" {...register("username")} />
          {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Пароль</Label>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>
        {registerUser.isError && (
          <p className="text-sm text-red-500">{(registerUser.error as Error).message}</p>
        )}
        <Button type="submit" className="w-full" disabled={registerUser.isPending}>
          {registerUser.isPending ? "Создание..." : "Зарегистрироваться"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-500">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="text-neutral-900 underline">
          Войти
        </Link>
      </p>
    </Card>
  );
}
