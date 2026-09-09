import { useEffect } from "react";
import { FiCheckCircle } from "react-icons/fi";

export function SuccessOverlay({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.97)",
        borderRadius: "1.5rem",
      }}
    >
      <style>{`
        @keyframes bpmPop {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes bpmRipple {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes bpmSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bpmFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .bpm-overlay { animation: bpmFadeIn 0.3s ease; }
        .bpm-icon    { animation: bpmPop 0.5s 0.1s cubic-bezier(.4,0,.2,1) both; }
        .bpm-ripple-1 { animation: bpmRipple 1.4s 0s ease-out infinite; }
        .bpm-ripple-2 { animation: bpmRipple 1.4s 0.2s ease-out infinite; }
        .bpm-ripple-3 { animation: bpmRipple 1.4s 0.4s ease-out infinite; }
        .bpm-title   { animation: bpmSlideUp 0.4s 0.3s both; }
        .bpm-sub     { animation: bpmSlideUp 0.4s 0.45s both; }
      `}</style>

      <div className="bpm-overlay flex flex-col items-center">
        <div style={{ position: "relative", marginBottom: "1.25rem" }}>
          {["bpm-ripple-1", "bpm-ripple-2", "bpm-ripple-3"].map((cls) => (
            <span
              key={cls}
              className={cls}
              style={{
                position: "absolute",
                inset: "-12px",
                borderRadius: "50%",
                border: "2px solid #22c55e",
                display: "block",
              }}
            />
          ))}
          <div
            className="bpm-icon"
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 32px 0 rgba(34,197,94,0.35)",
            }}
          >
            <FiCheckCircle size={36} color="white" />
          </div>
        </div>
        <p className="bpm-title" style={{ fontSize: "1.1rem", fontWeight: 800, color: "#15803d", letterSpacing: "-0.02em" }}>
          Pembayaran Berhasil!
        </p>
        <p className="bpm-sub" style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.35rem" }}>
          Booking kamu sudah terkonfirmasi ✓
        </p>
      </div>
    </div>
  );
}