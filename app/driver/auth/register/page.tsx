"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  FaBus,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaArrowRight,
  FaSpinner,
  FaCheckCircle,
  FaInfoCircle,
} from "react-icons/fa";

import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// ─── Types ────────────────────────────────────────────────────────────────────

type RouteStatus = "tersedia" | "penuh";

interface ActiveRoute {
  name: string;
  status: RouteStatus;
  color: "green" | "amber" | "red";
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const ACTIVE_ROUTES: ActiveRoute[] = [
  { name: "Landungsari – Dinoyo", status: "tersedia", color: "green" },
  { name: "Arjosari – UB", status: "tersedia", color: "amber" },
  { name: "Gadang – Sawojajar", status: "penuh", color: "red" },
  { name: "Terminal – Soekarno Hatta", status: "tersedia", color: "green" },
];

const DOT_COLORS: Record<ActiveRoute["color"], string> = {
  green: "#97C459",
  amber: "#EF9F27",
  red: "#F09595",
};

// ─── Components ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: RouteStatus }) {
  const isAvail = status === "tersedia";

  return (
    <span
      className={`ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded ${
        isAvail
          ? "bg-green-500/20 text-green-200"
          : "bg-red-400/20 text-red-200"
      }`}
    >
      {isAvail ? "Tersedia" : "Penuh"}
    </span>
  );
}

function RouteDot({ color }: { color: ActiveRoute["color"] }) {
  return (
    <span
      className="w-2 h-2 rounded-full flex-shrink-0"
      style={{ backgroundColor: DOT_COLORS[color] }}
    />
  );
}

function Sidebar() {
  return (
    <aside className="hidden lg:flex w-full flex-col bg-[#0C447C] px-8 py-10 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#378ADD]/20" />

      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-black/10" />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3 mb-12">
        <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg">
          <FaBus className="text-2xl text-white" />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            AngkotGo
          </h1>

          <p className="text-blue-100 text-sm">
            Smart Transportation Platform
          </p>
        </div>
      </div>

      {/* Hero */}
      <div className="relative z-10 max-w-lg">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium text-white mb-6">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Driver Registration
        </div>

        <h2 className="text-5xl font-extrabold text-white leading-tight tracking-tight">
          Bergabung Menjadi
          <span className="text-[#C8E6FF]"> Driver AngkotGo</span>
        </h2>

        <p className="mt-6 text-blue-100 text-lg leading-relaxed">
          Daftarkan dirimu sebagai driver dan mulai aktifkan tracking armada
          secara real-time untuk membantu penumpang menemukan angkot lebih
          mudah.
        </p>

        {/* Features */}
        <div className="mt-10 space-y-4">
          <div className="flex items-start gap-4 bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <FaCheckCircle className="text-lg text-green-300" />
            </div>

            <div>
              <h3 className="font-bold text-lg text-white">
                Registrasi Mudah
              </h3>

              <p className="text-blue-100 text-sm mt-1">
                Hanya membutuhkan data dasar untuk proses pendaftaran driver.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <FaBus className="text-lg text-white" />
            </div>

            <div>
              <h3 className="font-bold text-lg text-white">
                Tracking Real-time
              </h3>

              <p className="text-blue-100 text-sm mt-1">
                Driver dapat mengaktifkan mode narik dan membagikan lokasi
                armada secara langsung.
              </p>
            </div>
          </div>
        </div>
      </div>

    </aside>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DriverRegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!fullName || !phone || !email) {
      setError("Semua field wajib diisi.");
      return;
    }

    setIsLoading(true);

    // TODO: API REGISTER

    setTimeout(() => {
      router.push("/driver/auth/login");
    }, 1200);
  };

  return (
    <main
      className={`${poppins.className} min-h-screen relative overflow-hidden`}
      style={{
        background:
          "linear-gradient(135deg, #e6f1fb 0%, #f8fafc 50%, #eaf3de 100%)",
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-120px] left-[-120px] w-[320px] h-[320px] bg-blue-200/40 rounded-full blur-3xl" />

        <div className="absolute bottom-[-120px] right-[-120px] w-[320px] h-[320px] bg-green-200/40 rounded-full blur-3xl" />

        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:38px_38px]" />
      </div>

      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* LEFT SIDE */}
        <section className="hidden lg:flex">
          <Sidebar />
        </section>

        {/* RIGHT SIDE */}
        <section className="flex items-center justify-center px-4 py-8 sm:px-6 md:px-8 lg:px-10">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#185FA5] shadow-lg shadow-blue-500/20">
                <FaBus className="text-white text-2xl" />
              </div>

              <h1 className="mt-5 text-3xl font-extrabold text-slate-900">
                AngkotGo
              </h1>

              <p className="text-slate-500 mt-2 text-sm">
                Smart Transportation Platform
              </p>
            </div>

            {/* Card */}
            <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-3xl p-5 sm:p-7 lg:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
              {/* Header */}
              <div className="mb-7">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Portal Registrasi Driver
                </div>

                <h2 className="mt-5 text-3xl font-extrabold text-slate-900 leading-tight">
                  Daftar Driver Baru
                </h2>

                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  Lengkapi data berikut untuk membuat akun driver AngkotGo.
                </p>
              </div>

              {/* FORM */}
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Full Name
                  </label>

                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />

                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                      className="w-full h-13 sm:h-14 rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Nomor Telepon
                  </label>

                  <div className="relative">
                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />

                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full h-13 sm:h-14 rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Email
                  </label>

                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contoh@email.com"
                      className="w-full h-13 sm:h-14 rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl px-4 py-3">
                    {error}
                  </div>
                )}

                {/* Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group mt-2 w-full h-12 sm:h-14 rounded-2xl bg-[#0C447C] hover:bg-[#185FA5] text-white font-bold text-sm transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Daftar Sekarang
                      <FaArrowRight className="group-hover:translate-x-1 transition" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom */}
              <div className="mt-6 bg-green-50 border border-green-100 rounded-2xl p-4">
                <p className="flex items-start gap-2 text-xs text-green-700 leading-relaxed">
                  <FaInfoCircle className="mt-0.5 flex-shrink-0" />
                  Setelah registrasi, akun driver akan diverifikasi oleh admin
                  sebelum dapat digunakan sepenuhnya.
                </p>
              </div>

              {/* Login */}
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">
                  Sudah punya akun?{" "}
                  <Link
                    href="/driver/auth/login"
                    className="text-blue-700 font-bold hover:text-blue-800"
                  >
                    Masuk sekarang
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}