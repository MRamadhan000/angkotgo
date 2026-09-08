"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaUser, FaEnvelope, FaPhone, FaArrowRight } from "react-icons/fa";
import { Poppins } from "next/font/google";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AuthHero from "@/components/auth/AuthHero";
import InfoNotice from "@/components/common/InfoNotice";
import TextField from "@/components/ui/TextField";
import PasswordField from "@/components/ui/PasswordField";
import PrimaryButton from "@/components/ui/PrimaryButton";

import { useAuthUser } from "@/hooks/auth/useAuthUser";
import { registerUserSchema, RegisterUserSchema } from "@/schemas/user.schema";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function UserRegisterPage() {
  const router = useRouter();
  const { registerUser, isLoading, error } = useAuthUser();
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterUserSchema>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterUserSchema) => {
    setFormError("");

    try {
      await registerUser(data);
      router.push("/auth/login");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : error || "Gagal mendaftarkan akun. Periksa kembali data Anda.";
      setFormError(errorMessage);
    }
  };

  return (
    <main
      className={`${poppins.className} min-h-screen relative`}
      style={{
        background:
          "linear-gradient(135deg, #f0f9ff 0%, #f8fafc 50%, #f0fdf4 100%)",
      }}
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-120px] left-[-120px] w-[320px] h-[320px] bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-120px] w-[320px] h-[320px] bg-green-200/40 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:38px_38px]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen items-stretch">
        {/* LEFT SIDE */}
        <AuthHero />

        {/* RIGHT SIDE */}
        <section className="flex flex-col items-center justify-center px-4 py-8 sm:px-6 md:px-12 lg:px-10 xl:px-16 w-full my-auto">
          <div className="w-full max-w-lg mx-auto">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-6 sm:mb-8">
              <h1 className="mt-3 text-2xl font-extrabold text-slate-900 tracking-tight">
                AngkotGo
              </h1>
              <p className="text-xs text-slate-500">Pendaftaran Akun Baru</p>
            </div>

            {/* Form Container */}
            <div className="bg-white/75 backdrop-blur-2xl border border-white/60 rounded-2xl sm:rounded-[28px] p-5 sm:p-7 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
              {/* Header */}
              <div className="mb-5 sm:mb-6 text-center lg:text-left">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
                  Daftar Akun Baru
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Lengkapi data diri Anda untuk membuat akun.
                </p>
              </div>

              {/* Error Alert Global / API Error */}
              {(formError || error) && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm rounded-xl">
                  {formError || error}
                </div>
              )}

              {/* FORM */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <TextField
                  label="Nama Lengkap"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  icon={<FaUser />}
                  error={errors.name?.message}
                  {...register("name")}
                />

                <TextField
                  label="Email"
                  type="email"
                  placeholder="user@example.com"
                  icon={<FaEnvelope />}
                  error={errors.email?.message}
                  {...register("email")}
                />

                <TextField
                  label="Nomor Telepon"
                  type="text"
                  placeholder="08123456789"
                  icon={<FaPhone />}
                  error={errors.phone?.message}
                  {...register("phone")}
                />

                <PasswordField
                  label="Password (Min. 6 Karakter)"
                  placeholder="Masukkan password"
                  error={errors.password?.message}
                  {...register("password")}
                />

                <PrimaryButton
                  type="submit"
                  loading={isLoading}
                  loadingText="Mendaftarkan..."
                  icon={<FaArrowRight />}
                >
                  Daftar Sekarang
                </PrimaryButton>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[11px] sm:text-xs text-slate-400 font-medium tracking-wide">
                  atau
                </span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Login Button */}
              <Link
                href="/auth/login"
                className="group flex items-center justify-center gap-2 w-full h-11 sm:h-12 rounded-xl sm:rounded-2xl border-2 border-blue-200 hover:border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-blue-600 font-bold text-xs sm:text-sm transition-all duration-200 hover:scale-[1.01]"
              >
                <FaUser className="text-xs sm:text-sm" />
                <span>Sudah punya akun? Masuk</span>
              </Link>

              <InfoNotice color="blue">
                Pastikan data yang Anda masukkan sudah benar sebelum membuat
                akun.
              </InfoNotice>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
