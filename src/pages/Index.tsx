import Header from "@/components/layout/Header";
import HeroSection from "@/components/home/HeroSection";
import { LiveTelemetryTicker } from "@/components/home/LiveTelemetryTicker";
import { BentoGridSection } from "@/components/home/BentoGridSection";
import FeaturesSection from "@/components/home/FeaturesSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500 selection:text-black">
      <Header />
      <LiveTelemetryTicker />
      <HeroSection />
      <BentoGridSection />
      <FeaturesSection />
    </div>
  );
};

export default Index;
