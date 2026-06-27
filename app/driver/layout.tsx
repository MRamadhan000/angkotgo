"use client";

import { useState } from "react";
import { Inter } from "next/font/google";
import Sidebar from "@/components/driver/Sidebar";
import TopBar from "@/components/driver/TopBar";

const inter = Inter({ subsets: ["latin"] });

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`${inter.className} bg-gray-50 antialiased min-h-screen text-slate-800 flex flex-col relative`}>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Backdrop for mobile drawer */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-[210px] transition-all duration-300">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 pt-[72px] min-h-[calc(100vh-72px)] overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}