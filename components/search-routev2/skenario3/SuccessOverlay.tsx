import { useEffect } from "react";
import { FiCheck } from "react-icons/fi";

const GOJEK_GREEN = "#00AA13";

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
        borderRadius: "1rem",
      }}
    >
      <style>{`
        @keyframes bpmPop {
          0%   { transform: scale(0); opacity: 0; }
          70%  { transform: scale(1.08); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes bpmRipple {
          0%   { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        @keyframes bpmSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bpmFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .bpm-overlay  { animation: bpmFadeIn 0.25s ease; }
        .bpm-icon     { animation: bpmPop 0.4s 0.1s cubic-bezier(.4,0,.2,1) both; }
        .bpm-ripple-1 { animation: bpmRipple 1.3s 0s ease-out infinite; }
        .bpm-ripple-2 { animation: bpmRipple 1.3s 0.35s ease-out infinite; }
        .bpm-title    { animation: bpmSlideUp 0.35s 0.25s both; }
        .bpm-sub      { animation: bpmSlideUp 0.35s 0.4s both; }
      `}</style>

      <div className="bpm-overlay flex flex-col items-center">
        <div style={{ position: "relative", marginBottom: "1rem" }}>
          {["bpm-ripple-1", "bpm-ripple-2"].map((cls) => (
            <span
              key={cls}
              className={cls}
              style={{
                position: "absolute",
                inset: "-8px",
                borderRadius: "50%",
                border: `2px solid ${GOJEK_GREEN}`,
                display: "block",
              }}
            />
          ))}
          <div
            className="bpm-icon"
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: GOJEK_GREEN,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FiCheck size={32} color="white" strokeWidth={3} />
          </div>
        </div>
        <p
          className="bpm-title"
          style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.01em" }}
        >
          Pembayaran berhasil
        </p>
        <p className="bpm-sub" style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.3rem" }}>
          Booking kamu sudah terkonfirmasi
        </p>
      </div>
    </div>
  );
}