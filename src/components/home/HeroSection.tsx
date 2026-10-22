import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  Search,
  ArrowRight,
  Sparkles,
  Car,
  Bike,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Compass,
  Star,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const QUICK_LOCATIONS = [
  { name: "Times City", city: "Hà Nội", search: "Times City" },
  { name: "Vincom Bà Triệu", city: "Hà Nội", search: "Vincom Center Bà Triệu" },
  { name: "Royal City", city: "Hà Nội", search: "Royal City" },
  { name: "Landmark 81", city: "TP.HCM", search: "Landmark 81" },
  { name: "Aeon Mall Long Biên", city: "Hà Nội", search: "Aeon Mall" },
];

const TIME_OPTIONS = [
  "Đến ngay bây giờ",
  "Hôm nay, 18:00 - 21:00",
  "Hôm nay, 19:00 - 22:00",
  "Ngày mai, 08:30 - 12:00",
  "Cuối tuần này",
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [vehicleType, setVehicleType] = useState<"car" | "bike" | "ev">("car");
  const [destination, setDestination] = useState("");
  const [timeSelection, setTimeSelection] = useState(TIME_OPTIONS[0]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = (customQuery?: string) => {
    const q = customQuery !== undefined ? customQuery : destination;
    if (q.trim()) {
      navigate(`/parking?search=${encodeURIComponent(q.trim())}&vehicle=${vehicleType}`);
    } else {
      navigate(`/parking?vehicle=${vehicleType}`);
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-950 py-16 md:py-24">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-blue-600/20 via-cyan-500/10 to-transparent blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-10 w-[500px] h-[350px] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-5xl">
        {/* Top Trust Badge */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs md:text-sm font-semibold backdrop-blur-md shadow-lg shadow-cyan-500/5"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Đỗ xe thảnh thơi tại các trung tâm thương mại & tòa nhà lớn</span>
          </motion.div>
        </div>

        {/* Main Driver Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-5">
            Tìm & Đặt Chỗ Đỗ Xe{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
              Trong Tích Tắc
            </span>
          </h1>
          <p className="text-slate-300 text-base md:text-xl max-w-3xl mx-auto leading-relaxed font-normal">
            Biết trước bãi xe còn bao nhiêu chỗ và giá cước trước khi xuất phát. Chỉ đường vào tận hầm và dễ dàng tìm lại xe bằng bản đồ 3D trực quan.
          </p>
        </motion.div>

        {/* Centerpiece Search & Booking Widget */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-3xl border border-slate-700/70 bg-slate-900/90 shadow-2xl shadow-black/80 backdrop-blur-2xl p-4 md:p-6 mb-8 relative"
        >
          {/* Vehicle Type Tabs */}
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800/80">
            <button
              onClick={() => setVehicleType("car")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                vehicleType === "car"
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Car className="w-4 h-4" />
              Ô tô
            </button>
            <button
              onClick={() => setVehicleType("bike")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                vehicleType === "bike"
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Bike className="w-4 h-4" />
              Xe máy
            </button>
            <button
              onClick={() => setVehicleType("ev")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                vehicleType === "ev"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Zap className="w-4 h-4" />
              Xe điện (EV Sạc)
            </button>
          </div>

          {/* Search Inputs Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Destination Input */}
            <div className="md:col-span-6 relative">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Điểm đến / Tòa nhà / Trung tâm thương mại
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Ví dụ: Times City, Royal City, Landmark 81..."
                  className="w-full h-12 bg-slate-950/90 border border-slate-700 rounded-2xl px-4 pl-11 text-white text-sm md:text-base placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                />
                <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Autocomplete suggestions dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl z-30">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
                    Gợi ý bãi đỗ xe phổ biến
                  </div>
                  {QUICK_LOCATIONS.map((loc, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setDestination(loc.search);
                        setShowSuggestions(false);
                        handleSearch(loc.search);
                      }}
                      className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs md:text-sm text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      <span className="font-bold flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        {loc.name}
                      </span>
                      <span className="text-slate-500 text-xs">{loc.city}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Arrival Time Selector */}
            <div className="md:col-span-3">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Thời gian dự kiến
              </label>
              <select
                value={timeSelection}
                onChange={(e) => setTimeSelection(e.target.value)}
                className="w-full h-12 bg-slate-950/90 border border-slate-700 rounded-2xl px-4 text-white text-xs md:text-sm font-medium focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              >
                {TIME_OPTIONS.map((time, idx) => (
                  <option key={idx} value={time} className="bg-slate-900 text-white">
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* CTA Search Button */}
            <div className="md:col-span-3 md:self-end pt-2 md:pt-0">
              <Button
                onClick={() => handleSearch()}
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm md:text-base rounded-2xl shadow-xl shadow-cyan-500/25 transition-all group"
              >
                <span>Tìm Chỗ Đỗ Ngay</span>
                <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Quick Choice Chips */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold mr-1">Tìm nhanh:</span>
            {QUICK_LOCATIONS.map((loc, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDestination(loc.search);
                  handleSearch(loc.search);
                }}
                className="px-3 py-1 rounded-full bg-slate-800/70 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all font-medium"
              >
                {loc.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* 3 Driver Reassurance Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2.5 text-xs md:text-sm text-slate-300 font-medium py-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Giữ chỗ trước 100% khi đến bãi</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 text-xs md:text-sm text-slate-300 font-medium py-2">
            <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Dẫn đường 3D tìm xe trong hầm</span>
          </div>
          <div className="flex items-center justify-center gap-2.5 text-xs md:text-sm text-slate-300 font-medium py-2">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Vào ra tự động với VETC & ePass</span>
          </div>
        </div>

        {/* Social Proof Counter */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-slate-800/80 text-center">
          <div>
            <div className="text-2xl md:text-3xl font-black text-cyan-400 font-mono">5.200+</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Chỗ đỗ liên kết toàn quốc</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-emerald-400 font-mono">99.8%</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Độ chính xác số chỗ trống</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-sky-400 font-mono">&lt; 30 giây</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Thời gian đặt trước chỗ</div>
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-amber-400 font-mono flex items-center justify-center gap-1">
              <span>4.9</span>
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">Đánh giá hài lòng tài xế</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
