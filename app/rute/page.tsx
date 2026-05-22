'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoLocationSharp, IoSearch } from 'react-icons/io5';
import { MdArrowForward, MdDirectionsCar, MdPersonOutline, MdSchedule, MdLocationOn, MdCheckCircle, MdError, MdFlashOn } from 'react-icons/md';
import { Poppins } from 'next/font/google';
import { FaMap, FaTimes, FaExchangeAlt, FaBus, FaMapMarkerAlt, FaSmile } from 'react-icons/fa';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

type Phase = 'idle' | 'searching' | 'results' | 'booking' | 'tracking';
type Tab   = 'tercepat' | 'semua';

interface DirectAngkot {
  type: 'direct';
  id: string; name: string; color: string;
  eta: number; distance: number; price: number;
  capacity: number; maxCapacity: number;
  pos: [number, number]; plate: string; driver: string;
}
interface TransitAngkot {
  type: 'transit';
  id: string; name: string; color: string;
  eta: number; distance: number; price: number;
  legs: [string, string];
}
type Angkot = DirectAngkot | TransitAngkot;

interface CityData {
  center:  [number, number];
  userPos: [number, number];
  destPos: [number, number];
  angkots: Angkot[];
}

const MALANG: CityData = {
  center:  [-7.983, 112.622],
  userPos: [-7.983908, 112.621391],
  destPos: [-7.960,    112.648],
  angkots: [
    {
      type: 'direct', id: 'AL', name: 'Arjosari – Landungsari',
      color: '#3b82f6', eta: 4, distance: 850, price: 5000,
      capacity: 5, maxCapacity: 12,
      pos: [-7.986, 112.618], plate: 'N 1111 AL', driver: 'Pak Budi',
    },
    {
      type: 'direct', id: 'GA', name: 'Gadang – Arjosari',
      color: '#06b6d4', eta: 6, distance: 1400, price: 5000,
      capacity: 12, maxCapacity: 12,
      pos: [-7.980, 112.628], plate: 'N 3333 GA', driver: 'Pak Rudi',
    },
    {
      type: 'direct', id: 'ADL', name: 'Arjosari – Dinoyo – Landungsari',
      color: '#f97316', eta: 9, distance: 2100, price: 5000,
      capacity: 2, maxCapacity: 12,
      pos: [-7.989, 112.614], plate: 'N 2222 AD', driver: 'Pak Slamet',
    },
    {
      type: 'transit', id: 'TRANSIT', name: 'Gadang – Landungsari via Dinoyo',
      color: '#a855f7', eta: 15, distance: 3200, price: 10000,
      legs: ['GA', 'ADL'],
    },
  ],
};

const fmtEta  = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
const fmtRp   = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

const generateCurvedRoute = (from: [number, number], to: [number, number]): [number, number][] => {
  const points: [number, number][] = [from];
  const latDiff = to[0] - from[0];
  const lngDiff = to[1] - from[1];
  const segments = 8;
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const lat = from[0] + latDiff * t;
    const lng = from[1] + lngDiff * t;
    const offsetAmount = Math.sin(t * Math.PI) * 0.004;
    const angle = Math.atan2(latDiff, lngDiff);
    const perpLat = lat + Math.cos(angle) * offsetAmount;
    const perpLng = lng - Math.sin(angle) * offsetAmount;
    points.push([perpLat, perpLng]);
  }
  points.push(to);
  return points;
};

const getPositionOnRoute = (from: [number, number], to: [number, number], progress: number): [number, number] => {
  const waypoints = generateCurvedRoute(from, to);
  const index = (progress / 100) * (waypoints.length - 1);
  const currentIndex = Math.floor(index);
  const nextIndex = Math.ceil(index);
  const t = index - currentIndex;
  if (nextIndex >= waypoints.length) return waypoints[waypoints.length - 1];
  const current = waypoints[currentIndex];
  const next = waypoints[nextIndex];
  return [
    current[0] + (next[0] - current[0]) * t,
    current[1] + (next[1] - current[1]) * t,
  ];
};

