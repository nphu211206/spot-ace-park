import React from 'react';
import Header from '@/components/layout/Header';
import { HeroSection } from '@/components/home/HeroSection';
import { PopularLocationsSection } from '@/components/home/PopularLocationsSection';
import { CarFinderSpotlight } from '@/components/home/CarFinderSpotlight';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { DriverBenefitsSection } from '@/components/home/DriverBenefitsSection';
import { TrustPartnersSection } from '@/components/home/TrustPartnersSection';
import { Footer } from '@/components/home/Footer';

export default function Index() {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-900 selection:bg-blue-600 selection:text-white">
      <Header />
      <HeroSection />
      <PopularLocationsSection />
      <CarFinderSpotlight />
      <HowItWorksSection />
      <DriverBenefitsSection />
      <TrustPartnersSection />
      <Footer />
    </div>
  );
}
