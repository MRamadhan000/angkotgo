'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { IoLocationSharp, IoSearch } from 'react-icons/io5';
import { MdArrowForward } from 'react-icons/md';

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

const GLOBAL_CSS = `
  @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #ffffff;
    --panel:    #ffffff;
    --surface:  rgba(59,130,246,0.08);
    --surface2: rgba(59,130,246,0.12);
    --border:   rgba(59,130,246,0.15);
    --border2:  rgba(59,130,246,0.25);
    --text:     #1f2937;
    --text2:    #6b7280;
    --text3:    #9ca3af;
    --cyan:     #3b82f6;
    --purple:   #a855f7;
    --green:    #22d36b;
    --orange:   #ff7a2f;
    --red:      #ff4d6d;
    --sidebar-w: 360px;
    --font-ui:  'Plus Jakarta Sans', sans-serif;
    --font-mono:'IBM Plex Mono', monospace;
  }

  .ag-root {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: var(--bg);
    font-family: var(--font-ui);
    color: var(--text);
  }

  /* ── Map ── */
  .ag-map {
    position: absolute;
    inset: 0;
    z-index: 0;
  }
  .leaflet-tile-pane {
    filter: brightness(1) saturate(1) hue-rotate(0deg);
  }
  .leaflet-control-attribution,
  .leaflet-control-zoom { display: none !important; }

  /* ── Bottom Sheet ── */
  .ag-sheet {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 20;
    background: var(--panel);
    border-top: 1px solid var(--border2);
    border-radius: 24px 24px 0 0;
    max-height: 88vh;
    display: flex;
    flex-direction: column;
    touch-action: none;
    user-select: none;
    transition: transform 0.2s ease-out;
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.08);
  }

  .ag-sheet-handle {
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    cursor: grab;
  }

  .ag-sheet-handle::before {
    content: '';
    width: 40px;
    height: 4px;
    border-radius: 2px;
    background: var(--border2);
  }

  .ag-sheet-handle:active {
    cursor: grabbing;
  }

  .ag-sheet-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .ag-sheet-content::-webkit-scrollbar { width: 3px; }
  .ag-sheet-content::-webkit-scrollbar-track { background: transparent; }
  .ag-sheet-content::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

  /* ── Search box in sheet ── */
  .ag-search {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 18px;
    background: #ffffff;
    border: 1.5px solid #e0e7ff;
    transition: all 0.2s;
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.12);
  }
  .ag-search:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 6px 24px rgba(59, 130, 246, 0.18);
  }
  .ag-search-icon { font-size: 18px; color: #3b82f6; flex-shrink: 0; }
  .ag-search input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: 14px;
    font-weight: 500;
    color: #1f2937;
    font-family: var(--font-ui);
    min-width: 0;
  }
  .ag-search input::placeholder { color: #d1d5db; }
  .ag-search-btn {
    flex-shrink: 0;
    padding: 8px 14px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 700;
    font-family: var(--font-ui);
    color: #fff;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .ag-search-btn:hover { 
    opacity: 0.9;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    transform: translateY(-1px);
  }
  .ag-search-btn:active { transform: translateY(0); }

  /* ── Desktop Search Bar Constraints ── */
  @media (min-width: 769px) {
    .ag-search {
      max-width: 50vw !important;
      left: 50% !important;
      right: auto !important;
      transform: translateX(-50%) !important;
    }
    .ag-search-btn {
      padding: 10px 18px;
      gap: 8px;
      font-size: 14px;
    }
  }

  /* ── Content area ── */
  .ag-content {
    display: flex;
    flex-direction: column;
    padding: 0 20px 20px;
  }

  /* ── Idle hint ── */
  .ag-idle {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 28px 28px;
    text-align: center;
    gap: 8px;
  }
  .ag-idle-icon {
    font-size: 36px;
    margin-bottom: 6px;
    opacity: 0.5;
  }
  .ag-idle p {
    font-size: 13px;
    color: var(--text3);
    line-height: 1.75;
  }
  .ag-idle strong { color: var(--text2); font-weight: 600; }

  /* ── Results header ── */
  .ag-results-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 0 10px;
    flex-shrink: 0;
  }
  .ag-live-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--cyan);
    animation: blink 1.6s ease-in-out infinite;
    flex-shrink: 0;
  }
  .ag-results-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--text2);
  }
  .ag-back-btn {
    font-size: 11px;
    font-weight: 600;
    color: #ff4d6d;
    background: none;
    border: 1px solid #ffcdd2;
    border-radius: 8px;
    padding: 5px 10px;
    cursor: pointer;
    font-family: var(--font-ui);
    transition: color 0.15s, border-color 0.15s;
  }
  .ag-back-btn:hover { color: #ff3860; border-color: #ff6b9d; }

  /* ── Tabs ── */
  .ag-tabs {
    display: flex;
    gap: 6px;
    padding: 0 0 10px;
    flex-shrink: 0;
  }
  .ag-tab {
    padding: 6px 14px;
    border-radius: 9px;
    font-size: 12px;
    font-weight: 600;
    font-family: var(--font-ui);
    cursor: pointer;
    transition: all 0.18s;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text3);
  }
  .ag-tab.active {
    background: var(--surface2);
    border-color: var(--border2);
    color: var(--text);
  }

  /* ── Card list ── */
  .ag-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* ── Direct card ── */
  .ag-card {
    border-radius: 16px;
    padding: 14px;
    background: var(--surface);
    border: 1px solid var(--border);
    transition: background 0.18s, border-color 0.18s;
    cursor: default;
  }
  .ag-card:hover { background: var(--surface2); border-color: var(--border2); }
  .ag-card-head {
    display: flex;
    align-items: flex-start;
    gap: 11px;
    margin-bottom: 11px;
  }
  .ag-card-badge {
    width: 42px; height: 42px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 800;
    font-family: var(--font-mono);
    flex-shrink: 0;
  }
  .ag-card-info { flex: 1; min-width: 0; }
  .ag-card-name {
    font-size: 13px; font-weight: 700; color: var(--text);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-bottom: 4px;
  }
  .ag-card-meta {
    font-size: 10.5px; color: var(--text3);
    font-family: var(--font-mono);
  }
  .ag-card-price-block { text-align: right; flex-shrink: 0; }
  .ag-card-price { font-size: 13px; font-weight: 700; color: var(--text); }
  .ag-card-eta { font-size: 11px; font-weight: 700; margin-top: 3px; }
  .ag-card-dist { font-size: 10.5px; color: var(--text3); margin-top: 1px; }

  /* ── Seat bar ── */
  .ag-seats { margin-bottom: 11px; }
  .ag-seats-row { display: flex; gap: 3px; margin-bottom: 4px; }
  .ag-seat { width: 13px; height: 5px; border-radius: 3px; }
  .ag-seats-label { font-size: 10px; color: var(--text3); }

  /* ── Book btn ── */
  .ag-book-btn {
    width: 100%;
    padding: 10px 0;
    border-radius: 11px;
    font-size: 12px;
    font-weight: 700;
    font-family: var(--font-ui);
    letter-spacing: 0.05em;
    background: rgba(59,130,246,0.08);
    border: 1px solid rgba(59,130,246,0.22);
    color: var(--cyan);
    cursor: pointer;
    transition: background 0.18s, opacity 0.18s;
  }
  .ag-book-btn:hover:not(:disabled) { background: rgba(59,130,246,0.14); }
  .ag-book-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  /* ── Transit card ── */
  .ag-transit {
    border-radius: 16px;
    padding: 13px 14px;
    background: linear-gradient(135deg, rgba(168,85,247,0.06), rgba(59,130,246,0.08));
    border: 1px solid rgba(59,130,246,0.18);
  }
  .ag-transit-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--purple);
    margin-bottom: 9px;
  }
  .ag-transit-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .ag-transit-legs {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .ag-leg-chip {
    padding: 4px 9px;
    border-radius: 7px;
    font-size: 11.5px;
    font-weight: 700;
    font-family: var(--font-mono);
    background: var(--surface2);
    color: var(--text2);
  }
  .ag-leg-transit {
    padding: 4px 9px;
    border-radius: 7px;
    font-size: 10px;
    font-weight: 700;
    background: rgba(168,85,247,0.12);
    border: 1px solid rgba(168,85,247,0.28);
    color: var(--purple);
  }
  .ag-leg-arrow { font-size: 12px; color: var(--text3); }

  /* ── Tracking panel ── */
  .ag-tracking {
    display: flex;
    flex-direction: column;
  }
  .ag-tracking-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 0 12px;
    flex-shrink: 0;
    border-bottom: 1px solid var(--border);
    margin-bottom: 12px;
  }
  .ag-tracking-title-row {
    display: flex;
    align-items: center;
    gap: 11px;
  }
  .ag-tracking-badge {
    width: 44px; height: 44px; border-radius: 13px;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 800;
    font-family: var(--font-mono);
    flex-shrink: 0;
  }
  .ag-tracking-name { font-size: 13.5px; font-weight: 700; color: var(--text); line-height: 1.2; }
  .ag-tracking-sub { font-size: 10.5px; color: var(--text3); font-family: var(--font-mono); margin-top: 3px; }
  .ag-cancel-btn {
    width: 30px; height: 30px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; background: rgba(255,77,109,0.1);
    border: 1px solid rgba(255,77,109,0.22); color: var(--red);
    cursor: pointer; flex-shrink: 0; transition: background 0.15s;
  }
  .ag-cancel-btn:hover { background: rgba(255,77,109,0.18); }

  /* ── Stats grid ── */
  .ag-stats {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    padding: 0;
    flex-shrink: 0;
    margin-bottom: 12px;
  }
  .ag-stat {
    border-radius: 12px;
    padding: 10px 12px;
    background: var(--surface);
    border: 1px solid var(--border);
  }
  .ag-stat-label {
    font-size: 9.5px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text3);
    margin-bottom: 5px;
  }
  .ag-stat-val { font-size: 18px; font-weight: 700; font-family: var(--font-mono); }
  .ag-stat-sm  { font-size: 13px; font-weight: 700; }
  .ag-stat-badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 7px;
    font-size: 10px;
    font-weight: 700;
  }

  /* ── Progress bar ── */
  .ag-progress-wrap {
    padding: 0;
    flex-shrink: 0;
    margin-bottom: 12px;
  }
  .ag-progress-row {
    display: flex;
    justify-content: space-between;
    font-size: 10.5px;
    color: var(--text3);
    margin-bottom: 7px;
  }
  .ag-progress-track {
    height: 5px;
    border-radius: 5px;
    background: var(--surface2);
    overflow: hidden;
  }
  .ag-progress-fill {
    height: 100%;
    border-radius: 5px;
    background: linear-gradient(90deg, #3b82f6, #a855f7);
    transition: width 1s linear;
  }

  /* ── Tracking footer note ── */
  .ag-tracking-note {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-bottom: 20px;
  }
  .ag-info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border-radius: 11px;
    background: var(--surface);
    border: 1px solid var(--border);
    font-size: 12px;
  }
  .ag-info-key { color: var(--text3); }
  .ag-info-val { font-weight: 600; color: var(--text2); font-family: var(--font-mono); font-size: 11.5px; }

  /* ── Notification ── */
  .ag-notif {
    position: fixed;
    top: 14px;
    left: 16px;
    right: 16px;
    z-index: 50;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 13px 16px;
    border-radius: 16px;
    background: rgba(255,255,255,0.95);
    border: 1px solid rgba(59,130,246,0.28);
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  }
  .ag-notif-icon {
    width: 40px; height: 40px; border-radius: 11px;
    display: flex; align-items: center; justify-content: center; font-size: 18px;
    background: rgba(59,130,246,0.12);
    border: 1px solid rgba(59,130,246,0.25);
    flex-shrink: 0;
  }
  .ag-notif-title { font-size: 12.5px; font-weight: 700; color: var(--text); }
  .ag-notif-sub { font-size: 11px; color: var(--text3); margin-top: 3px; }
  .ag-notif-close {
    background: none; border: none; color: var(--text3);
    cursor: pointer; font-size: 15px; padding: 4px; flex-shrink: 0;
  }

  /* ── Pill badge ── */
  .ag-pill {
    display: inline-block;
    font-size: 9.5px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 6px;
    margin-left: 5px;
    vertical-align: middle;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.2; }
  }
  @keyframes notifIn {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes notifOut {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(-10px); }
  }
  .notif-in  { animation: notifIn  0.28s ease forwards; }
  .notif-out { animation: notifOut 0.25s ease forwards; }
  @keyframes fadeSlide {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-slide { animation: fadeSlide 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }

  /* ── Mobile Responsive ── */
  @media (max-width: 768px) {
    :root {
      --sidebar-w: 100vw;
    }

    .ag-root {
      flex-direction: column;
    }

    .ag-sidebar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      min-width: 100%;
      height: 100vh;
      z-index: 30;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      border-right: none;
      border-bottom: none;
    }

    .ag-sidebar.mobile-open {
      transform: translateX(0);
    }

    .ag-sidebar-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 25;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    .ag-sidebar-overlay.mobile-open {
      opacity: 1;
      pointer-events: all;
    }

    .ag-hamburger {
      position: fixed;
      top: 16px;
      left: 16px;
      z-index: 35;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid var(--border2);
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.2s;
      padding: 0;
    }

    .ag-hamburger:hover {
      background: rgba(255, 255, 255, 1);
    }

    .ag-hamburger-line {
      width: 20px;
      height: 14px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .ag-hamburger-line span {
      width: 100%;
      height: 2px;
      background: #3b82f6;
      border-radius: 1px;
      transition: all 0.3s ease;
    }

    .ag-hamburger.open span:nth-child(1) {
      transform: rotate(45deg) translate(8px, 8px);
    }

    .ag-hamburger.open span:nth-child(2) {
      opacity: 0;
    }

    .ag-hamburger.open span:nth-child(3) {
      transform: rotate(-45deg) translate(7px, -7px);
    }

    .ag-logo {
      padding: 20px 16px 0;
    }

    .ag-logo-icon {
      width: 32px;
      height: 32px;
      font-size: 16px;
    }

    .ag-logo-title {
      font-size: 16px;
    }

    .ag-logo-sub {
      font-size: 9px;
    }

    .ag-search {
      margin: 0 16px;
      padding: 10px 14px;
      font-size: 13px;
    }

    .ag-search-icon {
      font-size: 16px;
    }

    .ag-search input {
      font-size: 13px;
    }

    .ag-search-btn {
      font-size: 12px;
      padding: 7px 12px;
    }

    .ag-divider {
      margin: 12px 16px;
    }

    .ag-idle {
      padding: 20px 20px;
    }

    .ag-idle-icon {
      font-size: 28px;
      margin-bottom: 4px;
    }

    .ag-idle p {
      font-size: 12px;
    }

    .ag-results-header {
      padding: 12px 16px 8px;
    }

    .ag-results-label {
      font-size: 10px;
    }

    .ag-back-btn {
      font-size: 10px;
      padding: 4px 8px;
    }

    .ag-tabs {
      gap: 4px;
      padding: 0 16px 8px;
    }

    .ag-tab {
      padding: 5px 12px;
      font-size: 11px;
    }

    .ag-list {
      padding: 0 16px 16px;
      gap: 8px;
    }

    .ag-card {
      border-radius: 12px;
      padding: 12px;
    }

    .ag-card-head {
      gap: 8px;
      margin-bottom: 8px;
    }

    .ag-card-badge {
      width: 36px;
      height: 36px;
      font-size: 10px;
    }

    .ag-card-name {
      font-size: 12px;
      margin-bottom: 2px;
    }

    .ag-card-meta {
      font-size: 9px;
    }

    .ag-card-price {
      font-size: 12px;
    }

    .ag-card-eta,
    .ag-card-dist {
      font-size: 10px;
    }

    .ag-seats {
      margin-bottom: 8px;
    }

    .ag-seats-row {
      margin-bottom: 3px;
    }

    .ag-seat {
      width: 11px;
      height: 4px;
    }

    .ag-seats-label {
      font-size: 9px;
    }

    .ag-book-btn {
      padding: 8px 0;
      font-size: 11px;
    }

    .ag-transit {
      border-radius: 12px;
      padding: 11px 12px;
    }

    .ag-transit-label {
      font-size: 9px;
      margin-bottom: 7px;
    }

    .ag-transit-row {
      gap: 8px;
    }

    .ag-leg-chip,
    .ag-leg-transit {
      font-size: 10px;
      padding: 3px 7px;
    }

    .ag-tracking-head {
      padding: 12px 16px 10px;
    }

    .ag-tracking-title-row {
      gap: 8px;
    }

    .ag-tracking-badge {
      width: 36px;
      height: 36px;
      font-size: 11px;
    }

    .ag-tracking-name {
      font-size: 12px;
    }

    .ag-tracking-sub {
      font-size: 9px;
      margin-top: 2px;
    }

    .ag-cancel-btn {
      width: 28px;
      height: 28px;
      font-size: 12px;
    }

    .ag-stats {
      grid-template-columns: 1fr 1fr 1fr;
      gap: 6px;
      padding: 12px 16px;
    }

    .ag-stat {
      border-radius: 10px;
      padding: 8px 10px;
    }

    .ag-stat-label {
      font-size: 8px;
      margin-bottom: 4px;
    }

    .ag-stat-val {
      font-size: 15px;
    }

    .ag-stat-sm {
      font-size: 11px;
    }

    .ag-stat-badge {
      font-size: 9px;
      padding: 2px 6px;
    }

    .ag-progress-wrap {
      padding: 0 16px 12px;
    }

    .ag-progress-row {
      font-size: 9px;
      margin-bottom: 5px;
    }

    .ag-progress-track {
      height: 4px;
    }

    .ag-tracking-note {
      padding: 0 16px;
      gap: 6px;
    }

    .ag-info-row {
      padding: 8px 10px;
      border-radius: 9px;
      font-size: 11px;
    }

    .ag-info-val {
      font-size: 10px;
    }

    .ag-notif {
      left: 12px;
      right: 12px;
      top: 70px;
      z-index: 40;
      gap: 10px;
      padding: 11px 13px;
      border-radius: 12px;
      font-size: 11px;
    }

    .ag-notif-icon {
      width: 32px;
      height: 32px;
      font-size: 14px;
    }

    .ag-notif-title {
      font-size: 11px;
    }

    .ag-notif-sub {
      font-size: 10px;
      margin-top: 2px;
    }

    .ag-notif-close {
      font-size: 13px;
    }

    .ag-pill {
      font-size: 8px;
      padding: 1px 5px;
      margin-left: 3px;
    }
  }

  @media (max-width: 480px) {
    .ag-logo-title {
      font-size: 14px;
    }

    .ag-logo-sub {
      font-size: 8px;
    }

    .ag-card-head {
      flex-wrap: wrap;
    }

    .ag-card-price-block {
      width: 100%;
      text-align: left;
      padding-top: 4px;
      border-top: 1px solid var(--border);
    }

    .ag-stats {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .ag-transit-row {
      flex-direction: column;
      align-items: flex-start;
    }

    .ag-transit-legs {
      width: 100%;
      flex-wrap: wrap;
    }

    .ag-transit-legs > * {
      flex-shrink: 0;
    }
  }
`;

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
  
  // Create intermediate points for a natural curve
  const segments = 8;
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    // Base position
    const lat = from[0] + latDiff * t;
    const lng = from[1] + lngDiff * t;
    
    // Add perpendicular offset for natural curve (like roads do)
    const offsetAmount = Math.sin(t * Math.PI) * 0.004;
    const angle = Math.atan2(latDiff, lngDiff);
    const perpLat = lat + Math.cos(angle) * offsetAmount;
    const perpLng = lng - Math.sin(angle) * offsetAmount;
    
    points.push([perpLat, perpLng]);
  }
  points.push(to);
  return points;
};

