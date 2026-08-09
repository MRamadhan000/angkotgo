"use client";

import Navbar from "@/components/landingPage/Navbar";
import HeroSection from "@/components/landingPage/HeroSection";
import BenefitsSection from "@/components/landingPage/BenefitSection";
import AboutFeaturesSection from "@/components/landingPage/AboutFeaturesSection";
import CtaSection from "@/components/landingPage/CtaSection";
import Footer from "@/components/landingPage/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <BenefitsSection />
      <AboutFeaturesSection />
      <CtaSection />
      <Footer />
    </>
  );
}
