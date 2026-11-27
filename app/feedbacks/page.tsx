"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  FiArrowLeft,
  FiStar,
  FiCheckCircle,
  FiSend,
  FiMessageSquare,
  FiTag,
} from "react-icons/fi";

// List preset tag yang bisa dipilih cepat oleh penumpang
const PRESET_TAGS = [
  { label: "Pengemudi Ramah", type: "positive" },
  { label: "Perjalanan Nyaman", type: "positive" },
  { label: "Tepat Waktu", type: "positive" },
  { label: "Mobil Bersih", type: "positive" },
  { label: "Ongkos Sesuai", type: "positive" },
  { label: "Ugal-ugalan", type: "negative" },
  { label: "Kurang ramah", type: "negative" },
  { label: "Angkot kotor", type: "negative" },
  { label: "Terlalu penuh", type: "negative" },
  { label: "Menunggu lama", type: "negative" },
];

export default function UserFeedbackFormPage() {
  const router = useRouter();
  const params = useParams();

  // Ekstrak assignmentId dari params jika ada
  const rawId = params?.id ?? params?.assignmentId ?? params?.slug;
  const assignmentId = Number(Array.isArray(rawId) ? rawId[0] : rawId) || 16; // default dummy 16

  // Form State
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [experience, setExperience] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Toggle Pilihan Tag
  const toggleTag = (tagLabel: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagLabel)
        ? prev.filter((t) => t !== tagLabel)
        : [...prev, tagLabel]
    );
  };

  // Submit Handler (Dummy)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);

    // DUMMY PAYLOAD yang dikirim ke backend NestJS
    const payload = {
      vehicleAssignmentId: assignmentId,
      rating,
      tags: selectedTags,
      experience: experience.trim() || null,
    };

    console.log("Feedback Payload submitted:", payload);

    // Simulasi delay network
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

  // Render Tampilan Sukses setelah Submit
  if (isSubmitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center text-slate-900">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
          <FiCheckCircle size={36} />
        </div>
        <h1 className="mt-4 text-lg font-bold text-slate-800">
          Ulasan Berhasil Terkirim!
        </h1>
        <p className="mt-1 max-w-xs text-xs text-slate-500 leading-relaxed">
          Terima kasih atas ulasan kamu. Masukanmu sangat berharga untuk meningkatkan kualitas pelayanan AngkotGo.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-6 w-full max-w-xs rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
        >
          Kembali ke Perjalanan
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <FiArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-sm font-bold">Beri Ulasan Perjalanan</h1>
              <p className="text-[11px] text-slate-500">
                Penugasan #{assignmentId}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* STAR RATING INPUT */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            <h2 className="text-xs font-bold text-slate-700">
              Bagaimana pengalaman perjalanan kamu?
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Pilih jumlah bintang sesuai kepuasan layanan
            </p>

            <div className="mt-4 flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                  >
                    <FiStar
                      size={32}
                      className={`transition-colors ${
                        active
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="mt-2 h-4 text-[11px] font-semibold text-amber-600">
              {rating === 5 && "Sangat Memuaskan! 🌟"}
              {rating === 4 && "Memuaskan 👍"}
              {rating === 3 && "Cukup Baik 🙂"}
              {rating === 2 && "Kurang Memuaskan 🙁"}
              {rating === 1 && "Buruk / Perlu Evaluasi ⚠️"}
            </div>
          </section>

          {/* TAG SELECTION */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <FiTag size={16} className="text-blue-600" />
              <div>
                <h2 className="text-xs font-bold">Catatan Singkat</h2>
                <p className="text-[10px] text-slate-400">
                  Pilih label yang paling menggambarkan armada / sopir
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {PRESET_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag.label);
                const isNegative = tag.type === "negative";

                let activeClass = isNegative
                  ? "border-rose-500 bg-rose-50 text-rose-700"
                  : "border-emerald-500 bg-emerald-50 text-emerald-700";

                return (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => toggleTag(tag.label)}
                    className={`rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition ${
                      isSelected
                        ? activeClass
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {isSelected ? "✓ " : ""}{tag.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* TEXT EXPERIENCE INPUT */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <FiMessageSquare size={16} className="text-blue-600" />
              <h2 className="text-xs font-bold">Pengalaman Tambahan (Opsional)</h2>
            </div>

            <textarea
              rows={4}
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Tuliskan saran, kritik, atau apresiasi untuk sopir ini..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 resize-none placeholder:text-slate-400"
            />
          </section>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={rating === 0 || isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Mengirimkan...</span>
            ) : (
              <>
                <FiSend size={14} />
                <span>Kirim Ulasan</span>
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}