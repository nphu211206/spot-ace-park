import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { PopularLocationsSection } from '@/components/home/PopularLocationsSection';
import { CarFinderSpotlight } from '@/components/home/CarFinderSpotlight';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { DriverBenefitsSection } from '@/components/home/DriverBenefitsSection';
import { TrustPartnersSection } from '@/components/home/TrustPartnersSection';
import { Footer } from '@/components/home/Footer';

export default function Index() {
  return (
    <div className="min-h-screen bg-[#070709] text-white selection:bg-[#c9b586] selection:text-black">
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
