import { FiCheckCircle } from "react-icons/fi";

export function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-2 py-1">
      {[1, 2].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold transition-all duration-300 ${
              step === s
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-110"
                : step > s
                ? "bg-emerald-500 text-white"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            {step > s ? <FiCheckCircle className="text-sm" /> : s}
          </div>
          <span
            className={`text-[11px] font-bold transition-colors ${
              step === s ? "text-blue-600" : step > s ? "text-emerald-600" : "text-slate-400"
            }`}
          >
            {s === 1 ? "Detail" : "Bayar"}
          </span>
          {s < 2 && (
            <div
              className={`h-0.5 w-8 rounded-full transition-all duration-500 ${
                step > 1 ? "bg-emerald-500" : "bg-slate-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}