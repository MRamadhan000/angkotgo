'use client';

import React from 'react';
import { FaBell, FaChevronDown } from 'react-icons/fa';

interface TopbarProps {
  breadcrumb?: { parent: string; current: string };
}

export default function Topbar({ breadcrumb = { parent: 'Beranda', current: 'Dashboard' } }: TopbarProps) {
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="h-[58px] bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[13px]">
        <span className="text-slate-400">{breadcrumb.parent}</span>
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-slate-800">{breadcrumb.current}</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
     

        {/* Notifikasi */}
        <div className="relative w-[34px] h-[34px] bg-slate-50 border border-slate-200 rounded-[8px] flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
          <FaBell className="text-slate-600 text-[15px]" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
            <span className="text-white text-[9px] font-bold">3</span>
          </div>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-[8px] cursor-pointer hover:bg-slate-50 transition-colors">
          <div className="w-[30px] h-[30px] bg-blue-100 rounded-[8px] flex items-center justify-center font-bold text-[11px] text-blue-700">
            AG
          </div>
          <div>
            <div className="text-[13px] font-semibold text-slate-800 leading-none">Admin AngkotGo</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Super Admin</div>
          </div>
          <FaChevronDown className="text-slate-300 text-[11px] ml-1" />
        </div>
      </div>
    </div>
  );
}