// Get position along curved route by progress percentage
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
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="46" viewBox="0 0 64 46">
    <rect x="2" y="0" width="60" height="24" rx="9" fill="${a.color}28" stroke="${a.color}99" stroke-width="1.5"/>
    <text x="32" y="16" text-anchor="middle" dominant-baseline="middle"
      font-family="monospace" font-size="12" font-weight="800" fill="${a.color}">${a.id}</text>
    <line x1="32" y1="24" x2="32" y2="36" stroke="${a.color}77" stroke-width="1.5"/>
    <circle cx="32" cy="40" r="5" fill="${a.color}" stroke="rgba(255,255,255,0.85)" stroke-width="2"/>
  </svg>`;
}
function svgUser(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="16" fill="rgba(0,229,255,0.18)"/>
    <circle cx="16" cy="16" r="10" fill="rgba(0,229,255,0.3)"/>
    <circle cx="16" cy="16" r="6"  fill="#00e5ff" stroke="white" stroke-width="2"/>
  </svg>`;
}
function svgDest(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="#a855f7" stroke="white" stroke-width="2.5"/>
    <circle cx="12" cy="12" r="4"  fill="white"/>
  </svg>`;
}

function SeatBar({ filled, total, color }: { filled: number; total: number; color: string }) {
  const left = total - filled;
  return (
    <div className="ag-seats">
      <div className="ag-seats-row">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="ag-seat" style={{
            background: i < filled ? 'rgba(255,255,255,0.1)' : color,
            boxShadow: i >= filled ? `0 0 4px ${color}44` : undefined,
          }} />
        ))}
      </div>
      <div className="ag-seats-label">
        {filled} terisi / {total} kursi &nbsp;—&nbsp;
        {left > 0
          ? <span style={{ color }}>{left} tersedia</span>
          : <span style={{ color: 'var(--red)' }}>Penuh!</span>
        }
      </div>
    </div>
  );
}

function DirectCard({ a, onBook }: { a: DirectAngkot; onBook: (a: DirectAngkot) => void }) {
  const left = a.maxCapacity - a.capacity;
  return (
    <div className="ag-card">
      <div className="ag-card-head">
        <div className="ag-card-badge" style={{ background: `${a.color}18`, border: `1px solid ${a.color}44`, color: a.color }}>
          {a.id}
        </div>
        <div className="ag-card-info">
          <div className="ag-card-name">
            {a.name}
            {left === 0 && <span className="ag-pill" style={{ background: 'rgba(255,77,109,0.15)', color: 'var(--red)' }}>PENUH</span>}
            {left >= 8 && <span className="ag-pill" style={{ background: 'rgba(0,229,255,0.12)', color: 'var(--cyan)' }}>BANYAK</span>}
          </div>
          <div className="ag-card-meta">🚗 {a.plate} · 👤 {a.driver}</div>
        </div>
        <div className="ag-card-price-block">
          <div className="ag-card-price">{fmtRp(a.price)}</div>
          <div className="ag-card-eta" style={{ color: a.color }}>⏱ {a.eta} mnt</div>
          <div className="ag-card-dist">📍 {a.distance}m</div>
        </div>
      </div>
      <SeatBar filled={a.capacity} total={a.maxCapacity} color={a.color} />
      <button
        className="ag-book-btn"
        disabled={left === 0}
        onClick={() => onBook(a)}
      >
        {left > 0 ? 'Pesan Sekarang →' : 'Penuh'}
      </button>
    </div>
  );
}

function TransitCard({ a }: { a: TransitAngkot }) {
  return (
    <div className="ag-transit">
      <div className="ag-transit-label">🔀 Rute Transit · Ganti di Pertigaan</div>
      <div className="ag-transit-row">
        <div className="ag-transit-legs">
          <span className="ag-leg-chip">{a.legs[0]}</span>
          <span className="ag-leg-arrow">→</span>
          <span className="ag-leg-transit">Transit</span>
          <span className="ag-leg-arrow">→</span>
          <span className="ag-leg-chip">{a.legs[1]}</span>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{fmtRp(a.price)}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple)', marginTop: 2 }}>⏱ {a.eta} mnt</div>
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
  const [sheetHeight, setSheetHeight] = useState(40); // 40% of viewport
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ y: number; height: number } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!document.getElementById('angkotgo-styles')) {
      const style = document.createElement('style');
      style.id = 'angkotgo-styles';
      style.textContent = GLOBAL_CSS;
      document.head.appendChild(style);
    }
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
      icon: L.divIcon({ html: svgUser(), className: '', iconSize: [32, 32], iconAnchor: [16, 16] }),
      zIndexOffset: 1000,
    }).addTo(map);
  }, [leafletReady]);

  const makeAngkotIcon = useCallback((a: DirectAngkot) => {
    const L = (window as any).L as typeof import('leaflet');
    return L.divIcon({ html: svgAngkot(a), className: '', iconSize: [64, 46], iconAnchor: [32, 46] });
  }, []);
  const makeDestIcon = useCallback(() => {
    const L = (window as any).L as typeof import('leaflet');
    return L.divIcon({ html: svgDest(), className: '', iconSize: [24, 24], iconAnchor: [12, 12] });
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
      color: '#00e5ff', weight: 2.5, opacity: 0.55, dashArray: '8 12',
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
    // Draw route line in tracking mode
    if (mapRef.current) {
      const L = (window as any).L as typeof import('leaflet');
      routeRef.current = L.polyline(generateCurvedRoute(MALANG.userPos, MALANG.destPos), {
        color: '#00e5ff', weight: 2.5, opacity: 0.55, dashArray: '8 12',
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
        
        // Update angkot position along route
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
    dragStartRef.current = { y: e.clientY, height: sheetHeight };
  }, [sheetHeight]);

  const handleSheetDragMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    const delta = e.clientY - dragStartRef.current.y;
    const newHeight = dragStartRef.current.height - (delta / window.innerHeight) * 100;
    const clamped = Math.max(25, Math.min(88, newHeight));
    setSheetHeight(clamped);
  }, []);

  const handleSheetDragEnd = useCallback(() => {
    dragStartRef.current = null;
    // Snap to 40% if between 25-55%, otherwise to min/max
    if (sheetHeight > 25 && sheetHeight < 55) {
      setSheetHeight(40);
    } else if (sheetHeight >= 55) {
      setSheetHeight(88);
    }
  }, [sheetHeight]);

  useEffect(() => () => {
    if (animRef.current)    clearInterval(animRef.current);
    if (etaTimerRef.current) clearInterval(etaTimerRef.current);
  }, []);

  const listItems = tab === 'tercepat'
    ? [...angkots].sort((a, b) => a.eta - b.eta).slice(0, 3)
    : angkots;

  const progress = etaMaxRef.current > 0
    ? Math.round((1 - eta / etaMaxRef.current) * 100)
    : 0;

  const statusLabel = eta > 30
    ? { text: 'Berjalan',  bg: 'rgba(34,211,107,0.14)',  fg: 'var(--green)'  }
    : eta > 0
    ? { text: 'Mendekat',  bg: 'rgba(255,122,47,0.14)',  fg: 'var(--orange)' }
    : { text: 'Tiba!',     bg: 'rgba(0,229,255,0.14)',   fg: 'var(--cyan)'   };

  return (
    <div className="ag-root">
      {/* Map */}
      <div ref={mapDivRef} className="ag-map" />

      {/* Fixed Search Bar */}
      <div className="ag-search" style={{ position: 'fixed', top: 16, left: 16, right: 16, zIndex: 30 }}>
        <IoLocationSharp className="ag-search-icon" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doSearch()}
          placeholder="Mau ke mana hari ini?"
        />
        <button className="ag-search-btn" onClick={doSearch}>
          <IoSearch style={{ fontSize: 16 }} />
          Cari
        </button>
      </div>

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className="ag-sheet fade-slide"
        style={{ height: `${sheetHeight}vh`, transform: `translateY(${100 - sheetHeight}vh)` }}
      >
        {/* Drag Handle */}
        <div
          className="ag-sheet-handle"
          onPointerDown={handleSheetDragStart}
          onPointerMove={handleSheetDragMove}
          onPointerUp={handleSheetDragEnd}
          onPointerCancel={handleSheetDragEnd}
        />

        {/* Sheet Content */}
        <div className="ag-sheet-content">
          {/* ── Idle ── */}
          {phase === 'idle' && (
            <div className="ag-content">
              <div className="ag-idle">
                <div className="ag-idle-icon">🗺️</div>
                <p>
                  Lokasi kamu sudah terdeteksi ✦<br />
                  <strong>Ketik tujuan</strong> untuk mencari angkot terdekat
                </p>
              </div>
            </div>
          )}

          {/* ── Results ── */}
          {phase === 'results' && (
            <div className="ag-content">
              <div className="ag-results-header">
                <div className="ag-results-label">
                  <span className="ag-live-dot" />
                  {listItems.length} Rute Tersedia
                </div>
                <button className="ag-back-btn" onClick={cancelBooking}>← Batal</button>
              </div>

              <div className="ag-tabs">
                {(['tercepat', 'semua'] as Tab[]).map(t => (
                  <button
                    key={t}
                    className={`ag-tab${tab === t ? ' active' : ''}`}
                    onClick={() => setTab(t)}
                  >
                    {t === 'tercepat' ? '⚡ Tercepat' : 'Semua Rute'}
                  </button>
                ))}
              </div>

              <div className="ag-list">
                {listItems.map((a, i) =>
                  a.type === 'direct'
                    ? <DirectCard key={i} a={a} onBook={bookAngkot} />
                    : <TransitCard key={i} a={a} />
                )}
              </div>
            </div>
          )}

          {/* ── Tracking ── */}
          {phase === 'tracking' && booked && (
            <div className="ag-content">
              {/* Header */}
              <div className="ag-tracking-head">
                <div className="ag-tracking-title-row">
                  <div className="ag-tracking-badge" style={{ background: `${booked.color}18`, border: `1px solid ${booked.color}44`, color: booked.color }}>
                    {booked.id}
                  </div>
                  <div>
                    <div className="ag-tracking-name">{booked.name}</div>
                    <div className="ag-tracking-sub">{booked.plate} · {booked.driver}</div>
                  </div>
                </div>
                <button className="ag-cancel-btn" onClick={cancelBooking} title="Batalkan">✕</button>
              </div>

              {/* Stats */}
              <div className="ag-stats">
                <div className="ag-stat">
                  <div className="ag-stat-label">ETA</div>
                  <div className="ag-stat-val" style={{ color: 'var(--cyan)' }}>{fmtEta(eta)}</div>
                </div>
                <div className="ag-stat">
                  <div className="ag-stat-label">Tiba Pukul</div>
                  <div className="ag-stat-sm" style={{ color: 'var(--text)', marginTop: 4 }}>{fmtTime(eta)}</div>
                </div>
                <div className="ag-stat">
                  <div className="ag-stat-label">Status</div>
                  <div style={{ marginTop: 4 }}>
                    <span className="ag-stat-badge" style={{ background: statusLabel.bg, color: statusLabel.fg }}>
                      {statusLabel.text}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="ag-progress-wrap">
                <div className="ag-progress-row">
                  <span>Perjalanan</span>
                  <span>{progress}%</span>
                </div>
                <div className="ag-progress-track">
                  <div className="ag-progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {/* Info rows */}
              <div className="ag-tracking-note">
                <div className="ag-info-row">
                  <span className="ag-info-key">Harga</span>
                  <span className="ag-info-val">{fmtRp(booked.price)}</span>
                </div>
                <div className="ag-info-row">
                  <span className="ag-info-key">Jarak</span>
                  <span className="ag-info-val">{booked.distance} m</span>
                </div>
                <div className="ag-info-row">
                  <span className="ag-info-key">Pengemudi</span>
                  <span className="ag-info-val">{booked.driver}</span>
                </div>
                <div className="ag-info-row">
                  <span className="ag-info-key">Plat</span>
                  <span className="ag-info-val">{booked.plate}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification */}
      {notif && (
        <div className={`ag-notif ${notifVis ? 'notif-in' : 'notif-out'}`}>
          <div className="ag-notif-icon">🚐</div>
          <div style={{ flex: 1 }}>
            <div className="ag-notif-title">{notif.title}</div>
            <div className="ag-notif-sub">{notif.sub}</div>
          </div>
          <button className="ag-notif-close" onClick={() => setNotifVis(false)}>✕</button>
        </div>
      )}
    </div>
  );
}