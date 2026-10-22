import Header from "@/components/layout/Header";
import HeroSection from "@/components/home/HeroSection";
import { LiveTelemetryTicker } from "@/components/home/LiveTelemetryTicker";
import { PopularLocationsSection } from "@/components/home/PopularLocationsSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { DriverBenefitsSection } from "@/components/home/DriverBenefitsSection";
import { CarFinderSpotlight } from "@/components/home/CarFinderSpotlight";
import { TrustPartnersSection } from "@/components/home/TrustPartnersSection";
import { HomeFooter } from "@/components/home/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500 selection:text-black">
      <Header />
      <LiveTelemetryTicker />
      <HeroSection />
      <PopularLocationsSection />
      <CarFinderSpotlight />
      <HowItWorksSection />
      <DriverBenefitsSection />
      <TrustPartnersSection />
      <HomeFooter />
    </div>
  );
};

export default Index;
