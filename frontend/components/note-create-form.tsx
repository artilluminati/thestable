"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateNote } from "@/hooks/use-notes";
import { encodeNotePath } from "@/lib/notes-path";
import { createNoteSchema, type CreateNoteInput } from "@/lib/schemas";

export function NoteCreateForm() {
  const router = useRouter();
  const createNote = useCreateNote();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateNoteInput>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: { path: "", content: "" },
  });

  const onSubmit = (data: CreateNoteInput) => {
    createNote.mutate(data, {
      onSuccess: (note) => {
        router.push(`/dashboard/notes/${encodeNotePath(note.path)}`);
      },
    });
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="path">Путь (например, projects/idea - .md допишется сам)</Label>
          <Input id="path" placeholder="ideas" {...register("path")} />
          {errors.path && <p className="text-sm text-red-500">{errors.path.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="content">Содержимое</Label>
          <Textarea id="content" rows={12} placeholder="# Заголовок&#10;&#10;Текст заметки..." {...register("content")} />
        </div>
        {createNote.isError && (
          <p className="text-sm text-red-500">{(createNote.error as Error).message}</p>
        )}
        <Button type="submit" disabled={createNote.isPending}>
          {createNote.isPending ? "Создание..." : "Создать заметку"}
        </Button>
      </form>
    </Card>
  );
}
