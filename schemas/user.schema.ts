import { z } from "zod";

export const registerUserSchema = z.object({
  name: z.string().min(1, { message: "Nama lengkap wajib diisi." }),
  email: z
    .string()
    .min(1, { message: "Email wajib diisi." })
    .email({ message: "Format email tidak valid." }),
  phone: z
    .string()
    .min(1, { message: "Nomor telepon wajib diisi." })
    .regex(/^[0-9+]+$/, { message: "Nomor telepon hanya boleh berisi angka." })
    .min(10, { message: "Nomor telepon minimal 10 digit." }),
  password: z
    .string()
    .min(6, { message: "Password harus memiliki minimal 6 karakter." }),
});

export const loginUserSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email wajib diisi." })
    .email({ message: "Format email tidak valid." }),
  password: z.string().min(1, { message: "Password wajib diisi." }),
});

export type RegisterUserSchema = z.infer<typeof registerUserSchema>;
export type LoginUserSchema = z.infer<typeof loginUserSchema>;
