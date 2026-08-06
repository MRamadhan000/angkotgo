"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FaUser, 
  FaIdCard, 
  FaEnvelope, 
  FaPhone, 
  FaLock, 
  FaAddressCard, 
  FaCalendarAlt, 
  FaArrowRight 
} from "react-icons/fa";
import { Poppins } from "next/font/google";
import AuthHero from "@/components/auth/AuthHero";
import InfoNotice from "@/components/common/InfoNotice";
import TextField from "@/components/ui/TextField";
import PasswordField from "@/components/ui/PasswordField";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { driverService } from "@/services/driver.service"; // Sesuaikan path service register Anda

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function DriverRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // State sesuai dengan field CreateDriverDto
  const [formData, setFormData] = useState({
    name: "",
    nik: "",
    email: "",
    phone: "",
    password: "",
    licenseNumber: "",
    licenseExpiryDate: "",
    address: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Validasi sederhana frontend
    if (!formData.name || !formData.nik || !formData.email || !formData.phone || !formData.password || !formData.licenseNumber || !formData.licenseExpiryDate) {
      setFormError("Semua field bertanda wajib harus diisi.");
      return;
    }

    if (formData.nik.length !== 16) {
      setFormError("NIK harus tepat 16 karakter.");
      return;
    }

    setIsLoading(true);
    try {
      // Panggil service register
      await driverService.registerDriver(formData);

      // Jika berhasil, arahkan ke halaman login atau dashboard
      router.push("/driver/auth/login");
    } catch (err: any) {
      setFormError(
        err.message || "Gagal mendaftarkan akun. Periksa kembali data Anda."
      );
    } finally {
      setIsLoading(false);
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
        {/* LEFT SIDE (Desktop Element / Info Banner) */}
        <AuthHero />

        {/* RIGHT SIDE (Responsive Register Form) */}
        <section className="flex flex-col items-center justify-center px-4 py-8 sm:px-6 md:px-12 lg:px-10 xl:px-16 w-full my-auto">
          <div className="w-full max-w-lg mx-auto">
            {/* Mobile View Header Logo */}
            <div className="lg:hidden text-center mb-6 sm:mb-8">
              <h1 className="mt-3 text-2xl font-extrabold text-slate-900 tracking-tight">
                AngkotGo
              </h1>
              <p className="text-xs text-slate-500">
                Pendaftaran Akun Driver Baru
              </p>
            </div>

            {/* Main Form Container Box */}
            <div className="bg-white/75 backdrop-blur-2xl border border-white/60 rounded-2xl sm:rounded-[28px] p-5 sm:p-7 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
              {/* Header */}
              <div className="mb-5 sm:mb-6 text-center lg:text-left">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
                  Daftar Driver Baru
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Lengkapi data diri Anda untuk mulai bergabung.
                </p>
              </div>

              {/* Tampilkan error jika ada */}
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm rounded-xl">
                  {formError}
                </div>
              )}

              {/* FORM */}
              <form onSubmit={handleRegister} className="space-y-4">
                <TextField
                  label="Nama Lengkap"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                  icon={<FaUser />}
                />

                <TextField
                  label="NIK (16 Karakter)"
                  type="text"
                  name="nik"
                  value={formData.nik}
                  onChange={handleChange}
                  placeholder="3507xxxxxxxxxxxx"
                  maxLength={16}
                  icon={<FaIdCard />}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="driver@example.com"
                    icon={<FaEnvelope />}
                  />
                  <TextField
                    label="Nomor Telepon"
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="08123456789"
                    icon={<FaPhone />}
                  />
                </div>

                <PasswordField
                  label="Password (Min. 6 Karakter)"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Masukkan password"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField
                    label="Nomor SIM"
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    placeholder="No. SIM / Driver License"
                    icon={<FaAddressCard />}
                  />
                  <TextField
                    label="Masa Berlaku SIM"
                    type="date"
                    name="licenseExpiryDate"
                    value={formData.licenseExpiryDate}
                    onChange={handleChange}
                    icon={<FaCalendarAlt />}
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Alamat (Opsional)
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Alamat tempat tinggal saat ini"
                    className="w-full h-11 sm:h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                <PrimaryButton
                  type="submit"
                  loading={isLoading}
                  loadingText="Mendaftarkan..."
                  icon={<FaArrowRight />}
                >
                  Daftar Sekarang
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
                href="/driver/auth/login"
                className="group flex items-center justify-center gap-2 w-full h-11 sm:h-12 rounded-xl sm:rounded-2xl border-2 border-blue-200 hover:border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-blue-600 font-bold text-xs sm:text-sm transition-all duration-200 hover:scale-[1.01]"
              >
                <FaUser className="text-xs sm:text-sm" />
                <span>Sudah punya akun? Masuk</span>
              </Link>

              <InfoNotice color="blue">
                Pastikan data SIM dan NIK yang Anda masukkan valid sesuai dokumen resmi.
              </InfoNotice>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}