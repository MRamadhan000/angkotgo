'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { IoLocationSharp, IoSearch } from 'react-icons/io5';
import { MdArrowForward, MdDirectionsCar, MdPersonOutline, MdSchedule, MdLocationOn, MdCheckCircle, MdError, MdFlashOn } from 'react-icons/md';
import { FaMap, FaTimes, FaExchangeAlt, FaBus } from 'react-icons/fa';

type Phase = 'idle' | 'results' | 'tracking';
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
      color: '#3b82f6', eta: 3, distance: 850, price: 5000,
      capacity: 5, maxCapacity: 12,
      pos: [-7.986, 112.618], plate: 'N 1111 AL', driver: 'Pak Budi',
    },
    {
      type: 'direct', id: 'GA', name: 'Gadang – Arjosari',
      color: '#22d36b', eta: 6, distance: 1400, price: 5000,
      capacity: 10, maxCapacity: 12,
      pos: [-7.980, 112.628], plate: 'N 3333 GA', driver: 'Pak Rudi',
    },
    {
      type: 'direct', id: 'ADL', name: 'Arjosari – Dinoyo – Landungsari',
      color: '#ff7a2f', eta: 9, distance: 2100, price: 5000,
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
const fmtTime = (s: number) => {
  const d = new Date();
  d.setSeconds(d.getSeconds() + s);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

// Generate curved route waypoints following terrain
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

function SeatBar({
  filled,
  total,
}: {
  filled: number;
  total: number;
}) {
  const left = total - filled;
  const isFull = left <= 0;

  return (
    <div className="mb-3">
      <div className="flex items-center gap-2">
        
        {/* Status Dot */}
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            isFull
              ? "bg-rose-500 animate-pulse"
              : "bg-emerald-500"
          }`}
        />

        {/* Label */}
        <span
          className={`text-[10px] md:text-sm font-medium px-2 py-1 rounded-full border ${
            isFull
              ? "bg-rose-50 text-rose-600 border-rose-200"
              : "bg-emerald-50 text-emerald-600 border-emerald-200"
          }`}
        >
          {isFull
            ? "Kapasitas Penuh"
            : `Kursi Tersedia`}
        </span>

      </div>
    </div>
  );
}

function DirectCard({ a, onBook }: { a: DirectAngkot; onBook: (a: DirectAngkot) => void }) {
  const left = a.maxCapacity - a.capacity;
  return (
    <div className="rounded-2xl p-3 md:p-5 bg-linear-to-br from-white to-blue-50 border border-gray-200 transition-all duration-300 cursor-default shadow-sm md:shadow-md hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent pointer-events-none" />
      <div className="flex gap-2.5 mb-2 md:gap-4 md:mb-4 items-start justify-between">
        <div className="flex gap-2.5 md:gap-4 flex-1 min-w-0">
          <div 
            className="w-12 md:w-16 h-12 md:h-16 rounded-3 flex items-center justify-center shrink-0 shadow-sm md:shadow-md font-black text-sm md:text-xl relative z-10"
            style={{ background: `${a.color}18`, border: `1px solid ${a.color}44`, color: a.color }}
          >
            {a.id}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs md:text-base font-black text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis mb-0.5 md:mb-1">
              {a.name}
              {left === 0 && <span className="inline-block text-[9px] md:text-xs font-bold px-1.5 py-0.5 rounded ml-1.5 align-middle" style={{ background: '#fee2e2', color: '#991b1b' }}>PENUH</span>}
              {left >= 8 && <span className="inline-block text-[9px] md:text-xs font-bold px-1.5 py-0.5 rounded ml-1.5 align-middle" style={{ background: '#dbeafe', color: '#1e40af' }}>TERSEDIA</span>}
            </div>
            <div className="flex gap-2 items-center flex-wrap text-[10px] md:text-sm text-gray-500 mt-1 md:mt-2">
              <span className="flex items-center gap-1">
                <MdDirectionsCar size={12} className="md:w-5 md:h-5" /> {a.plate}
              </span>
              <span className="flex items-center gap-1">
                <MdPersonOutline size={12} className="md:w-5 md:h-5" /> {a.driver}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <div className="text-sm md:text-lg font-black text-blue-500">{fmtRp(a.price)}</div>
          <div className="flex items-center gap-1 font-semibold text-[10px] md:text-sm text-gray-500 mt-0.5 md:mt-1.5">
            <MdSchedule size={12} className="md:w-4 md:h-4" /> {a.eta} min
          </div>
          <div className="flex items-center gap-1 text-[10px] md:text-sm text-gray-400 mt-0.5 md:mt-1">
            <MdLocationOn size={12} className="md:w-4 md:h-4" /> {a.distance}m
          </div>
        </div>
      </div>
      <SeatBar filled={a.capacity} total={a.maxCapacity} color={a.color} />
      <button
        className="w-full py-2.5 md:py-3.5 px-0 rounded-xl text-xs md:text-base font-bold text-white bg-linear-to-r from-blue-500 to-blue-600 border-none cursor-pointer transition-all duration-300 shadow-md relative overflow-hidden flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-sm hover:enabled:-translate-y-0.75 hover:enabled:shadow-lg"
        disabled={left === 0}
        onClick={() => onBook(a)}
      >
        {left > 0 ? <><MdCheckCircle className="shrink-0" /> Pesan Sekarang</> : <><MdError className="shrink-0" /> Penuh</>}
      </button>
    </div>
  );
}

function TransitCard({ a }: { a: TransitAngkot }) {
  return (
    <div className="rounded-2xl p-3 md:p-4 bg-linear-to-br from-purple-50/50 to-blue-50/30 border border-purple-200/25 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-purple-300/35">
      <div className="flex items-center gap-1 mb-2 text-[10px] md:text-sm font-bold text-purple-500 uppercase tracking-wider">
        <FaExchangeAlt size={10} className="md:w-3.5 md:h-3.5" /> Rute Transit · Ganti
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="px-2 py-1 rounded font-bold text-[10px] md:text-sm bg-blue-100/80 text-gray-600 shadow-sm">{a.legs[0]}</span>
          <span className="text-[10px] md:text-sm text-gray-400">→</span>
          <span className="px-2 py-1 rounded font-bold text-[10px] md:text-sm bg-purple-100/60 border border-purple-300/35 text-purple-500">Transit</span>
          <span className="text-[10px] md:text-sm text-gray-400">→</span>
          <span className="px-2 py-1 rounded font-bold text-[10px] md:text-sm bg-blue-100/80 text-gray-600 shadow-sm">{a.legs[1]}</span>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs md:text-base font-bold text-gray-900">{fmtRp(a.price)}</div>
          <div className="flex items-center gap-1 font-bold text-[10px] md:text-sm text-purple-500 mt-0.5 justify-end">
            <MdSchedule size={10} className="md:w-3.5 md:h-3.5" /> {a.eta} mnt
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AngkotGoPage() {
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
  const notifShownRef = useRef(false);

  const [phase, setPhase]       = useState<Phase>('idle');
  const [query, setQuery]       = useState('');
  const [tab, setTab]           = useState<Tab>('tercepat');
  const [angkots, setAngkots]   = useState<Angkot[]>([]);
  const [booked, setBooked]     = useState<DirectAngkot | null>(null);
  const [eta, setEta]           = useState(0);
  const [notif, setNotif]       = useState<{ title: string; sub: string } | null>(null);
  const [notifVis, setNotifVis] = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(40);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ y: number; height: number } | null>(null);

  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load Leaflet library
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

  // Initialize map
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

  const doSearch = useCallback(() => {
    const q = query.trim();
    if (!q || !mapRef.current || !leafletReady) return;
    const L = (window as any).L as typeof import('leaflet');
    const city = MALANG;
    clearExtras();
    setAngkots(city.angkots);
    userMkRef.current?.setLatLng(city.userPos);
    routeRef.current = L.polyline(generateCurvedRoute(city.userPos, city.destPos), {
      color: '#2563eb', weight: 4.5, opacity: 0.85, dashArray: '10 12',
    }).addTo(mapRef.current);
    destMkRef.current = L.marker(city.destPos, { icon: makeDestIcon() }).addTo(mapRef.current);
    city.angkots
      .filter((a): a is DirectAngkot => a.type === 'direct')
      .forEach(a => {
        const mk = L.marker(a.pos, { icon: makeAngkotIcon(a), zIndexOffset: 500 }).addTo(mapRef.current!);
        angkotMkRef.current.set(a.id, mk);
      });
    const bounds = L.latLngBounds([city.userPos, city.destPos]);
    mapRef.current.fitBounds(bounds, { padding: [60, 60] });
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
  }, [query, leafletReady, clearExtras, makeAngkotIcon, makeDestIcon]);

  const bookAngkot = useCallback((a: DirectAngkot) => {
    bookedRef.current = a;
    notifShownRef.current = false;
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
    }
    if (mapRef.current) {
      const L = (window as any).L as typeof import('leaflet');
      const ap = angkotMkRef.current.get(a.id)?.getLatLng();
      const up = userMkRef.current?.getLatLng();
      if (ap && up) {
        mapRef.current.fitBounds(L.latLngBounds([up, ap]), { padding: [70, 70] });
      }
    }
    const total = a.eta * 60;
    etaMaxRef.current = total;
    setEta(total);
    setBooked(a);
    setPhase('tracking');
    if (etaTimerRef.current) clearInterval(etaTimerRef.current);
    etaTimerRef.current = setInterval(() => {
      setEta(prev => {
        const next = prev - 1;
        if (next <= 0) { clearInterval(etaTimerRef.current!); return 0; }
        
        if (mapRef.current && angkotMkRef.current.has(bookedRef.current!.id)) {
          const currentProgress = etaMaxRef.current > 0
            ? Math.round((1 - next / etaMaxRef.current) * 100)
            : 0;
          const newPos = getPositionOnRoute(MALANG.userPos, MALANG.destPos, currentProgress);
          const mk = angkotMkRef.current.get(bookedRef.current!.id);
          if (mk) mk.setLatLng(newPos);
        }
        
        if (!notifShownRef.current && next <= 30 && bookedRef.current) {
          notifShownRef.current = true;
          setNotif({ title: `${bookedRef.current.id} sudah sangat dekat!`, sub: `${bookedRef.current.plate} — bersiap naik ya 🎉` });
          setNotifVis(true);
          setTimeout(() => setNotifVis(false), 5000);
        }
        return next;
      });
    }, 1000);
  }, []);

  const cancelBooking = useCallback(() => {
    if (etaTimerRef.current) clearInterval(etaTimerRef.current);
    bookedRef.current = null;
    setBooked(null);
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

  const handleSheetDragStart = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Only allow drag on mobile
    if (isDesktop) return;
    
    dragStartRef.current = { y: e.clientY, height: sheetHeight };
    const onMove = (moveEvent: PointerEvent) => {
      if (!dragStartRef.current) return;
      const delta = moveEvent.clientY - dragStartRef.current.y;
      const newHeight = dragStartRef.current.height - (delta / window.innerHeight) * 100;
      // Max 50vh so it doesn't cover the map
      setSheetHeight(Math.min(50, newHeight));
    };
    const onEnd = () => {
      dragStartRef.current = null;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onEnd);
      if (sheetHeight < 10) {
        cancelBooking();
        return;
      }
      if (sheetHeight < 35) {
        setSheetHeight(30);
      } else {
        setSheetHeight(50);
      }
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onEnd);
  }, [sheetHeight, cancelBooking, isDesktop]);

  const listItems = tab === 'tercepat'
    ? [...angkots].sort((a, b) => a.eta - b.eta).slice(0, 3)
    : angkots;

  const progress = etaMaxRef.current > 0
    ? Math.round((1 - eta / etaMaxRef.current) * 100)
    : 0;

  const statusLabel = eta > 30
    ? { text: 'Berjalan',  bg: 'rgba(34,211,107,0.14)',  fg: '#22d36b'  }
    : eta > 0
    ? { text: 'Mendekat',  bg: 'rgba(255,122,47,0.14)',  fg: '#ff7a2f' }
    : { text: 'Tiba!',     bg: 'rgba(0,229,255,0.14)',   fg: '#3b82f6'   };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white text-gray-900">
      {/* Map */}
      <div ref={mapDivRef} className="absolute inset-0 z-0" />

      {/* Fixed Search Bar */}
      <div className="fixed top-4 left-4 right-4 z-30 md:left-1/2 md:right-auto md:top-6 md:w-[480px] md:-translate-x-1/2 flex items-center gap-2 md:gap-4 p-3 md:p-4 rounded-2xl bg-white border border-gray-200 transition-all duration-300 shadow-md focus-within:border-blue-500 focus-within:shadow-lg focus-within:-translate-y-0.5">
        <IoLocationSharp className="text-base md:text-xl text-blue-500 shrink-0" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doSearch()}
          placeholder="Mau ke mana hari ini?"
          className="flex-1 bg-transparent border-none outline-none text-xs md:text-base font-medium text-gray-900 placeholder-gray-300 min-w-0"
        />
        <button 
          className="shrink-0 px-3 py-2 md:px-5 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-sm font-bold text-white bg-linear-to-r from-blue-500 to-blue-600 border-none cursor-pointer transition-all duration-300 shadow-md flex items-center gap-1 md:gap-1.5 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 whitespace-nowrap"
          onClick={doSearch}
        >
          <IoSearch className="text-sm md:text-lg" />
          Cari
        </button>
      </div>

      {/* Bottom Sheet / Sidebar */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-20 md:fixed md:top-0 md:bottom-0 md:right-0 md:left-auto md:w-[400px] md:h-screen bg-white border-t border-gray-200 md:border-t-0 md:border-l rounded-t-[2rem] md:rounded-none flex flex-col touch-none user-select-none transition-all duration-300 shadow-2xl md:shadow-lg md:backdrop-blur-3xl"
        style={isDesktop ? {
          height: '100vh',
          transform: 'none',
          maxHeight: 'none',
          opacity: 1,
        } : {
          height: `${Math.max(15, sheetHeight)}vh`,
          transform: 'none',
          opacity: sheetHeight > -10 ? 1 : Math.max(0, 1 + (sheetHeight + 10) / 10),
          maxHeight: '50vh',
          willChange: 'transform, height',
        }}
      >
        {/* Drag Handle */}
        <div
          className="h-6 flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing gap-2 md:hidden"
          onPointerDown={handleSheetDragStart}
        >
          <span className="text-lg text-gray-300 leading-none font-bold">⋮</span>
        </div>

        {/* Sheet Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden md:px-6 md:pt-6 md:pb-8">
          {/* Idle State */}
          {phase === 'idle' && (
            <div className="flex flex-col p-0">
              <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 text-center gap-2 md:gap-3">
                <div className="flex items-center justify-center text-3xl md:text-5xl mb-1 md:mb-1.5 opacity-50">
                  <FaMap className="text-blue-500 w-8 h-8 md:w-12 md:h-12" />
                </div>
                <p className="text-[10px] md:text-sm text-gray-400 leading-relaxed">
                  Lokasi kamu terdeteksi ✦<br />
                  <strong className="text-gray-600">Ketik tujuan</strong> untuk mencari angkot terdekat
                </p>
              </div>
            </div>
          )}

          {/* Results State */}
          {phase === 'results' && (
            <div className="flex flex-col p-0">
              <div className="flex items-center justify-between p-3 md:p-5 shrink-0">
                <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm font-bold text-gray-600 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full bg-blue-500 shrink-0 animate-pulse" style={{ boxShadow: '0 0 6px rgba(59,130,246,0.6)' }} />
                  {listItems.length} Rute Tersedia
                </div>
                <button 
                  className="text-[10px] md:text-sm font-semibold text-rose-500 bg-transparent border border-rose-200 rounded-md md:rounded-lg px-2.5 py-1 md:px-4 md:py-2 cursor-pointer transition-all duration-300 hover:text-rose-600 hover:border-pink-400 hover:bg-rose-50/50 hover:shadow-sm"
                  onClick={cancelBooking}
                >
                  ← Batal
                </button>
              </div>

              <div className="flex gap-1.5 md:gap-2.5 px-3 pb-3 md:px-5 md:pt-0 md:pb-4 shrink-0">
                {(['tercepat', 'semua'] as Tab[]).map(t => (
                  <button
                    key={t}
                    className={`px-3 py-1.5 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl text-[10px] md:text-sm font-semibold transition-all duration-300 border inline-flex items-center gap-1 md:gap-2 ${
                      tab === t 
                        ? 'bg-linear-to-br from-blue-50/50 to-transparent border-blue-500 text-gray-900 shadow-sm' 
                        : 'border-gray-200 bg-transparent text-gray-400 hover:border-gray-300 hover:text-gray-600'
                    }`}
                    onClick={() => setTab(t)}
                  >
                    {t === 'tercepat' ? <><MdFlashOn className="text-xs md:text-base" /> Tercepat</> : 'Semua'}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2.5 p-4">
                {listItems.map((a, i) =>
                  a.type === 'direct'
                    ? <DirectCard key={i} a={a} onBook={bookAngkot} />
                    : <TransitCard key={i} a={a} />
                )}
              </div>
            </div>
          )}

          {/* Tracking State */}
          {phase === 'tracking' && booked && (
            <div className="flex flex-col p-0">
              {/* Header */}
              <div className="flex items-center justify-between p-3 md:p-5 shrink-0 border-b border-gray-100 mb-2 md:mb-4">
                <div className="flex items-center gap-2.5 md:gap-3">
                  <div 
                    className="w-10 md:w-14 h-10 md:h-14 rounded-3 flex items-center justify-center shrink-0 shadow-sm font-black text-xs md:text-base"
                    style={{ background: `${booked.color}18`, border: `1px solid ${booked.color}44`, color: booked.color }}
                  >
                    {booked.id}
                  </div>
                  <div>
                    <div className="text-xs md:text-base font-bold text-gray-900 leading-tight">{booked.name}</div>
                    <div className="text-[10px] md:text-sm text-gray-400 mt-0.5 md:mt-1 font-mono">{booked.plate} · {booked.driver}</div>
                  </div>
                </div>
                <button 
                  className="w-7 md:w-9 h-7 md:h-9 rounded-lg flex items-center justify-center text-xs md:text-base bg-rose-100/50 border border-rose-300/30 text-rose-500 cursor-pointer shrink-0 transition-all duration-300 hover:bg-rose-200/50 hover:border-rose-400/40 hover:shadow-sm"
                  onClick={cancelBooking}
                  title="Batalkan"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 md:gap-3 px-3 md:px-5 mb-3 md:mb-4 shrink-0">
                <div className="rounded-xl md:rounded-2xl p-2.5 md:p-4 bg-linear-to-br from-blue-50/80 to-blue-50/20 border border-blue-200/80 shadow-sm transition-all duration-300 hover:border-blue-300/80 hover:shadow-md">
                  <div className="text-[9px] md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-0.5 md:mb-1.5">ETA</div>
                  <div className="text-lg md:text-3xl font-black font-mono text-blue-500">{fmtEta(eta)}</div>
                </div>
                <div className="rounded-xl md:rounded-2xl p-2.5 md:p-4 bg-linear-to-br from-blue-50/80 to-blue-50/20 border border-blue-200/80 shadow-sm transition-all duration-300 hover:border-blue-300/80 hover:shadow-md">
                  <div className="text-[9px] md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-0.5 md:mb-1.5">Tiba</div>
                  <div className="text-xs md:text-base font-bold text-gray-900 mt-0.5 md:mt-1.5">{fmtTime(eta)}</div>
                </div>
                <div className="rounded-xl md:rounded-2xl p-2.5 md:p-4 bg-linear-to-br from-blue-50/80 to-blue-50/20 border border-blue-200/80 shadow-sm transition-all duration-300 hover:border-blue-300/80 hover:shadow-md">
                  <div className="text-[9px] md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-0.5 md:mb-1.5">Status</div>
                  <div className="mt-0.5 md:mt-1.5">
                    <span 
                      className="inline-block px-1.5 py-1 md:px-2.5 md:py-1.5 rounded md:rounded-lg text-[9px] md:text-sm font-bold"
                      style={{ background: statusLabel.bg, color: statusLabel.fg }}
                    >
                      {statusLabel.text}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="px-3 md:px-5 mb-3 md:mb-4 shrink-0">
                <div className="flex justify-between text-[10px] md:text-sm font-semibold text-gray-400 mb-1.5 md:mb-3">
                  <span>Perjalanan</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1 md:h-2 rounded-full bg-blue-100/80 overflow-hidden shadow-inner">
                  <div 
                    className="h-full rounded-full bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                    style={{ width: `${progress}%`, boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)' }}
                  />
                </div>
              </div>

              {/* Info Rows */}
              <div className="flex flex-col gap-2 md:gap-3 px-3 md:px-5 pb-6">
                <div className="flex items-center justify-between p-2.5 md:p-3.5 rounded-xl md:rounded-2xl bg-linear-to-br from-blue-50/80 to-blue-50/20 border border-blue-200/80 text-[10px] md:text-sm shadow-sm transition-all duration-300 hover:border-blue-300/80 hover:shadow-md">
                  <span className="text-gray-400 font-medium">Harga</span>
                  <span className="font-bold text-gray-700 font-mono text-xs md:text-base">{fmtRp(booked.price)}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 md:p-3.5 rounded-xl md:rounded-2xl bg-linear-to-br from-blue-50/80 to-blue-50/20 border border-blue-200/80 text-[10px] md:text-sm shadow-sm transition-all duration-300 hover:border-blue-300/80 hover:shadow-md">
                  <span className="text-gray-400 font-medium">Jarak</span>
                  <span className="font-bold text-gray-700 font-mono text-xs md:text-base">{booked.distance} m</span>
                </div>
                <div className="flex items-center justify-between p-2.5 md:p-3.5 rounded-xl md:rounded-2xl bg-linear-to-br from-blue-50/80 to-blue-50/20 border border-blue-200/80 text-[10px] md:text-sm shadow-sm transition-all duration-300 hover:border-blue-300/80 hover:shadow-md">
                  <span className="text-gray-400 font-medium">Pengemudi</span>
                  <span className="font-bold text-gray-700 font-mono text-xs md:text-base">{booked.driver}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 md:p-3.5 rounded-xl md:rounded-2xl bg-linear-to-br from-blue-50/80 to-blue-50/20 border border-blue-200/80 text-[10px] md:text-sm shadow-sm transition-all duration-300 hover:border-blue-300/80 hover:shadow-md mb-5">
                  <span className="text-gray-400 font-medium">Plat</span>
                  <span className="font-bold text-gray-700 font-mono text-xs md:text-base">{booked.plate}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification */}
      {notif && (
        <div className={`fixed top-3.5 left-4 right-4 z-50 flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/98 border border-blue-200/35 shadow-2xl backdrop-blur-3xl transition-all duration-300 ${
          notifVis ? 'animate-in fade-in slide-in-from-top-3' : 'animate-out fade-out slide-out-to-top-3'
        }`}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg bg-linear-to-br from-blue-50/80 to-purple-50/50 border border-blue-300/30 shrink-0">
            <FaBus size={18} className="text-blue-500" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-gray-900">{notif.title}</div>
            <div className="text-xs text-gray-400 mt-0.75">{notif.sub}</div>
          </div>
          <button 
            className="bg-transparent border-none text-gray-400 cursor-pointer p-1 shrink-0 flex items-center justify-center transition-all duration-200 hover:text-gray-900"
            onClick={() => setNotifVis(false)}
          >
            <FaTimes size={16} />
          </button>
        </div>
      )}
    </div>
  );
}



