import React from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import TrustBanner from "@/components/landing/TrustBanner";
import Reviews from "@/components/landing/Reviews";
import AccidentTypes from "@/components/landing/AccidentTypes";
import WhoBenefits from "@/components/landing/WhoBenefits";
import Transformation from "@/components/landing/Transformation";
import HowItWorks from "@/components/landing/HowItWorks";
import RecentWins from "@/components/landing/RecentWins";
import AboutUs from "@/components/landing/AboutUs";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <TrustBanner />
      <Reviews />
      <AccidentTypes />
      <WhoBenefits />
      <Transformation />
      <HowItWorks />
      <RecentWins />
      <AboutUs />
      <FAQ />
      <Footer />
    </div>
  );
}