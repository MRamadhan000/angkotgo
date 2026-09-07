import { z } from "zod";

export const loginConductorSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email kondektur wajib diisi." })
    .email({ message: "Format email tidak valid." }),
  password: z
    .string()
    .min(1, { message: "Password wajib diisi." }),
});

export const registerConductorSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Nama lengkap wajib diisi." }),
  nik: z
    .string()
    .min(1, { message: "NIK wajib diisi." })
    .length(16, { message: "NIK harus tepat 16 digit angka." })
    .regex(/^[0-9]+$/, { message: "NIK hanya boleh berisi angka." }),
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
    .min(6, { message: "Password minimal 6 karakter." }),
  address: z.string().optional(),
});

export type LoginConductorSchema = z.infer<typeof loginConductorSchema>;
export type RegisterConductorSchema = z.infer<typeof registerConductorSchema>;