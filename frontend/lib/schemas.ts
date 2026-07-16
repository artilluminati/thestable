import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Введите имя пользователя"),
  password: z.string().min(1, "Введите пароль"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Минимум 3 символа").max(50),
  email: z.string().email("Некорректный email"),
  password: z.string().min(8, "Минимум 8 символов"),
});

export const createUrlSchema = z.object({
  original_url: z.string().url("Введите корректный URL"),
  custom_alias: z
    .string()
    .max(16)
    .regex(/^[a-zA-Z0-9_-]*$/, "Только буквы, цифры, - и _")
    .optional()
    .or(z.literal("")),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateUrlInput = z.infer<typeof createUrlSchema>;

export const createNoteSchema = z.object({
  path: z
    .string()
    .min(1, "Введите путь к заметке")
    .refine((v) => !v.startsWith("/") && !v.includes(".."), "Некорректный путь"),
  content: z.string(),
});

export const updateNoteSchema = z.object({
  content: z.string(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
