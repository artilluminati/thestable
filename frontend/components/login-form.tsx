"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/use-auth";
import { loginSchema, type LoginInput } from "@/lib/schemas";

export function LoginForm() {
    const login = useLogin();
    const searchParams = useSearchParams();
    const expired = searchParams.get("expired") === "1";
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

    return (
        <Card className="w-full max-w-sm p-6">
            <div className="mb-6 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500 text-sm font-bold text-neutral-950">
                    P
                </div>
                <h1 className="text-lg font-black font-climate-crisis-sans text-neutral-100">
                    Вход
                </h1>
            </div>
            {expired && (
                <div className="mb-4 rounded-md border border-amber-900/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
                    Сессия истекла - войди снова
                </div>
            )}
            <form
                onSubmit={handleSubmit((data) => login.mutate(data))}
                className="space-y-4"
            >
                <div className="space-y-1">
                    <Label htmlFor="username">Имя пользователя</Label>
                    <Input id="username" {...register("username")} />
                    {errors.username && (
                        <p className="text-sm text-red-400">
                            {errors.username.message}
                        </p>
                    )}
                </div>
                <div className="space-y-1">
                    <Label htmlFor="password">Пароль</Label>
                    <Input
                        id="password"
                        type="password"
                        {...register("password")}
                    />
                    {errors.password && (
                        <p className="text-sm text-red-400">
                            {errors.password.message}
                        </p>
                    )}
                </div>
                {login.isError && (
                    <p className="text-sm text-red-400">
                        {(login.error as Error).message}
                    </p>
                )}
                <Button
                    type="submit"
                    className="w-full"
                    disabled={login.isPending}
                >
                    {login.isPending ? "Вход..." : "Войти"}
                </Button>
            </form>
            <p className="mt-4 text-center text-sm text-neutral-500">
                Нет аккаунта?{" "}
                <Link
                    href="/register"
                    className="text-emerald-400 hover:text-emerald-300"
                >
                    Зарегистрироваться
                </Link>
            </p>
        </Card>
    );
}
