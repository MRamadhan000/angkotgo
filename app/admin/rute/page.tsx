"use client";

import { useState } from "react";
import {
  Bus, Route, Plus, Search, MapPinned, ArrowRight,
  Save, Trash2, Pencil, Eye, CheckCircle2, X,
  ChevronDown, LayoutGrid, List, Navigation,
  Menu,
  Bell,
} from "lucide-react";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/* ─── DATA ─── */
const INITIAL_ROUTES = [
  {
    id: 1,
    code: "AG",
    name: "Arjosari – Gadang",
    from: "Terminal Arjosari",
    to: "Terminal Gadang",
    roads: [
      "Jl. Simpang R. Panji Suroso",
      "Jl. Raden Intan",
      "Jl. Jend A. Yani",
      "Jl. Letjen S. Parman",
      "Jl. Basuki Rahmat",
      "Jl. Pasar Besar",
    ],
    status: "Aktif",
    drivers: 8,
  },
  {
    id: 2,
    code: "AL",
    name: "Arjosari – Landungsari",
    from: "Terminal Arjosari",
    to: "Terminal Landungsari",
    roads: [
      "Jl. Laksda Adi Sucipto",
      "Jl. Panglima Sudirman",
      "Jl. Kertanegara",
      "Jl. Semeru",
      "Jl. Veteran",
      "Jl. Sumbersari",
    ],
    status: "Aktif",
    drivers: 6,
  },
  {
    id: 3,
    code: "ADL",
    name: "Arjosari – Dinoyo – Landungsari",
    from: "Terminal Arjosari",
    to: "Terminal Landungsari",
    roads: [
      "Jl. WR. Supratman",
      "Jl. Trunojoyo",
      "Jl. Kahuripan",
      "Jl. Bandung",
      "Jl. Tlogomas",
    ],
    status: "Draft",
    drivers: 0,
  },
];

const EMPTY_FORM = {
  code: "",
  name: "",
  from: "",
  to: "",
  roadsRaw: "",
  roads: [] as string[],
};

/* ─── MODAL STEPS ─── */
const STEPS = ["Info Dasar", "Daftar Jalan", "Review"];

