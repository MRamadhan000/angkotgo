import { FiCheck } from "react-icons/fi";

const BRAND_BLUE = "#1877F2";
const BRAND_BLUE_DARK = "#0E63D6";

interface StepIndicatorProps {
  step: number;
  totalSteps?: 1 | 2;
}

export function StepIndicator({ step, totalSteps = 2 }: StepIndicatorProps) {
  const labels = totalSteps === 1 ? ["Konfirmasi"] : ["Detail", "Bayar"];
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 py-1">
      {steps.map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold text-white transition-all duration-300"
            style={{
              backgroundColor:
                step === s ? BRAND_BLUE : step > s ? BRAND_BLUE_DARK : "#f1f5f9",
              color: step >= s ? "#ffffff" : "#94a3b8",
              transform: step === s ? "scale(1.1)" : "scale(1)",
            }}
          >
            {step > s ? <FiCheck className="text-sm" /> : s}
          </div>
          <span
            className="text-[11px] font-bold transition-colors"
            style={{ color: step >= s ? BRAND_BLUE_DARK : "#94a3b8" }}
          >
            {labels[s - 1]}
          </span>
          {s < totalSteps && (
            <div
              className="h-0.5 w-8 rounded-full transition-all duration-500"
              style={{ backgroundColor: step > s ? BRAND_BLUE_DARK : "#e2e8f0" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}