function svgAngkot(a: DirectAngkot): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="70" height="52" viewBox="0 0 70 52">
    <defs>
      <filter id="shadowAngkot" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.25)"/>
      </filter>
    </defs>
    <g filter="url(#shadowAngkot)">
      <rect x="5" y="0" width="60" height="28" rx="10" fill="white" stroke="${a.color}" stroke-width="2.5"/>
      <text x="35" y="15" text-anchor="middle" dominant-baseline="middle"
        font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="900" fill="${a.color}">${a.id}</text>
      <line x1="35" y1="28" x2="35" y2="40" stroke="${a.color}" stroke-width="3"/>
      <circle cx="35" cy="44" r="6" fill="${a.color}" stroke="white" stroke-width="2.5"/>
    </g>
  </svg>`;
}
function svgUser(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <defs>
      <filter id="shadowUser" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(0,229,255,0.6)"/>
      </filter>
    </defs>
    <circle cx="24" cy="24" r="20" fill="rgba(0,229,255,0.15)"/>
    <circle cx="24" cy="24" r="12" fill="rgba(0,229,255,0.3)"/>
    <circle cx="24" cy="24" r="8"  fill="#00e5ff" stroke="white" stroke-width="3" filter="url(#shadowUser)"/>
  </svg>`;
}
function svgDest(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
    <defs>
      <filter id="shadowDest" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(168,85,247,0.5)"/>
      </filter>
    </defs>
    <circle cx="18" cy="18" r="14" fill="#a855f7" stroke="white" stroke-width="3" filter="url(#shadowDest)"/>
    <circle cx="18" cy="18" r="6"  fill="white"/>
  </svg>`;
}

/* ─── SEARCH SKELETON ─── */
function SearchSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-4 md:px-0 py-4 animate-pulse">
      <div className="flex items-center justify-between mb-1">
        <div className="h-4 w-32 bg-slate-100 rounded-full" />
        <div className="h-7 w-20 bg-slate-100 rounded-xl" />
      </div>
      <div className="flex gap-2 mb-1">
        <div className="h-8 w-24 bg-blue-100 rounded-xl" />
        <div className="h-8 w-24 bg-slate-100 rounded-xl" />
      </div>
      {[0, 1, 2].map(i => (
        <div key={i} className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden"
          style={{ opacity: 1 - i * 0.2 }}>
          <div className="h-1 bg-gradient-to-r from-slate-100 to-slate-200 w-full" />
          <div className="p-4 flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100" />
              <div className="flex-1 flex flex-col gap-2 justify-center">
                <div className="h-3.5 bg-slate-100 rounded-full w-3/4" />
                <div className="flex gap-2">
                  <div className="h-5 bg-slate-50 rounded-lg w-20 border border-slate-100" />
                  <div className="h-5 bg-slate-50 rounded-lg w-16 border border-slate-100" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-0 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
              {[0,1,2].map(j => (
                <div key={j} className={`flex flex-col items-center py-2.5 gap-1.5 ${j < 2 ? 'border-r border-slate-200' : ''}`}>
                  <div className="h-2 w-10 bg-slate-200 rounded-full" />
                  <div className="h-3 w-14 bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
            <div className="h-9 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── BOOKING FLASH OVERLAY ─── */
function BookingFlash({ angkot, onDone }: { angkot: DirectAngkot; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1600);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/97 backdrop-blur-sm rounded-t-[28px] md:rounded-none">
      <style>{`
        @keyframes bookRipple {
          0%   { transform: scale(0.3); opacity: 0.7; }
          100% { transform: scale(3.5); opacity: 0; }
        }
        @keyframes bookIcon {
          0%   { transform: scale(0.5) rotate(-15deg); opacity: 0; }
          50%  { transform: scale(1.2) rotate(5deg); opacity: 1; }
          75%  { transform: scale(0.95) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes bookText {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes bookDots {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
          40%            { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
      <div className="relative flex items-center justify-center mb-5">
        <span className="absolute w-20 h-20 rounded-full bg-blue-100"
          style={{ animation: 'bookRipple 0.9s ease-out forwards' }} />
        <span className="absolute w-20 h-20 rounded-full bg-cyan-100"
          style={{ animation: 'bookRipple 0.9s 0.18s ease-out forwards' }} />
        <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-blue-200"
          style={{ animation: 'bookIcon 0.6s cubic-bezier(.36,.07,.19,.97) both' }}>
          <MdCheckCircle size={32} className="text-white" />
        </div>
      </div>
      <div style={{ animation: 'bookText 0.4s 0.3s ease both', opacity: 0 }}>
        <p className="text-base font-black text-slate-800 text-center mb-1">Pesanan Dikonfirmasi!</p>
        <p className="text-xs text-slate-500 text-center">
          Angkot <span className="font-bold" style={{ color: angkot.color }}>{angkot.id}</span> sedang meluncur ke lokasimu
        </p>
      </div>
      <div className="flex gap-1.5 mt-4" style={{ animation: 'bookText 0.4s 0.5s ease both', opacity: 0 }}>
        {[0, 1, 2].map(i => (
          <span key={i} className="w-2 h-2 rounded-full bg-blue-400"
            style={{ animation: `bookDots 1.2s ${i * 0.2}s ease-in-out infinite` }} />
        ))}
      </div>
    </div>
  );
}

/* ─── ARRIVED OVERLAY ─── */
function ArrivedOverlay({ angkot, onFeedback, onClose }: {
  angkot: DirectAngkot;
  onFeedback: () => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/97 backdrop-blur-sm rounded-t-[28px] md:rounded-none px-6">
      <style>{`
        @keyframes arriveScale {
          0%   { transform: scale(0.4) rotate(-20deg); opacity: 0; }
          60%  { transform: scale(1.18) rotate(4deg); opacity: 1; }
          80%  { transform: scale(0.96); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes arriveFadeUp {
          0%   { opacity: 0; transform: translateY(18px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes confettiDrop {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(60px) rotate(360deg); opacity: 0; }
        }
        @keyframes arrivePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.3); }
          50%       { box-shadow: 0 0 0 14px rgba(59,130,246,0); }
        }
      `}</style>
      <div className="absolute top-8 left-0 right-0 flex justify-center gap-3 pointer-events-none">
        {['#3b82f6','#06b6d4','#f97316','#a855f7','#10b981'].map((c, i) => (
          <span key={i} className="w-2.5 h-2.5 rounded-full block"
            style={{ background: c, animation: `confettiDrop 1.2s ${i * 0.12}s ease-in both` }} />
        ))}
      </div>
      <div className="relative mb-5">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-300"
          style={{ animation: 'arriveScale 0.7s cubic-bezier(.36,.07,.19,.97) both, arrivePulse 2s 0.8s ease-in-out infinite' }}>
          <FaBus size={34} className="text-white" />
        </div>
      </div>
      <div className="text-center mb-6" style={{ animation: 'arriveFadeUp 0.5s 0.35s ease both', opacity: 0 }}>
        <p className="text-xl font-black text-slate-900 mb-1.5">Angkot Sudah Tiba! 🎉</p>
        <p className="text-sm text-slate-500 leading-relaxed">
          Angkot <span className="font-bold" style={{ color: angkot.color }}>{angkot.id}</span> ({angkot.plate})<br />
          sudah menunggumu. Silakan naik!
        </p>
      </div>
      <div className="w-full flex flex-col gap-3" style={{ animation: 'arriveFadeUp 0.5s 0.5s ease both', opacity: 0 }}>
        <button
          onClick={onFeedback}
          className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-blue-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] transition-all duration-200 relative overflow-hidden group"
        >
          <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl" />
          <FaSmile size={16} className="relative" />
          <span className="relative">Isi Feedback Yuk!</span>
        </button>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl font-semibold text-sm text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all duration-200"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

function SeatBar({ filled, total }: { filled: number; total: number }) {
  const left = total - filled;
  const isFull = left <= 0;
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isFull ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
          isFull
            ? 'bg-rose-50 text-rose-600 border-rose-200'
            : 'bg-emerald-50 text-emerald-600 border-emerald-200'
        }`}>
          {isFull ? 'Kapasitas Penuh' : `${left} Kursi Tersedia`}
        </span>
      </div>
    </div>
  );
}

function DirectCard({ a, onBook, visible }: { a: DirectAngkot; onBook: (a: DirectAngkot) => void; visible?: boolean }) {
  const left = a.maxCapacity - a.capacity;
  return (
    <div
      className="rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-500 overflow-hidden cursor-default"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
      }}
    >
      <div className="h-1 w-full" style={{ background: `linear-gradient(to right, ${a.color}, ${a.color}99)` }} />
      <div className="p-4">
        <div className="flex gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-base shadow-sm border-2"
            style={{ background: `${a.color}15`, borderColor: `${a.color}40`, color: a.color }}>
            {a.id}
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="text-sm font-bold text-slate-900 truncate mb-1">{a.name}</div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100 text-xs text-slate-500 font-medium">
                <MdDirectionsCar size={12} className="text-slate-400" /> {a.plate}
              </span>
              <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100 text-xs text-slate-500 font-medium">
                <MdPersonOutline size={12} className="text-slate-400" /> {a.driver}
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-0 mb-3 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
          <div className="flex flex-col items-center justify-center text-center py-2.5 px-2 border-r border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Tarif</span>
            <span className="text-xs font-black text-blue-600">{fmtRp(a.price)}</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center py-2.5 px-2 border-r border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">ETA</span>
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <MdSchedule size={12} className="text-blue-400" /> {a.eta} mnt
            </span>
          </div>
          <div className="flex flex-col items-center justify-center text-center py-2.5 px-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Jarak</span>
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <MdLocationOn size={12} className="text-rose-400" /> {a.distance}m
            </span>
          </div>
        </div>
        <SeatBar filled={a.capacity} total={a.maxCapacity} />
        <button
          className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-100 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:enabled:-translate-y-0.5 hover:enabled:shadow-lg active:enabled:scale-95"
          disabled={left === 0}
          onClick={() => onBook(a)}
        >
          {left > 0 ? <><MdCheckCircle size={16} /> Pesan Angkot</> : <><MdError size={16} /> Penuh</>}
        </button>
      </div>
    </div>
  );
}

function TransitCard({ a, visible }: { a: TransitAngkot; visible?: boolean }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-500 overflow-hidden"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)' }}>
      <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-purple-400" />
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-50 border-2 border-violet-100 text-violet-600 shrink-0 shadow-sm">
            <FaExchangeAlt size={16} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-0.5">Rute Transit</div>
            <div className="text-sm font-bold text-slate-900">Perlu 1x Ganti Angkot</div>
          </div>
        </div>
        <div className="flex flex-col gap-2 p-3 bg-violet-50/60 rounded-xl border border-violet-100 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 text-center py-1 rounded-lg bg-blue-100 text-blue-700 font-black text-xs">{a.legs[0]}</span>
            <span className="text-xs font-medium text-slate-600">Naik angkot pertama</span>
          </div>
          <div className="ml-4 border-l-2 border-dashed border-violet-200 h-3" />
          <div className="flex items-center gap-2.5">
            <span className="w-9 text-center py-1 rounded-lg bg-violet-200 text-violet-700 font-black text-xs">{a.legs[1]}</span>
            <span className="text-xs font-medium text-slate-600">Lanjut transit ke tujuan</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-0 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
          <div className="flex flex-col items-center justify-center text-center py-2.5 px-2 border-r border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Total Tarif</span>
            <span className="text-xs font-black text-violet-600">{fmtRp(a.price)}</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center py-2.5 px-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Total ETA</span>
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <MdSchedule size={12} className="text-violet-400" /> {a.eta} mnt
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── CONSTANTS ─── */
const SHEET_MIN_VH = 15;
const SHEET_MAX_VH = 80;

const PHASE_DEFAULTS: Record<Phase, number> = {
  idle:      28,
  searching: 62,
  results:   72,
  booking:   46,
  tracking:  56,
};

export default function AngkotGoPage() {
  const router = useRouter();
  const mapDivRef     = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<L.Map | null>(null);
  const userMkRef     = useRef<L.Marker | null>(null);
  const destMkRef     = useRef<L.Marker | null>(null);
  const routeRef      = useRef<L.Polyline | null>(null);
  const angkotMkRef   = useRef<Map<string, L.Marker>>(new Map());
  const animRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const etaTimerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const etaMaxRef     = useRef(0);
  const bookedRef     = useRef<DirectAngkot | null>(null);

  const [phase, setPhase]           = useState<Phase>('idle');
  const [query, setQuery]           = useState('');
  const [tab, setTab]               = useState<Tab>('tercepat');
  const [angkots, setAngkots]       = useState<Angkot[]>([]);
  const [visibleCards, setVisibleCards] = useState<boolean[]>([]);
  const [booked, setBooked]         = useState<DirectAngkot | null>(null);
  const [eta, setEta]               = useState(0);
  const [arrived, setArrived]       = useState(false);
  const [notif, setNotif]           = useState<{ title: string; sub: string } | null>(null);
  const [notifVis, setNotifVis]     = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);

  // Sheet height state (vh units, mobile only)
  const [sheetHeight, setSheetHeight] = useState(PHASE_DEFAULTS['idle']);
  // Track whether we're mid-drag (to suppress transition)
  const isDraggingRef = useRef(false);
  const dragStartRef  = useRef<{ y: number; height: number } | null>(null);
  // Ref to the scrollable content area inside the sheet
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Snap sheet height on phase change (only if not currently being dragged)
  useEffect(() => {
    if (isDesktop) return;
    setSheetHeight(PHASE_DEFAULTS[phase] ?? 40);
  }, [phase, isDesktop]);

  useEffect(() => {
    if ((window as any).L) { setLeafletReady(true); return; }
    const existing = document.getElementById('leaflet-script');
    if (existing) { existing.addEventListener('load', () => setLeafletReady(true)); return; }
    const script = document.createElement('script');
    script.id = 'leaflet-script';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.js';
    script.async = true;
    script.onload = () => setLeafletReady(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!leafletReady || !mapDivRef.current || mapRef.current) return;
    const L = (window as any).L as typeof import('leaflet');
    const map = L.map(mapDivRef.current, {
      center: MALANG.center, zoom: 14,
      zoomControl: false, attributionControl: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    mapRef.current = map;
    userMkRef.current = L.marker(MALANG.userPos, {
      icon: L.divIcon({ html: svgUser(), className: '', iconSize: [48, 48], iconAnchor: [24, 24] }),
      zIndexOffset: 1000,
    }).addTo(map);
  }, [leafletReady]);

  const makeAngkotIcon = useCallback((a: DirectAngkot) => {
    const L = (window as any).L as typeof import('leaflet');
    return L.divIcon({ html: svgAngkot(a), className: '', iconSize: [70, 52], iconAnchor: [35, 52] });
  }, []);

  const makeDestIcon = useCallback(() => {
    const L = (window as any).L as typeof import('leaflet');
    return L.divIcon({ html: svgDest(), className: '', iconSize: [36, 36], iconAnchor: [18, 18] });
  }, []);

  const clearExtras = useCallback(() => {
    if (animRef.current) clearInterval(animRef.current);
    routeRef.current?.remove();  routeRef.current = null;
    destMkRef.current?.remove(); destMkRef.current = null;
    angkotMkRef.current.forEach(m => m.remove());
    angkotMkRef.current.clear();
  }, []);

  const staggerReveal = useCallback((count: number) => {
    setVisibleCards(Array(count).fill(false));
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        setVisibleCards(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 120 + i * 110);
    }
  }, []);

  const doSearch = useCallback(() => {
    const q = query.trim();
    if (!q || !mapRef.current || !leafletReady) return;
    const L = (window as any).L as typeof import('leaflet');
    const city = MALANG;
    clearExtras();
    setAngkots([]);
    setVisibleCards([]);
    setPhase('searching');

    setTimeout(() => {
      setAngkots(city.angkots);
      userMkRef.current?.setLatLng(city.userPos);
      routeRef.current = L.polyline(generateCurvedRoute(city.userPos, city.destPos), {
        color: '#2563eb', weight: 4.5, opacity: 0.85, dashArray: '10 12',
      }).addTo(mapRef.current!);
      destMkRef.current = L.marker(city.destPos, { icon: makeDestIcon() }).addTo(mapRef.current!);
      city.angkots
        .filter((a): a is DirectAngkot => a.type === 'direct')
        .forEach(a => {
          const mk = L.marker(a.pos, { icon: makeAngkotIcon(a), zIndexOffset: 500 }).addTo(mapRef.current!);
          angkotMkRef.current.set(a.id, mk);
        });
      const bounds = L.latLngBounds([city.userPos, city.destPos]);
      mapRef.current!.fitBounds(bounds, { padding: [60, 60] });
      animRef.current = setInterval(() => {
        angkotMkRef.current.forEach(mk => {
          const p = mk.getLatLng();
          mk.setLatLng([
            p.lat + (city.userPos[0] - p.lat) * 0.004 + (Math.random() - 0.5) * 0.00004,
            p.lng + (city.userPos[1] - p.lng) * 0.004 + (Math.random() - 0.5) * 0.00004,
          ]);
        });
      }, 200);
      setPhase('results');
      staggerReveal(city.angkots.length);
    }, 1400);
  }, [query, leafletReady, clearExtras, makeAngkotIcon, makeDestIcon, staggerReveal]);

  const bookAngkot = useCallback((a: DirectAngkot) => {
    bookedRef.current = a;
    setBooked(a);
    setArrived(false);
    setPhase('booking');

    setTimeout(() => {
      angkotMkRef.current.forEach((mk, id) => {
        if (id !== a.id) { mk.remove(); angkotMkRef.current.delete(id); }
      });
      destMkRef.current?.remove(); destMkRef.current = null;
      routeRef.current?.remove();  routeRef.current = null;
      if (animRef.current) clearInterval(animRef.current);
      if (mapRef.current) {
        const L = (window as any).L as typeof import('leaflet');
        routeRef.current = L.polyline(generateCurvedRoute(MALANG.userPos, MALANG.destPos), {
          color: '#2563eb', weight: 4.5, opacity: 0.85, dashArray: '10 12',
        }).addTo(mapRef.current);
        const ap = angkotMkRef.current.get(a.id)?.getLatLng();
        const up = userMkRef.current?.getLatLng();
        if (ap && up) mapRef.current.fitBounds((window as any).L.latLngBounds([up, ap]), { padding: [70, 70] });
      }
      const total = Math.round(a.eta * 60);
      etaMaxRef.current = total;
      setEta(total);
      setPhase('tracking');

      if (etaTimerRef.current) clearInterval(etaTimerRef.current);
      etaTimerRef.current = setInterval(() => {
        setEta(prev => {
          const next = prev - 1;
          if (next <= 0) {
            clearInterval(etaTimerRef.current!);
            setArrived(true);
            return 0;
          }
          if (mapRef.current && bookedRef.current && angkotMkRef.current.has(bookedRef.current.id)) {
            const currentProgress = etaMaxRef.current > 0
              ? Math.round((1 - next / etaMaxRef.current) * 100) : 0;
            const newPos = getPositionOnRoute(MALANG.userPos, MALANG.destPos, currentProgress);
            angkotMkRef.current.get(bookedRef.current.id)?.setLatLng(newPos);
          }
          if ((etaMaxRef.current - next === 2) && bookedRef.current) {
            setNotif({ title: 'Pesanan Diterima!', sub: `Angkot ${bookedRef.current.id} (${bookedRef.current.plate}) sedang meluncur 🚀` });
            setNotifVis(true);
            setTimeout(() => setNotifVis(false), 5000);
          } else if (next === 10 && bookedRef.current) {
            setNotif({ title: 'Angkot Sudah Dekat!', sub: `Pengemudi ${bookedRef.current.driver} akan tiba dalam 10 detik 📍` });
            setNotifVis(true);
            setTimeout(() => setNotifVis(false), 5000);
          }
          return next;
        });
      }, 1000);
    }, 1700);
  }, []);

  const cancelBooking = useCallback(() => {
    if (etaTimerRef.current) clearInterval(etaTimerRef.current);
    bookedRef.current = null;
    setBooked(null);
    setArrived(false);
    setNotifVis(false);
    setQuery('');
    clearExtras();
    userMkRef.current?.setLatLng(MALANG.userPos);
    mapRef.current?.setView(MALANG.center, 14);
    setPhase('idle');
  }, [clearExtras]);

  useEffect(() => () => {
    if (animRef.current)    clearInterval(animRef.current);
    if (etaTimerRef.current) clearInterval(etaTimerRef.current);
  }, []);

  // ─── DRAG HANDLER ───
  // Only fires when user touches the drag handle strip (not the scroll area).
  const handleHandleDragStart = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isDesktop) return;
    e.preventDefault();
    e.stopPropagation();

    isDraggingRef.current = true;
    dragStartRef.current = { y: e.clientY, height: sheetHeight };

    const onMove = (moveEvent: PointerEvent) => {
      if (!dragStartRef.current) return;
      const delta = moveEvent.clientY - dragStartRef.current.y;
      // Dragging UP = negative delta = larger sheet; DOWN = smaller
      const newHeight = dragStartRef.current.height - (delta / window.innerHeight) * 100;
      setSheetHeight(Math.max(SHEET_MIN_VH, Math.min(SHEET_MAX_VH, newHeight)));
    };

    const onEnd = (upEvent: PointerEvent) => {
      isDraggingRef.current = false;
      if (!dragStartRef.current) return;

      const delta = upEvent.clientY - dragStartRef.current.y;
      const velocityVh = (delta / window.innerHeight) * 100; // positive = dragged downward

      let snapHeight: number;
      if (velocityVh > 10) {
        // Fast swipe down → snap to minimum peek
        snapHeight = SHEET_MIN_VH;
      } else if (velocityVh < -10) {
        // Fast swipe up → snap to phase default
        snapHeight = PHASE_DEFAULTS[phase] ?? 55;
      } else {
        // Settle at current height (already clamped during move)
        const settled = dragStartRef.current.height - velocityVh;
        snapHeight = Math.max(SHEET_MIN_VH, Math.min(SHEET_MAX_VH, settled));
      }

      setSheetHeight(snapHeight);
      dragStartRef.current = null;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onEnd);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onEnd);
  }, [sheetHeight, isDesktop, phase]);

  const listItems = tab === 'tercepat'
    ? [...angkots].sort((a, b) => a.eta - b.eta).slice(0, 3)
    : angkots;

  const progress = etaMaxRef.current > 0 ? Math.round((1 - eta / etaMaxRef.current) * 100) : 0;
  const statusLabel = eta > 30
    ? { text: 'Berjalan',  bg: 'rgba(16,185,129,0.12)', fg: '#059669' }
    : eta > 0
    ? { text: 'Mendekat',  bg: 'rgba(249,115,22,0.12)', fg: '#ea580c' }
    : { text: 'Tiba!',     bg: 'rgba(59,130,246,0.12)', fg: '#2563eb' };

  return (
    <div className={`${poppins.className} relative w-screen h-screen overflow-hidden bg-[#F4F8FF] text-slate-900`}>
      {/* Map */}
      <div ref={mapDivRef} className="absolute inset-0 z-0" />

      {/* SEARCH BAR */}
      <div className="fixed top-4 left-4 right-4 z-30 md:left-1/2 md:right-auto md:top-5 md:w-[500px] md:-translate-x-1/2">
        <div className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50 focus-within:border-blue-400 focus-within:shadow-blue-100/60 transition-all duration-300">
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <IoLocationSharp className="text-blue-500 shrink-0" size={16} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              placeholder="Mau ke mana hari ini?"
              className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-900 placeholder-slate-400 min-w-0"
            />
          </div>
          <button
            onClick={doSearch}
            disabled={phase === 'searching'}
            className="shrink-0 px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-200 transition-all duration-300 flex items-center gap-1.5 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {phase === 'searching' ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Mencari
              </span>
            ) : (
              <><IoSearch size={15} /> Cari</>
            )}
          </button>
        </div>
      </div>

      {/* ─── BOTTOM SHEET (mobile) / SIDEBAR (desktop) ─── */}
      <div
        className={[
          'fixed z-20 bg-white/95 backdrop-blur-2xl shadow-2xl overflow-hidden',
          // Mobile: bottom sheet
          'bottom-0 left-0 right-0 rounded-t-[28px] border-t border-slate-200/60',
          // Desktop: sidebar
          'md:top-0 md:bottom-0 md:right-0 md:left-auto md:w-[400px] md:rounded-none md:border-t-0 md:border-l md:border-l-slate-100 md:shadow-xl',
        ].join(' ')}
        style={isDesktop
          ? { height: '100vh' }
          : {
              height: `${sheetHeight}vh`,
              // Animate only when not dragging
              transition: isDraggingRef.current ? 'none' : 'height 0.38s cubic-bezier(0.32, 0.72, 0, 1)',
            }
        }
      >
        {/* ── Drag Handle (mobile only) ── */}
        {/* 
          This strip is the ONLY area that triggers sheet resize.
          It uses `touch-none` to suppress browser scroll + pointer capture for clean drag.
          The content area below uses `overflow-y-auto` and is left alone.
        */}
        <div
          className="md:hidden h-7 flex-shrink-0 flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none"
          onPointerDown={handleHandleDragStart}
          style={{ touchAction: 'none' }}
        >
          <div className="w-10 h-1.5 bg-slate-300 rounded-full" />
        </div>

        <div className="hidden md:block pt-6 flex-shrink-0" />

        {/* ── Scrollable content — completely independent of drag handle ── */}
        <div
          ref={scrollAreaRef}
          className="overflow-y-auto overflow-x-hidden md:px-5 md:pb-8"
          style={{
            // Fill whatever height remains after the drag handle (28px) on mobile
            // On desktop just fill the rest
            height: isDesktop ? 'calc(100vh - 24px)' : 'calc(100% - 28px)',
            // Allow native scroll inside; pointer events on this area are unrelated to drag
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
          }}
        >

          {/* ── IDLE ── */}
          {phase === 'idle' && (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-4 min-h-[180px]">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 flex items-center justify-center shadow-sm">
                <FaMap className="text-blue-500" size={24} />
              </div>
              <div>
                <p className="text-slate-700 font-semibold mb-1">Lokasi kamu terdeteksi ✦</p>
                <p className="text-sm text-slate-400">Ketik <strong className="text-slate-600">tujuan</strong> di kotak pencarian untuk menemukan angkot terdekat</p>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-2 rounded-xl text-xs text-blue-700 font-medium">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                Kota Malang, Jawa Timur
              </div>
            </div>
          )}

          {/* ── SEARCHING ── */}
          {phase === 'searching' && (
            <div className="flex flex-col">
              <div className="flex items-center justify-between px-4 md:px-0 py-3 md:py-4 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-sm font-bold text-slate-400">Mencari angkot…</span>
                </div>
              </div>
              <div className="px-4 md:px-0">
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                    style={{ animation: 'searchBar 1.4s ease-in-out forwards', width: '0%' }} />
                </div>
                <style>{`
                  @keyframes searchBar {
                    0%   { width: 0%; }
                    60%  { width: 75%; }
                    90%  { width: 90%; }
                    100% { width: 100%; }
                  }
                `}</style>
                <SearchSkeleton />
              </div>
            </div>
          )}

          {/* ── RESULTS ── */}
          {phase === 'results' && (
            <div className="flex flex-col">
              <div className="flex items-center justify-between px-4 md:px-0 py-3 md:py-4 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-md shadow-blue-200" />
                  <span className="text-sm font-bold text-slate-700">{listItems.length} Rute Tersedia</span>
                </div>
                <button onClick={cancelBooking}
                  className="text-xs font-semibold text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl px-3 py-1.5 transition-all duration-200">
                  ← Kembali
                </button>
              </div>
              <div className="flex gap-2 px-4 md:px-0 pb-3 shrink-0">
                {(['tercepat', 'semua'] as Tab[]).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border flex items-center gap-1.5 ${
                      tab === t
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
                    }`}>
                    {t === 'tercepat' ? <><MdFlashOn size={13} /> Tercepat</> : 'Semua Rute'}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-3 px-4 md:px-0 pb-6">
                {listItems.map((a, i) =>
                  a.type === 'direct'
                    ? <DirectCard key={i} a={a} onBook={bookAngkot} visible={visibleCards[i]} />
                    : <TransitCard key={i} a={a} visible={visibleCards[i]} />
                )}
              </div>
            </div>
          )}

          {/* ── BOOKING FLASH ── */}
          {phase === 'booking' && booked && (
            <BookingFlash angkot={booked} onDone={() => {}} />
          )}

          {/* ── TRACKING ── */}
          {phase === 'tracking' && booked && (
            <div className="flex flex-col relative">
              {arrived && (
                <ArrivedOverlay
                  angkot={booked}
                  onFeedback={() => router.push('/feedback')}
                  onClose={cancelBooking}
                />
              )}

              <div className="flex items-center justify-between px-4 md:px-0 py-4 md:py-5 shrink-0 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-xl z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-base border-2 shadow-sm"
                    style={{ background: `${booked.color}15`, borderColor: `${booked.color}40`, color: booked.color }}>
                    {booked.id}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 leading-tight mb-1">{booked.name}</div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100 text-xs text-slate-500 font-medium">
                        <MdDirectionsCar size={11} className="text-slate-400" /> {booked.plate}
                      </span>
                      <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100 text-xs text-slate-500 font-medium">
                        <MdPersonOutline size={11} className="text-slate-400" /> {booked.driver}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={cancelBooking}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all duration-200">
                  <FaTimes size={13} />
                </button>
              </div>

              <div className="px-4 md:px-0 py-4 flex flex-col gap-4">
                <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-5 text-white shadow-lg shadow-blue-200/50 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full" />
                    <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white rounded-full" />
                  </div>
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-xs font-semibold uppercase tracking-widest mb-1">Sisa Waktu</p>
                      <span className="text-4xl font-black font-mono tracking-tight">{fmtEta(eta)}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-100 text-xs font-semibold uppercase tracking-widest mb-1">Status</p>
                      <span className="text-xs font-bold px-3 py-1.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                        {statusLabel.text}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                  <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2.5">
                    <span className="uppercase tracking-widest text-[10px] text-slate-400">Progres Perjalanan</span>
                    <span className="text-blue-600 font-bold">{progress}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000 relative"
                      style={{ width: `${progress}%` }}>
                      <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                    </div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-cyan-400" /> Lokasi Kamu
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      Tujuan <div className="w-2 h-2 rounded-full bg-violet-400" />
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  {[
                    { icon: <MdLocationOn size={14} className="text-slate-400" />, label: 'Jarak Tempuh', value: `${booked.distance} m` },
                    { icon: <MdPersonOutline size={14} className="text-slate-400" />, label: 'Nama Pengemudi', value: booked.driver },
                    { icon: <MdDirectionsCar size={14} className="text-slate-400" />, label: 'Nomor Pelat', value: booked.plate, mono: true },
                    { icon: <MdSchedule size={14} className="text-slate-400" />, label: 'Total Tarif', value: fmtRp(booked.price), accent: true },
                  ].map((item, i, arr) => (
                    <div key={i}
                      className={`flex items-center justify-between px-4 py-3.5 hover:bg-slate-50/80 transition-colors ${i < arr.length - 1 ? 'border-b border-slate-100' : ''}`}>
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                        {item.icon} {item.label}
                      </span>
                      <span className={`font-bold text-xs ${item.accent ? 'text-blue-600' : 'text-slate-800'} ${item.mono ? 'bg-slate-100 px-2 py-0.5 rounded-lg font-mono' : ''}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>{/* end scrollable area */}
      </div>{/* end sheet */}

      {/* NOTIFICATION TOAST */}
      {notif && (
        <div className={`fixed top-20 left-4 right-4 md:left-1/2 md:right-auto md:w-[420px] md:-translate-x-1/2 z-50 transition-all duration-500 ${
          notifVis ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
        }`}>
          <div className="bg-white/95 backdrop-blur-2xl border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/60 p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-blue-100 to-cyan-50 border border-blue-200/50 shadow-sm">
              <FaBus size={18} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-md">Live Update</span>
                <button onClick={() => setNotifVis(false)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                  <FaTimes size={11} />
                </button>
              </div>
              <div className="text-sm font-bold text-slate-900 mb-0.5 leading-tight">{notif.title}</div>
              <div className="text-xs font-medium text-slate-500 leading-snug">{notif.sub}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}