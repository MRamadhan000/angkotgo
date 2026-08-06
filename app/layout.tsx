import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/landingPage/Navbar";
import Footer from "@/components/landingPage/Footer";
import { AuthProvider } from "@/context/AuthContext"; // 👈 Impor AuthProvider

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AngkotGo",
  description: "Platform manajemen angkutan umum",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-white font-sans">
        {/* Bungkus dengan AuthProvider agar semua halaman bisa akses data login */}
        <AuthProvider>
          {/* <Navbar /> */}

          <main>{children}</main>

          {/* <Footer /> */}
        </AuthProvider>
      </body>
    </html>
  );
}