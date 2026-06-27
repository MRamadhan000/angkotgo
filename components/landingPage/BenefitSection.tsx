"use client";

import React from "react";
import { COLORS, TYPOGRAPHY } from "@/constants";

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const IconTracking = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Pin shadow */}
    <ellipse cx="16" cy="28" rx="5" ry="2" fill="#2563EB" opacity="0.12" />
    {/* Pin body */}
    <path
      d="M16 3C11.582 3 8 6.582 8 11C8 16.5 14.5 24.5 15.25 25.417C15.627 25.872 16.373 25.872 16.75 25.417C17.5 24.5 24 16.5 24 11C24 6.582 20.418 3 16 3Z"
      fill="#DBEAFE"
      stroke="#2563EB"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Pin inner circle */}
    <circle cx="16" cy="11" r="3.5" fill="#2563EB" />
    <circle cx="14.8" cy="9.8" r="1" fill="white" opacity="0.5" />
    {/* Pulse ring */}
    <circle
      cx="16"
      cy="11"
      r="6"
      stroke="#2563EB"
      strokeWidth="1"
      opacity="0.3"
      strokeDasharray="2 2"
    />
  </svg>
);

const IconRoute = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Road base */}
    <path
      d="M6 26C6 26 8 18 12 14C16 10 20 10 22 8C24 6 25 4 25 4"
      stroke="#BFDBFE"
      strokeWidth="5"
      strokeLinecap="round"
    />
    {/* Road line */}
    <path
      d="M6 26C6 26 8 18 12 14C16 10 20 10 22 8C24 6 25 4 25 4"
      stroke="#2563EB"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeDasharray="3 2.5"
    />
    {/* Start dot */}
    <circle cx="6" cy="26" r="3" fill="#2563EB" />
    <circle cx="6" cy="26" r="1.2" fill="white" />
    {/* End flag */}
    <rect x="24" y="2" width="1.5" height="8" rx="0.75" fill="#2563EB" />
    <path d="M25.5 2L29 3.8L25.5 5.6V2Z" fill="#2563EB" />
    {/* Midpoint marker */}
    <circle
      cx="15.5"
      cy="12.5"
      r="2"
      fill="#DBEAFE"
      stroke="#2563EB"
      strokeWidth="1.2"
    />
  </svg>
);

const IconClock = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Clock body */}
    <circle
      cx="16"
      cy="17"
      r="12"
      fill="#DBEAFE"
      stroke="#2563EB"
      strokeWidth="1.5"
    />
    {/* Clock face highlight */}
    <circle cx="16" cy="17" r="9" fill="white" opacity="0.6" />
    {/* Hour hand */}
    <line
      x1="16"
      y1="17"
      x2="16"
      y2="11"
      stroke="#1D4ED8"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Minute hand */}
    <line
      x1="16"
      y1="17"
      x2="20.5"
      y2="20"
      stroke="#2563EB"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Center dot */}
    <circle cx="16" cy="17" r="1.5" fill="#2563EB" />
    {/* Tick marks */}
    <line
      x1="16"
      y1="7"
      x2="16"
      y2="8.5"
      stroke="#2563EB"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <line
      x1="16"
      y1="25.5"
      x2="16"
      y2="27"
      stroke="#2563EB"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <line
      x1="6.5"
      y1="17"
      x2="7.5"
      y2="17"
      stroke="#2563EB"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <line
      x1="24.5"
      y1="17"
      x2="25.5"
      y2="17"
      stroke="#2563EB"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    {/* Bell top */}
    <path
      d="M13 5C13 5 14 3 16 3C18 3 19 5 19 5"
      stroke="#2563EB"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const IconWallet = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Wallet body */}
    <rect
      x="3"
      y="9"
      width="26"
      height="18"
      rx="3"
      fill="#DBEAFE"
      stroke="#2563EB"
      strokeWidth="1.5"
    />
    {/* Wallet flap */}
    <path d="M3 14H29" stroke="#2563EB" strokeWidth="1.5" />
    {/* Card slot */}
    <rect
      x="18"
      y="17"
      width="9"
      height="6"
      rx="2"
      fill="#2563EB"
      opacity="0.15"
      stroke="#2563EB"
      strokeWidth="1.2"
    />
    {/* Coin inside slot */}
    <circle cx="22.5" cy="20" r="1.5" fill="#2563EB" opacity="0.7" />
    {/* Old card sticking out (decorative) */}
    <rect
      x="5"
      y="5"
      width="16"
      height="7"
      rx="2"
      fill="#BFDBFE"
      stroke="#2563EB"
      strokeWidth="1.2"
    />
    {/* Card stripe */}
    <rect x="5" y="8" width="16" height="2" fill="#2563EB" opacity="0.2" />
    {/* Coin sparkle */}
    <path
      d="M8 18L8 22M6 20L10 20"
      stroke="#2563EB"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.4"
    />
  </svg>
);

const BenefitCard: React.FC<BenefitCardProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <div className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 transition-colors duration-300 group-hover:bg-blue-100">
        {icon}
      </div>
      <h3
        className="mb-2 text-base font-semibold"
        style={{ color: COLORS.textDark }}
      >
        {title}
      </h3>

      <p
        className="text-sm leading-relaxed"
        style={{ color: COLORS.textSecondary }}
      >
        {description}
      </p>
    </div>
  );
};

export default function BenefitsSection() {
  const benefits = [
    {
      icon: <IconTracking />,
      title: "Tracking Real-time",
      description: "Lacak posisi angkot secara langsung dan akurat.",
    },
    {
      icon: <IconRoute />,
      title: "Rute Lengkap",
      description: "Semua informasi rute angkot di Kota Malang tersedia.",
    },
    {
      icon: <IconClock />,
      title: "Estimasi Kedatangan",
      description: "Ketahui estimasi waktu angkot tiba di halte terdekat.",
    },
    {
      icon: <IconWallet />,
      title: "Transportasi Terjangkau",
      description: "Naik angkot makin mudah, hemat, dan nyaman.",
    },
  ];

  return (
    <section
      id="benefits"
      className="relative overflow-hidden bg-white py-12 md:py-16"
    >
      {/* LEFT DECORATION */}
      <div className="pointer-events-none absolute left-0 top-0 hidden h-full w-[220px] lg:block xl:w-[300px]">
        <img
          src="/left_benefits.png"
          alt=""
          className="h-full w-full select-none object-cover object-right opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-white" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white" />
      </div>

      {/* RIGHT DECORATION */}
      <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-[220px] lg:block xl:w-[300px]">
        <img
          src="/right_benefits.png"
          alt=""
          className="h-full w-full select-none object-cover object-left opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/70 to-white" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <div className="mb-10 text-center">
          <span
            className="mb-3 inline-block rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold tracking-[2px]"
            style={{ color: COLORS.accent }}
          >
            {" "}
            BENEFITS
          </span>
          <h2
            className={`${TYPOGRAPHY.heading} text-3xl lg:text-4xl`}
            style={{ color: COLORS.textDark }}
          >
            {" "}
            Perjalanan Lebih Mudah
            <br />
            Setiap Hari
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={index}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
