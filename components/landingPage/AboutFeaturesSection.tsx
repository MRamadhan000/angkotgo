"use client";

import React from "react";
import {
  FaMapMarkerAlt,
  FaSearchLocation,
  FaRoute,
  FaMobileAlt,
} from "react-icons/fa";

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <div className="flex gap-4 group">
      <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-[#2563EB] group-hover:bg-blue-100 transition-colors">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-slate-900 tracking-tight">{title}</h4>
        <p className="text-sm text-slate-600 leading-relaxed mt-0.5">
          {description}
        </p>
      </div>
    </div>
  );
};

export default function AboutFeaturesSection() {
  const features = [
    {
      icon: <FaMapMarkerAlt className="text-xl" />,
      title: "Live Tracking",
      description: "Pantau posisi angkot secara real-time",
    },
    {
      icon: <FaSearchLocation className="text-xl" />,
      title: "Cari Halte",
      description: "Temukan halte terdekat dari lokasimu",
    },
    {
      icon: <FaRoute className="text-xl" />,
      title: "Semua Jalur Angkot",
      description: "Informasi lengkap semua jalur di Malang",
    },
    {
      icon: <FaMobileAlt className="text-xl" />,
      title: "Mobile Friendly",
      description: "Nyaman digunakan di semua perangkat",
    },
  ];

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 lg:items-stretch">
          {/* ===== Column 1 — About ===== */}
          <div id="about" className="flex flex-col justify-center scroll-mt-24">
            <div className="mb-3 text-xs font-semibold tracking-[2px] text-[#2563EB]">
              ABOUT US
            </div>
            <h2 className="mb-6 text-3xl sm:text-4xl font-bold leading-tight text-slate-900">
              Dibangun untuk
              <br />
              Mobilitas Kota Malang
            </h2>
            <p className="mb-8 text-sm sm:text-[15px] leading-relaxed text-slate-600">
              Bermula dari kebutuhan masyarakat dan mahasiswa akan transportasi
              umum yang mudah diakses, AngkotGo hadir dengan teknologi pelacakan
              real-time.
            </p>
            <a
              href="#about"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-[#2563EB] px-6 py-3 text-sm font-medium text-[#2563EB] hover:bg-blue-50"
            >
              Selengkapnya →
            </a>
          </div>

          {/* ===== Column 2 — Banner image ===== */}
          <div className="relative flex h-[250px] sm:h-[350px] lg:h-[500px] items-center justify-center overflow-hidden rounded-3xl">
            <img
              src="/banner.png"
              alt="Banner"
              className="h-full w-full object-cover"
            />
            <div
              className="absolute inset-y-0 left-0 w-full pointer-events-none bg-[linear-gradient(to_right,#fff_0%,#fff_0,15%,rgba(255,255,255,0)_45%)] hidden lg:block"
            />
          </div>

          {/* ===== Column 3 — Features ===== */}
          <div id="fitur" className="flex flex-col justify-center scroll-mt-24">
            <div className="mb-3 text-xs font-semibold tracking-[2px] text-[#2563EB]">
              FEATURES
            </div>
            <h3 className="mb-8 text-2xl sm:text-3xl font-bold text-slate-900">
              Fitur Lengkap,
              <br />
              Perjalanan Praktis
            </h3>
            <div className="space-y-6">
              {features.map((feature, index) => (
                <FeatureItem
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>

          {/* ===== Column 4 — Mobile mockup ===== */}
          <div className="flex h-[250px] sm:h-[350px] lg:h-[500px] items-center justify-center rounded-3xl bg-transparent">
            <img
              src="/mobile.png"
              alt="Mobile App"
              className="max-h-full w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
