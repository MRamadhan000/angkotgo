const fmtRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

interface TransitAngkot {
  type: "transit";
  id: string;
  name: string;
  color: string;
  eta: number;
  distance: number;
  price: number;
  legs: [string, string];
}

export function TransitCard({
  a,
  onTracking,
  isTracking,
}: { a: TransitAngkot; onTracking?: (a: TransitAngkot) => void; isTracking?: boolean }) {
  return (
    <div
      style={{
        borderRadius: 18,
        padding: 14,
        background: "#f0f5ff",
        border: "1px solid #d1dbe9",
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#2563eb",
          marginBottom: 10,
        }}
      >
        🔀 Rute Transit · Ganti di Pertigaan
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {[a.legs[0], "→", "Transit", "→", a.legs[1]].map((x, i) =>
            i % 2 === 1 ? (
              <span key={i} style={{ color: "var(--text3)" }}>
                {x}
              </span>
            ) : x === "Transit" ? (
              <span
                key={i}
                style={{
                  padding: "5px 10px",
                  borderRadius: 8,
                  fontSize: 10,
                  fontWeight: 700,
                  background: "#e0ecff",
                  border: "1px solid #2563eb",
                  color: "#2563eb",
                }}
              >
                {x}
              </span>
            ) : (
              <span
                key={i}
                style={{
                  padding: "5px 10px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  background: "var(--surface2)",
                  color: "var(--text2)",
                  fontFamily: "monospace",
                }}
              >
                {x}
              </span>
            ),
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
            {fmtRp(a.price)}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#2563eb" }}>
            ⏱ {a.eta} menit
          </div>
        </div>
      </div>
      {/* Tracking Button */}
      <button
        onClick={() => onTracking && onTracking(a)}
        disabled={!isTracking}
        style={{
          marginTop: 12,
          width: "100%",
          borderRadius: 12,
          padding: "8px 0",
          fontSize: 12,
          fontWeight: 700,
          border: "1px solid #2563eb",
          background: isTracking ? "#fff" : "#f3f4f6",
          color: isTracking ? "#2563eb" : "#b0b6c3",
          cursor: isTracking ? "pointer" : "not-allowed",
          transition: "all 0.2s",
        }}
      >
        Lihat Tracking
      </button>
    </div>
  );
}
