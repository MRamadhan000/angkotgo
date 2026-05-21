"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bus,
  Route,
  Plus,
  Search,
  MapPinned,
  ArrowRight,
  Save,
  Trash2,
  Pencil,
  Eye,
  CheckCircle2,
  X,
  LayoutGrid,
  List,
  Navigation,
  Bell,
  ChevronRight,
  Home,
  Settings,
  Users,
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

const STEPS = ["Info Dasar", "Daftar Jalan", "Review"];

/* ─── MOBILE SIDEBAR ─── */
function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: Home, active: false },
    { href: "/admin/rute", label: "Manajemen Rute", icon: Route, active: true },
    {
      href: "/admin/driver",
      label: "Manajemen Driver",
      icon: Users,
      active: false,
    },

  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-blue-50 to-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-2.5 rounded-xl shadow-lg">
              <Bus size={20} />
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-blue-700 text-lg leading-none">
                AngkotTrack
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Admin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center flex-shrink-0"
          >
            <X size={16} className="text-slate-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium text-sm ${
                item.active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200/50"
                  : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}

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
    <div className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-3.5 sm:p-5 lg:p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-2xl font-bold text-sm sm:text-lg tracking-wide leading-none">
            {route.code}
          </div>
          <span
            className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold ${
              isActive
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {route.status}
          </span>
        </div>

        {/* Actions — always visible on mobile, hover on desktop */}
        <div className="flex items-center gap-1.5 sm:gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          {/* Detail */}
          <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition flex items-center justify-center flex-shrink-0">
            <Eye size={14} />
          </button>

          {/* Edit */}
          <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-100 text-amber-600 hover:bg-amber-200 transition flex items-center justify-center flex-shrink-0">
            <Pencil size={14} />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(route.id)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition flex items-center justify-center flex-shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <h3 className="mt-3 sm:mt-4 font-bold text-slate-800 text-sm sm:text-base lg:text-lg leading-snug">
        {route.name}
      </h3>

      {/* From → To — stacks nicely on very narrow screens */}
      <div className="mt-2.5 sm:mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
          <span>{route.from}</span>
        </div>
        <ArrowRight size={14} className="text-slate-300 flex-shrink-0" />
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0" />
          <span>{route.to}</span>
        </div>
      </div>

      <div className="my-3 sm:my-4 border-t border-dashed border-slate-200" />

      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {(expanded ? route.roads : route.roads.slice(0, 3)).map((road, idx) => (
          <span
            key={idx}
            className="bg-slate-50 border border-slate-200 text-slate-600 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-xs font-medium"
          >
            {road}
          </span>
        ))}
        {!expanded && route.roads.length > 3 && (
          <button
            onClick={() => setExpanded(true)}
            className="bg-blue-50 border border-blue-200 text-blue-600 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-xs font-semibold hover:bg-blue-100 transition"
          >
            +{route.roads.length - 3}
          </button>
        )}
      </div>

      <div className="mt-3 sm:mt-4 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <Bus size={12} />
          <span>{route.drivers}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPinned size={12} />
          <span>{route.roads.length}</span>
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
      if (roads.length === 0) {
        alert("Masukkan minimal 1 jalan!");
        return;
      }
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
    "w-full border border-slate-200 bg-slate-50 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs sm:text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition placeholder:text-slate-400 text-black";

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — bottom sheet on mobile, centered on desktop */}
      <div className="relative bg-white w-full sm:max-w-2xl rounded-t-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92dvh] sm:max-h-[90vh] flex flex-col">
        {/* Drag handle (mobile only) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-4 sm:pb-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-700">
              Tambah Jalur Baru
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-1 sm:gap-2">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                <div className="flex items-center gap-1 sm:gap-2">
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${
                      i < step
                        ? "bg-green-500 text-white"
                        : i === step
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {i < step ? <CheckCircle2 size={12} /> : i + 1}
                  </div>
                  <span
                    className={`text-xs font-semibold hidden sm:block truncate ${
                      i === step ? "text-blue-600" : "text-slate-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-1 sm:mx-2 ${
                      i < step ? "bg-green-300" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 overflow-y-auto flex-1">
          {step === 0 && (
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5 sm:mb-2">
                    Kode Jalur <span className="text-red-400">*</span>
                  </label>
                  <input
                    className={inputCls}
                    placeholder="Contoh: AG"
                    value={form.code}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5 sm:mb-2">
                    Nama Trayek <span className="text-red-400">*</span>
                  </label>
                  <input
                    className={inputCls}
                    placeholder="Arjosari – Gadang"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5 sm:mb-2">
                  Terminal Awal <span className="text-red-400">*</span>
                </label>
                <input
                  className={inputCls}
                  placeholder="Contoh: Terminal Arjosari"
                  value={form.from}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, from: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5 sm:mb-2">
                  Terminal Akhir <span className="text-red-400">*</span>
                </label>
                <input
                  className={inputCls}
                  placeholder="Contoh: Terminal Gadang"
                  value={form.to}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, to: e.target.value }))
                  }
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <p className="text-xs sm:text-sm text-slate-500 mb-3 sm:mb-4 leading-relaxed">
                Masukkan nama jalan yang dilewati — pisahkan dengan{" "}
                <span className="font-semibold text-slate-700">enter</span>,{" "}
                <span className="font-semibold text-slate-700">koma</span>, atau{" "}
                <span className="font-semibold text-slate-700">dash</span>.
              </p>
              <textarea
                className={`${inputCls} resize-none font-mono text-xs`}
                rows={6}
                placeholder={`Jl. Simpang R. Panji Suroso\nJl. Raden Intan\nJl. Jend A. Yani\nJl. Letjen S. Parman`}
                value={form.roadsRaw}
                onChange={(e) =>
                  setForm((f) => ({ ...f, roadsRaw: e.target.value }))
                }
              />
              <p className="text-xs text-slate-400 mt-2 sm:mt-2.5 text-right">
                {parseRoads(form.roadsRaw).length} jalan terdeteksi
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 sm:space-y-5">
              <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="bg-blue-600 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm">
                    {form.code}
                  </div>
                  <span className="font-semibold text-slate-800 text-sm sm:text-base line-clamp-1">
                    {form.name}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500">
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <span className="line-clamp-1">{form.from}</span>
                  <ArrowRight
                    size={13}
                    className="text-slate-300 flex-shrink-0"
                  />
                  <div className="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0" />
                  <span className="line-clamp-1">{form.to}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2.5 sm:mb-3">
                  {form.roads.length} Jalan Dilalui
                </p>
                <div className="space-y-1.5 sm:space-y-2 max-h-40 sm:max-h-48 overflow-y-auto">
                  {form.roads.map((road, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 sm:gap-3 bg-white border border-slate-100 rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2.5"
                    >
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-xs sm:text-sm text-slate-700 font-medium line-clamp-1">
                        {road}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between gap-2 flex-shrink-0">
          <button
            onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}
            className="px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl lg:rounded-2xl border border-slate-200 hover:bg-slate-50 transition text-xs sm:text-sm font-semibold text-slate-600"
          >
            {step === 0 ? "Batal" : "← Kembali"}
          </button>

          {step < 2 ? (
            <button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl lg:rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-200"
            >
              Lanjut →
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl lg:rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-200"
            >
              <Save size={15} />
              <span className="hidden sm:inline">Simpan Jalur</span>
              <span className="sm:hidden">Simpan</span>
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      {/* ═══ MOBILE SIDEBAR ═══ */}
      <MobileSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* ═══════════ NAVBAR ═══════════ */}
      <nav className="sticky top-0 z-30 h-[85px] border-b border-white/30 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto h-full px-4 md:px-6 flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition"
            >
              <Navigation size={22} />
            </button>

            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-3 rounded-2xl shadow-lg shadow-blue-200">
              <Bus size={22} />
            </div>

            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                AngkotTrack
              </h1>

              <p className="text-xs md:text-sm text-slate-500">
                Admin Dashboard
              </p>
            </div>
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="/admin" className="text-black hover:text-blue-600 transition">
              Dashboard
            </a>

            <a href="/admin/rute" className="text-black text-blue-600 font-semibold">
              Manajemen Rute
            </a>

            <a href="/admin/driver" className="text-black hover:text-blue-600 transition">
              Manajemen Driver
            </a>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            {/* Search — desktop only */}
            <div className="hidden lg:flex items-center gap-3 bg-slate-100 px-4 py-2.5 rounded-lg">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="Cari rute..."
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>

            {/* Notification */}
            <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition flex-shrink-0">
              <Bell size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════════ CONTENT ═══════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
          <div className="flex-1">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
              Manajemen Trayek
            </h2>
            <p className="text-slate-500 mt-2 sm:mt-2.5 text-xs sm:text-sm lg:text-base leading-relaxed">
              Kelola jalur, terminal, dan jalan yang dilalui angkot
            </p>
          </div>

          {/* Stat pills — responsive layout */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl shadow-sm text-xs sm:text-sm flex-shrink-0">
              <Route size={14} className="text-slate-400" />
              <span className="font-bold text-slate-700">{routes.length}</span>
              <span className="text-slate-400 hidden xs:inline">total jalur</span>
            </div>
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="font-bold text-green-700">
                {activeCount} Aktif
              </span>
            </div>
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="font-bold text-amber-700">
                {draftCount} Draft
              </span>
            </div>
          </div>
        </div>

        {/* How it works — responsive grid */}
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-3 sm:p-5 mb-6 sm:mb-8 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {[
              {
                num: "01",
                icon: Route,
                color: "text-blue-600 bg-blue-50",
                label: "Buat Kode Jalur",
                desc: "Tentukan kode & nama trayek",
              },
              {
                num: "02",
                icon: MapPinned,
                color: "text-amber-600 bg-amber-50",
                label: "Tambahkan Jalan",
                desc: "Input jalan yang dilewati",
              },
              {
                num: "03",
                icon: Navigation,
                color: "text-green-600 bg-green-50",
                label: "Publish Trayek",
                desc: "Langsung tersedia untuk driver",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 lg:px-5 py-3.5 sm:py-4"
              >
                <div
                  className={`w-9 sm:w-10 h-9 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 ${s.color}`}
                >
                  <s.icon size={16} />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                    {s.num}
                  </div>
                  <div className="font-semibold text-slate-800 text-xs sm:text-sm leading-snug">
                    {s.label}
                  </div>
                  <div className="text-xs text-slate-400 leading-tight">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl mb-4 lg:hidden shadow-sm">
          <Search size={16} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Cari rute..."
            className="bg-transparent outline-none w-full text-xs sm:text-sm text-slate-700 placeholder:text-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="flex-shrink-0">
              <X size={14} className="text-slate-400" />
            </button>
          )}
        </div>

        {/* Filter bar + Tambah Jalur button */}
        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
          {/* Filter pills — responsive */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 flex-wrap sm:flex-nowrap">
            {(["Semua", "Aktif", "Draft"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition flex-shrink-0 ${
                  filter === f
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl lg:rounded-2xl font-semibold shadow-lg shadow-blue-200 transition text-xs sm:text-sm"
            >
              <Plus size={15} />
              <span className="hidden xs:inline">Tambah</span>
              <span className="xs:hidden">+</span>
            </button>
            {/* View toggle */}
            <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg sm:rounded-xl p-1">
              <button
                onClick={() => setView("grid")}
                className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition ${view === "grid" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-700"}`}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition ${view === "list" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-700"}`}
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Route grid / list */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 text-center">
            <div className="w-12 sm:w-14 h-12 sm:h-14 bg-slate-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Search size={20} className="text-slate-400" />
            </div>
            <p className="font-semibold text-slate-700 text-sm sm:text-base">
              Tidak ada jalur ditemukan
            </p>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5 sm:mt-2">
              Coba ubah kata kunci atau filter
            </p>
          </div>
        ) : (
          <div
            className={
              view === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5"
                : "flex flex-col gap-2.5 sm:gap-3 lg:gap-4"
            }
          >
            {filtered.map((route) => (
              <RouteCard key={route.id} route={route} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {/* Bottom safe area for mobile */}
        <div className="h-4 sm:h-6 lg:h-0" />
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
