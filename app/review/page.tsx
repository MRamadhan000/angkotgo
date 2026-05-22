"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FaBus,
  FaArrowRight,
  FaBars,
  FaTimes,
  FaStar,
  FaRegStar,
  FaPaperPlane,
  FaSmile,
  FaUserFriends,
  FaShieldAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type RatingKey = "driver" | "comfort" | "clean";

export default function FeedbackPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [ratings, setRatings] = useState<Record<RatingKey, number>>({
    driver: 0,
    comfort: 0,
    clean: 0,
  });
  const [hoveredRating, setHoveredRating] = useState<Record<RatingKey, number>>({
    driver: 0,
    comfort: 0,
    clean: 0,
  });
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success">("idle");

  const setRating = (key: RatingKey, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
  };

  const setHover = (key: RatingKey, value: number) => {
    setHoveredRating((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!ratings.driver) newErrors.driver = "Berikan penilaian pengemudi";
    if (!ratings.comfort) newErrors.comfort = "Berikan penilaian kenyamanan";
    if (!ratings.clean) newErrors.clean = "Berikan penilaian kebersihan";
    if (!comment.trim()) newErrors.comment = "Komentar tidak boleh kosong";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitState("loading");
    await new Promise((r) => setTimeout(r, 1800));
    setSubmitState("success");
    await new Promise((r) => setTimeout(r, 2200));
    router.push("/");
  };

  const ratingLabels: Record<number, string> = {
    1: "Sangat Buruk",
    2: "Buruk",
    3: "Cukup",
    4: "Baik",
    5: "Sangat Baik",
  };

  const sections: { key: RatingKey; label: string; sub: string; bg: string; color: string; icon: React.ReactNode }[] = [
    {
      key: "driver",
      label: "Penilaian Pengemudi",
      sub: "Keramahan dan cara berkendara",
      bg: "bg-blue-100",
      color: "text-blue-600",
      icon: <FaUserFriends size={18} />,
    },
    {
      key: "comfort",
      label: "Kenyamanan Angkot",
      sub: "Kursi, suhu, dan kondisi perjalanan",
      bg: "bg-cyan-100",
      color: "text-cyan-600",
      icon: <FaBus size={18} />,
    },
    {
      key: "clean",
      label: "Kebersihan & Keamanan",
      sub: "Kebersihan kendaraan dan rasa aman",
      bg: "bg-emerald-100",
      color: "text-emerald-600",
      icon: <FaShieldAlt size={18} />,
    },
  ];

  return (
    <main className={`${poppins.className} bg-[#f8fbff] text-slate-900 overflow-hidden min-h-screen`}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes starPop {
          0% { transform: scale(1); }
          40% { transform: scale(1.4) rotate(-8deg); }
          70% { transform: scale(0.9) rotate(4deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes spinBounce {
          0%   { transform: rotate(0deg) scale(1); }
          25%  { transform: rotate(180deg) scale(1.15); }
          50%  { transform: rotate(360deg) scale(0.9); }
          75%  { transform: rotate(540deg) scale(1.1); }
          100% { transform: rotate(720deg) scale(1); }
        }
        @keyframes successPulse {
          0%   { transform: scale(0.5); opacity: 0; }
          60%  { transform: scale(1.15); opacity: 1; }
          80%  { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        @keyframes ripple {
          0%   { transform: scale(0); opacity: 0.6; }
          100% { transform: scale(4); opacity: 0; }
        }
        @keyframes slideBar {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .fade-up { animation: fadeInUp 0.6s ease both; }
        .fade-up-1 { animation: fadeInUp 0.6s 0.1s ease both; }
        .fade-up-2 { animation: fadeInUp 0.6s 0.2s ease both; }
        .fade-up-3 { animation: fadeInUp 0.6s 0.3s ease both; }
        .fade-up-4 { animation: fadeInUp 0.6s 0.4s ease both; }
        .fade-up-5 { animation: fadeInUp 0.6s 0.5s ease both; }
        .star-pop { animation: starPop 0.35s cubic-bezier(.36,.07,.19,.97) both; }
        .card-scale { animation: scaleIn 0.5s 0.15s ease both; }
        .success-pop { animation: successPulse 0.6s cubic-bezier(.36,.07,.19,.97) both; }
        .error-shake { animation: shake 0.4s ease; }
        .loading-bar { animation: slideBar 1.6s ease-in-out infinite; }
      `}</style>

      {/* BACKGROUND */}
      <div className="absolute top-0 left-0 w-full h-[700px] bg-gradient-to-br from-blue-100/60 via-cyan-50 to-transparent blur-3xl -z-10" />

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-3 rounded-2xl shadow-lg shadow-blue-200">
              <FaBus size={18} />
            </div>
            <div>
              <h1 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">AngkotTrack</h1>
              <p className="text-xs text-slate-500">Smart Transport</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/" className="hover:text-blue-600 transition">Home</Link>
            <Link href="/feedback" className="text-blue-600 font-semibold">Feedback</Link>
            <Link href="/faq" className="hover:text-blue-600 transition">FAQ</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-blue-200 hover:scale-[1.03] transition">
              Admin <FaArrowRight size={13} />
            </Link>
          </div>

          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-slate-100">
            <FaBars size={20} />
          </button>
        </div>
      </nav>

      {/* MOBILE OVERLAY */}
      <div onClick={() => setIsSidebarOpen(false)} className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-all duration-300 ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} />

      {/* SIDEBAR */}
      <aside className={`fixed top-0 right-0 h-full w-72 bg-white z-[70] shadow-2xl transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-3 rounded-xl"><FaBus size={18} /></div>
              <div>
                <h2 className="font-bold text-lg">AngkotTrack</h2>
                <p className="text-xs text-slate-500">Navigation</p>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-lg hover:bg-slate-100"><FaTimes size={20} /></button>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/" className="px-4 py-3 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition">Home</Link>
            <Link href="/feedback" className="px-4 py-3 rounded-xl bg-blue-50 text-blue-600 font-semibold">Feedback</Link>
            <Link href="/faq" className="px-4 py-3 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition">FAQ</Link>
          </div>
        </div>
      </aside>

      {/* HERO */}
      <section className="relative pt-32 md:pt-44 pb-12 md:pb-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="fade-up inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-5 py-2 rounded-full text-sm font-medium mb-6">
            <FaSmile size={14} />
            Feedback Pengalaman Perjalanan
          </div>
          <h1 className="fade-up-1 text-4xl md:text-6xl font-bold leading-tight">
            Bagikan
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent"> Pengalaman Anda</span>
          </h1>
          <p className="fade-up-2 mt-6 text-slate-600 text-sm md:text-lg leading-relaxed max-w-2xl mx-auto">
            Feedback Anda membantu kami meningkatkan kenyamanan, keamanan, dan kualitas pelayanan angkot di kota Malang.
          </p>
        </div>
      </section>

      {/* FORM */}
      <section className="pb-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="card-scale bg-white rounded-3xl border border-slate-100 shadow-xl shadow-blue-100/30 p-5 sm:p-7 md:p-10 relative overflow-hidden">

            {/* LOADING OVERLAY */}
            {submitState === "loading" && (
              <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-5 rounded-3xl">
                {/* Ripple circles */}
                <div className="relative flex items-center justify-center w-20 h-20">
                  <span className="absolute w-20 h-20 rounded-full bg-blue-200 opacity-60" style={{ animation: "ripple 1.2s ease-out infinite" }} />
                  <span className="absolute w-20 h-20 rounded-full bg-cyan-200 opacity-40" style={{ animation: "ripple 1.2s 0.4s ease-out infinite" }} />
                  <div className="relative z-10 bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 rounded-2xl shadow-lg" style={{ animation: "spinBounce 1.6s ease-in-out infinite" }}>
                    <FaPaperPlane size={24} />
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full loading-bar" />
                </div>
                <p className="text-slate-600 font-medium text-sm animate-pulse">Mengirim feedback Anda…</p>
              </div>
            )}

            {/* SUCCESS OVERLAY */}
            {submitState === "success" && (
              <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center gap-5 rounded-3xl">
                <div className="success-pop bg-gradient-to-r from-blue-500 to-cyan-400 text-white p-5 rounded-3xl shadow-xl shadow-blue-200">
                  <FaCheckCircle size={40} />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-xl text-slate-800 mb-1">Terima kasih!</h3>
                  <p className="text-slate-500 text-sm">Feedback Anda berhasil dikirim. Mengalihkan ke halaman utama…</p>
                </div>
                <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ animation: "slideBar 2.2s linear forwards" }} />
                </div>
              </div>
            )}

            {/* RATING SECTIONS */}
            {sections.map((s, i) => {
              const active = hoveredRating[s.key] || ratings[s.key];
              return (
                <div key={s.key} className={`mb-8 fade-up-${i + 1}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`${s.bg} ${s.color} p-3 rounded-2xl`}>{s.icon}</div>
                    <div>
                      <h2 className="font-bold text-lg md:text-xl">{s.label}</h2>
                      <p className="text-sm text-slate-500">{s.sub}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(s.key, star)}
                          onMouseEnter={() => setHover(s.key, star)}
                          onMouseLeave={() => setHover(s.key, 0)}
                          className="transition-transform hover:scale-110 active:scale-95 p-0.5"
                          style={ratings[s.key] === star ? { animation: "starPop 0.35s ease" } : undefined}
                        >
                          {star <= active ? (
                            <FaStar size={30} className="text-yellow-400 drop-shadow-sm transition-all" />
                          ) : (
                            <FaRegStar size={30} className="text-slate-300 transition-all" />
                          )}
                        </button>
                      ))}
                    </div>
                    {active > 0 && (
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full transition-all">
                        {ratingLabels[active]}
                      </span>
                    )}
                  </div>

                  {errors[s.key] && (
                    <p className="mt-2 text-red-500 text-xs font-medium flex items-center gap-1 error-shake">
                      <span>⚠</span> {errors[s.key]}
                    </p>
                  )}
                </div>
              );
            })}

            {/* DIVIDER */}
            <div className="border-t border-slate-100 mb-8" />

            {/* COMMENT */}
            <div className="mb-8 fade-up-4">
              <label className="block font-semibold mb-3 text-sm md:text-base">
                Komentar Tambahan
                <span className="text-red-400 ml-1">*</span>
              </label>
              <div className="relative">
                <textarea
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                    if (e.target.value.trim()) setErrors((p) => { const n = { ...p }; delete n.comment; return n; });
                  }}
                  placeholder="Ceritakan pengalaman perjalanan Anda…"
                  className={`w-full min-h-[140px] rounded-2xl border focus:ring-4 focus:ring-blue-100 outline-none p-4 text-sm md:text-base resize-none transition-all duration-200 ${errors.comment ? "border-red-300 bg-red-50/30" : "border-slate-200 focus:border-blue-500"}`}
                />
                <span className="absolute bottom-3 right-4 text-xs text-slate-400">{comment.length} karakter</span>
              </div>
              {errors.comment && (
                <p className="mt-2 text-red-500 text-xs font-medium flex items-center gap-1 error-shake">
                  <span>⚠</span> {errors.comment}
                </p>
              )}
            </div>

            {/* SUBMIT */}
            <button
              onClick={handleSubmit}
              disabled={submitState !== "idle"}
              className="fade-up-5 w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-blue-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-300 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl" />
              <span className="relative">Kirim Feedback</span>
              <FaPaperPlane size={14} className="relative group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 py-8 px-4 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg"><FaBus size={16} /></div>
            <div>
              <h2 className="font-bold text-sm md:text-base">AngkotTrack</h2>
              <p className="text-xs text-slate-500">Smart Transport Platform</p>
            </div>
          </div>
          <p className="text-slate-500 text-xs md:text-sm text-center">© 2026 AngkotTrack. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}