/* ─── ROUTE CARD ─── */
function RouteCard({
  route,
  onDelete,
}: {
  route: (typeof INITIAL_ROUTES)[0];
  onDelete: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isActive = route.status === "Aktif";

  return (
    <div className="group bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        {/* Code badge */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl font-bold text-lg tracking-wide leading-none">
            {route.code}
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isActive
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {route.status}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-blue-100 hover:text-blue-600 transition flex items-center justify-center">
            <Eye size={15} />
          </button>
          <button className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-amber-100 hover:text-amber-600 transition flex items-center justify-center">
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(route.id)}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-red-100 hover:text-red-600 transition flex items-center justify-center"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Route name */}
      <h3 className="mt-4 font-bold text-slate-800 text-lg leading-snug">
        {route.name}
      </h3>

      {/* From → To */}
      <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span>{route.from}</span>
        </div>
        <ArrowRight size={14} className="text-slate-300 flex-shrink-0" />
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-slate-400" />
          <span>{route.to}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-dashed border-slate-200" />

      {/* Road chips */}
      <div className="flex flex-wrap gap-2">
        {(expanded ? route.roads : route.roads.slice(0, 3)).map((road, idx) => (
          <span
            key={idx}
            className="bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-medium"
          >
            {road}
          </span>
        ))}
        {!expanded && route.roads.length > 3 && (
          <button
            onClick={() => setExpanded(true)}
            className="bg-blue-50 border border-blue-200 text-blue-600 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-blue-100 transition"
          >
            +{route.roads.length - 3} lagi
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <Bus size={13} />
          <span>{route.drivers} driver aktif</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPinned size={13} />
          <span>{route.roads.length} jalan</span>
        </div>
      </div>
    </div>
  );
}

/* ─── MODAL ─── */
function Modal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: typeof EMPTY_FORM) => void;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);

  if (!open) return null;

  const parseRoads = (raw: string) =>
    raw
      .split(/[\n,–\-]/)
      .map((r) => r.trim())
      .filter((r) => r.length > 2 && !/^\d+\.?\s*$/.test(r));

  const handleNext = () => {
    if (step === 0 && (!form.code || !form.name || !form.from || !form.to)) {
      alert("Semua field harus diisi!");
      return;
    }
    if (step === 1) {
      const roads = parseRoads(form.roadsRaw);
      if (roads.length === 0) { alert("Masukkan minimal 1 jalan!"); return; }
      setForm((f) => ({ ...f, roads }));
    }
    setStep((s) => s + 1);
  };

  const handleSave = () => {
    onSave(form);
    setForm(EMPTY_FORM);
    setStep(0);
    onClose();
  };

  const inputCls =
    "w-full border border-slate-200 bg-slate-50 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition placeholder:text-slate-400 text-black";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-700">Tambah Jalur Baru</h3>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      i < step
                        ? "bg-green-500 text-white"
                        : i === step
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {i < step ? <CheckCircle2 size={14} /> : i + 1}
                  </div>
                  <span
                    className={`text-xs font-semibold hidden sm:block ${
                      i === step ? "text-blue-600" : "text-slate-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-2 ${
                      i < step ? "bg-green-300" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6 max-h-[55vh] overflow-y-auto">
          {/* STEP 0 */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
                    Kode Jalur <span className="text-red-400">*</span>
                  </label>
                  <input
                    className={inputCls}
                    placeholder="Contoh: AG"
                    value={form.code}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
                    Nama Trayek <span className="text-red-400">*</span>
                  </label>
                  <input
                    className={inputCls}
                    placeholder="Arjosari – Gadang"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
                  Terminal Awal <span className="text-red-400">*</span>
                </label>
                <input
                  className={inputCls}
                  placeholder="Contoh: Terminal Arjosari"
                  value={form.from}
                  onChange={(e) => setForm((f) => ({ ...f, from: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
                  Terminal Akhir <span className="text-red-400">*</span>
                </label>
                <input
                  className={inputCls}
                  placeholder="Contoh: Terminal Gadang"
                  value={form.to}
                  onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <p className="text-sm text-slate-500 mb-4">
                Masukkan nama jalan yang dilewati — pisahkan dengan{" "}
                <span className="font-semibold text-slate-700">enter</span>,{" "}
                <span className="font-semibold text-slate-700">koma</span>, atau{" "}
                <span className="font-semibold text-slate-700">dash</span>.
              </p>
              <textarea
                className={`${inputCls} resize-none font-mono`}
                rows={10}
                placeholder={`Jl. Simpang R. Panji Suroso\nJl. Raden Intan\nJl. Jend A. Yani\nJl. Letjen S. Parman`}
                value={form.roadsRaw}
                onChange={(e) => setForm((f) => ({ ...f, roadsRaw: e.target.value }))}
              />
              <p className="text-xs text-slate-400 mt-2 text-right">
                {parseRoads(form.roadsRaw).length} jalan terdeteksi
              </p>
            </div>
          )}

          {/* STEP 2 – Review */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Summary */}
              <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 text-white px-3 py-1.5 rounded-xl font-bold text-sm">
                    {form.code}
                  </div>
                  <span className="font-semibold text-slate-800">{form.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>{form.from}</span>
                  <ArrowRight size={14} className="text-slate-300" />
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>{form.to}</span>
                </div>
              </div>

              {/* Roads list */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  {form.roads.length} Jalan Dilalui
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {form.roads.map((road, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-4 py-2.5"
                    >
                      <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-sm text-slate-700 font-medium">{road}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}
            className="px-5 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition text-sm font-semibold text-slate-600"
          >
            {step === 0 ? "Batal" : "← Kembali"}
          </button>

          {step < 2 ? (
            <button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-200"
            >
              Lanjut →
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-200"
            >
              <Save size={16} />
              Simpan Jalur
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function AdminRouteManagement() {
  const [routes, setRoutes] = useState(INITIAL_ROUTES);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Semua" | "Aktif" | "Draft">("Semua");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = routes.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "Semua" || r.status === filter;
    return matchSearch && matchFilter;
  });

  const handleDelete = (id: number) => {
    if (confirm("Hapus jalur ini?")) {
      setRoutes((r) => r.filter((x) => x.id !== id));
    }
  };

  const handleSave = (form: typeof EMPTY_FORM) => {
    setRoutes((r) => [
      ...r,
      {
        id: Date.now(),
        code: form.code,
        name: form.name,
        from: form.from,
        to: form.to,
        roads: form.roads,
        status: "Draft",
        drivers: 0,
      },
    ]);
  };

  const activeCount = routes.filter((r) => r.status === "Aktif").length;
  const draftCount = routes.filter((r) => r.status === "Draft").length;

  return (
    <main className={`${poppins.className} min-h-screen bg-[#F7F9FC]`}>
      {/* ═══════════ NAVBAR ═══════════ */}
     <nav className="w-full h-[85px] border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-200">
              <Bus size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-blue-700">AngkotTrack</h1>

              <p className="text-sm text-slate-500">Admin Dashboard</p>
            </div>
          </div>

          {/* MENU */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="/admin" className="text-slate-600 hover:text-blue-600">
              Dashboard
            </a>

            <a
              href="/admin/rute"
              className="text-blue-600 font-semibold transition"
            >
              Manajemen Rute
            </a>

            <a
              href="/admin/driver"
              className="text-slate-600 hover:text-blue-600 transition"
            >
              Manajemen Driver
            </a>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden lg:flex items-center gap-3 bg-slate-100 px-4 py-3 rounded-2xl w-[260px]">
              <Search size={18} className="text-slate-400" />

              <input
                type="text"
                placeholder="Cari data..."
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>

            {/* Notification */}
            <button className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
              <Bell size={20} />
            </button>

            {/* Mobile */}
            <button className="md:hidden">
              <Menu size={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════════ CONTENT ═══════════ */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">
              Manajemen Trayek
            </h2>
            <p className="text-slate-500 mt-2">
              Kelola jalur, terminal, dan jalan yang dilalui angkot kota Malang
            </p>
          </div>

          {/* Stat pills */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl shadow-sm text-sm">
              <Route size={15} className="text-slate-400" />
              <span className="font-bold text-slate-700">{routes.length}</span>
              <span className="text-slate-400">total jalur</span>
            </div>
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2.5 rounded-2xl text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="font-bold text-green-700">{activeCount} Aktif</span>
            </div>
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-2xl text-sm">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="font-bold text-amber-700">{draftCount} Draft</span>
            </div>
          </div>
        </div>

        {/* How it works — slim 3-step row */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 mb-8 shadow-sm">
          <div className="grid sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {[
              { num: "01", icon: Route, color: "text-blue-600 bg-blue-50", label: "Buat Kode Jalur", desc: "Tentukan kode & nama trayek" },
              { num: "02", icon: MapPinned, color: "text-amber-600 bg-amber-50", label: "Tambahkan Jalan", desc: "Input jalan yang dilewati" },
              { num: "03", icon: Navigation, color: "text-green-600 bg-green-50", label: "Publish Trayek", desc: "Langsung tersedia untuk driver" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                  <s.icon size={18} />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold">{s.num}</div>
                  <div className="font-semibold text-slate-800 text-sm leading-tight">{s.label}</div>
                  <div className="text-xs text-slate-400">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter bar + Tambah Jalur button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            {(["Semua", "Aktif", "Draft"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  filter === f
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-semibold shadow-lg shadow-blue-200 transition"
            >
              <Plus size={18} />
              Tambah Jalur
            </button>
            {/* View toggle */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
              <button
                onClick={() => setView("grid")}
                className={`p-2 rounded-lg transition ${view === "grid" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-700"}`}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-2 rounded-lg transition ${view === "list" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-700"}`}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Route grid / list */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search size={22} className="text-slate-400" />
            </div>
            <p className="font-semibold text-slate-700">Tidak ada jalur ditemukan</p>
            <p className="text-slate-400 text-sm mt-1">Coba ubah kata kunci atau filter</p>
          </div>
        ) : (
          <div
            className={
              view === "grid"
                ? "grid sm:grid-cols-2 xl:grid-cols-3 gap-5"
                : "flex flex-col gap-4"
            }
          >
            {filtered.map((route) => (
              <RouteCard key={route.id} route={route} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {/* ═══════════ MODAL ═══════════ */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </main>
  );
}