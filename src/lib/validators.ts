import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  username: z
    .string()
    .min(3, "用户名至少 3 个字符")
    .max(20, "用户名最多 20 个字符")
    .regex(/^[a-zA-Z0-9_]+$/, "用户名只能包含字母、数字和下划线"),
  password: z.string().min(8, "密码至少 8 个字符"),
});

export const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "请输入密码"),
});

export const entryCreateSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().min(1, "内容不能为空"),
  mood: z.number().int().min(1).max(10).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  ambientSound: z.string().max(500).optional().nullable(),
  weather: z.string().max(50).optional().nullable(),
  visibility: z.enum(["private", "public"]).optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export const entryUpdateSchema = entryCreateSchema.partial();
