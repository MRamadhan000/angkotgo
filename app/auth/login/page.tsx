"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaEnvelope, FaArrowRight, FaUserPlus } from "react-icons/fa";
import { Poppins } from "next/font/google";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AuthHero from "@/components/auth/AuthHero";
import InfoNotice from "@/components/common/InfoNotice";
import TextField from "@/components/ui/TextField";
import PasswordField from "@/components/ui/PasswordField";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { useAuthUser } from "@/hooks/auth/useAuthUser";
import { loginUserSchema, LoginUserSchema } from "@/schemas/user.schema";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function UserLoginPage() {
  const router = useRouter();
  const [formError, setFormError] = useState("");

  const { loginUser, isLoading, error: authError } = useAuthUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginUserSchema>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginUserSchema) => {
    setFormError("");

    try {
      await loginUser(data);
      router.push("/dashboard"); // Redirect ke dashboard user setelah berhasil login
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Gagal masuk, periksa kembali email dan password.";
      setFormError(errorMessage);
    }
  };

  return (
    <main
      className={`${poppins.className} min-h-screen lg:h-screen lg:overflow-hidden relative`}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen lg:h-full items-stretch">
        {/* LEFT SIDE (Desktop Element / Info Banner) */}
        <AuthHero />

        {/* RIGHT SIDE (Responsive Login Form) */}
        <section className="flex flex-col items-center justify-center px-4 py-8 sm:px-6 md:px-12 lg:px-10 xl:px-16 w-full h-full my-auto">
          <div className="w-full max-w-md mx-auto">
            {/* Mobile View Header Logo */}
            <div className="lg:hidden text-center mb-6 sm:mb-8">
              <h1 className="mt-3 text-2xl font-extrabold text-slate-900 tracking-tight">
                AngkotGo
              </h1>
              <p className="text-xs text-slate-500">
                Layanan Angkutan Umum Perkotaan
              </p>
            </div>

            {/* Main Form Container Box */}
            <div className="bg-white/75 backdrop-blur-2xl border border-white/60 rounded-2xl sm:rounded-[28px] p-5 sm:p-7 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
              {/* Header */}
              <div className="mb-5 sm:mb-6 text-center lg:text-left">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
                  Masuk Akun User
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Silakan masuk untuk mulai perjalanan Anda.
                </p>
              </div>

              {/* Tampilkan pesan error global/API */}
              {(formError || authError) && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm rounded-xl">
                  {formError || authError}
                </div>
              )}

              {/* FORM */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <TextField
                  label="Email User"
                  type="email"
                  placeholder="user@example.com"
                  icon={<FaEnvelope />}
                  error={errors.email?.message}
                  {...register("email")}
                />
                <PasswordField
                  label="Password"
                  placeholder="Masukkan password"
                  error={errors.password?.message}
                  {...register("password")}
                />

                <PrimaryButton
                  type="submit"
                  loading={isLoading}
                  loadingText="Memverifikasi..."
                  icon={<FaArrowRight />}
                >
                  Masuk
                </PrimaryButton>
              </form>

              {/* Visual Divider Line */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[11px] sm:text-xs text-slate-400 font-medium tracking-wide">
                  atau
                </span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <Link
                href="/auth/register"
                className="group flex items-center justify-center gap-2 w-full h-11 sm:h-13 rounded-xl sm:rounded-2xl border-2 border-blue-200 hover:border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-blue-600 font-bold text-xs sm:text-sm transition-all duration-200 hover:scale-[1.01]"
              >
                <FaUserPlus className="text-xs sm:text-sm" />
                <span>Belum punya akun? Daftar Sekarang</span>
              </Link>

              <InfoNotice color="blue">
                Gunakan email dan password yang terdaftar sebagai akun
                penumpang.
              </InfoNotice>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
