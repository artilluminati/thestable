"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateUrl } from "@/hooks/use-urls";
import { createUrlSchema, type CreateUrlInput } from "@/lib/schemas";

export function UrlForm() {
  const createUrl = useCreateUrl();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUrlInput>({ resolver: zodResolver(createUrlSchema) });

  const onSubmit = (data: CreateUrlInput) => {
    createUrl.mutate(data, { onSuccess: () => reset() });
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1">
          <Label htmlFor="original_url">Ссылка</Label>
          <Input id="original_url" placeholder="https://example.com" {...register("original_url")} />
          {errors.original_url && (
            <p className="text-sm text-red-400">{errors.original_url.message}</p>
          )}
        </div>
        <div className="w-full space-y-1 sm:w-40">
          <Label htmlFor="custom_alias">Алиас (не обязательно)</Label>
          <Input id="custom_alias" placeholder="my-link" {...register("custom_alias")} />
          {errors.custom_alias && (
            <p className="text-sm text-red-400">{errors.custom_alias.message}</p>
          )}
        </div>
        <Button type="submit" disabled={createUrl.isPending}>
          {createUrl.isPending ? "Создание..." : "Создать"}
        </Button>
      </form>
      {createUrl.isError && (
        <p className="mt-2 text-sm text-red-400">{(createUrl.error as Error).message}</p>
      )}
    </Card>
  );
}
