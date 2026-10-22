import { motion } from "framer-motion";
import { Zap, Radio, CheckCircle2, TrendingUp, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TelemetryHub {
  city: "HN" | "HCM";
  name: string;
  freeSpots: number;
  totalSpots: number;
  evReady: number;
  price: string;
  trend: string;
}

const HUBS: TelemetryHub[] = [
  { city: "HN", name: "Vincom Mega Mall Times City", freeSpots: 45, totalSpots: 56, evReady: 6, price: "25k/h", trend: "-2 ô vừa vào" },
  { city: "HN", name: "Vincom Center Bà Triệu", freeSpots: 28, totalSpots: 56, evReady: 4, price: "30k/h", trend: "Đang ổn định" },
  { city: "HN", name: "Vincom Mega Mall Royal City", freeSpots: 61, totalSpots: 80, evReady: 8, price: "25k/h", trend: "+5 ô vừa trống" },
  { city: "HCM", name: "Landmark 81 Smart Parking", freeSpots: 22, totalSpots: 56, evReady: 6, price: "22k/h", trend: "Hầm B2 thông thoáng" },
  { city: "HCM", name: "Vincom Center Đồng Khởi", freeSpots: 14, totalSpots: 56, evReady: 4, price: "25k/h", trend: "Sắp đầy 88%" },
];

export const LiveTelemetryTicker = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full border-y border-cyan-500/20 bg-slate-950/80 backdrop-blur-md overflow-hidden py-2.5 z-20 relative">
      <div className="flex items-center">
        {/* Left Indicator Tag */}
        <div className="flex items-center gap-2 pl-4 pr-3 shrink-0 border-r border-slate-800 text-[11px] font-bold uppercase tracking-wider text-cyan-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
          <span className="hidden sm:inline">LIVE TELEMETRY:</span>
        </div>

        {/* Marquee Scroller */}
        <div className="flex overflow-hidden whitespace-nowrap [mask-image:linear-gradient(to_right,transparent,white_40px,white_calc(100%-40px),transparent)]">
          <motion.div
            className="flex gap-8 items-center px-4"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 32 }}
          >
            {[...HUBS, ...HUBS].map((hub, idx) => (
              <div
                key={idx}
                onClick={() => navigate("/parking")}
                className="flex items-center gap-3 text-xs cursor-pointer text-slate-300 hover:text-cyan-300 transition-colors group"
              >
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-black text-cyan-300 border border-cyan-500/30">
                  {hub.city}
                </span>
                <span className="font-semibold text-white group-hover:underline">
                  {hub.name}
                </span>
                <span className="flex items-center gap-1 font-bold text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  {hub.freeSpots}/{hub.totalSpots} ô trống
                </span>
                <span className="flex items-center gap-1 font-medium text-amber-300 text-[11px]">
                  <Zap className="h-3 w-3 fill-amber-300" />
                  {hub.evReady} sạc EV
                </span>
                <span className="text-[11px] text-slate-400">
                  • {hub.price}
                </span>
                <span className="text-[10px] text-slate-500 italic">
                  ({hub.trend})
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Quick CTA */}
        <button
          onClick={() => navigate("/parking")}
          className="hidden md:flex items-center gap-1 pr-4 pl-3 shrink-0 text-xs font-semibold text-cyan-400 hover:text-cyan-300 border-l border-slate-800 transition-colors"
        >
          <Navigation className="h-3 w-3" />
          <span>Bản đồ 3D</span>
        </button>
      </div>
    </div>
  );
};
