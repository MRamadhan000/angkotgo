import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Sidebar from "@/components/driver/Sidebar";
import TopBar from "@/components/driver/TopBar";
// import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AngkotGo – Driver Dashboard",
  description: "Kelola operasional angkot Anda dengan mudah.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-gray-50 antialiased`}>
        <Sidebar />
        <div className="ml-[210px]">
          <TopBar />
          <main className="pt-[72px] min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}