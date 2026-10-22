import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Clock, Car, Bike, Zap, ArrowRight, ShieldCheck, Navigation, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function HeroSection() {
  const navigate = useNavigate();
  const [vehicleType, setVehicleType] = useState<'car' | 'bike' | 'ev'>('car');
  const [destination, setDestination] = useState('');
  const [arrivalTime, setArrivalTime] = useState('now');

  const popularChips = [
    'Times City',
    'Vincom Bà Triệu',
    'Royal City',
    'Landmark 81',
    'Aeon Mall Long Biên'
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const target = destination.trim() || 'Times City';
    navigate(`/parking?location=${encodeURIComponent(target)}&type=${vehicleType}`);
  };

  return (
    <div className="relative min-h-[92vh] flex flex-col justify-center items-center overflow-hidden bg-[#070709] text-white pt-24 pb-16">
      {/* Background with Cinematic Architectural Image & Ambient Luxury Vignette */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/luxury_hero_arrival.jpg"
          alt="Luxury Automotive Arrival"
          className="w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-[10000ms] ease-out"
          style={{ animation: 'pulse 12s infinite alternate ease-in-out' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-[#070709]/75 to-[#070709]/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,181,134,0.08)_0%,transparent_70%)]" />
      </div>

      {/* Floating Ticker - Haute Telemetry */}
      <div className="relative z-10 w-full max-w-7xl px-4 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-3 py-2 px-5 rounded-full bg-[#121217]/85 backdrop-blur-md border border-[#c9b586]/25 shadow-[0_4px_24px_rgba(0,0,0,0.5)] text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c9b586] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c9b586]"></span>
            </span>
            <span className="tracking-[0.2em] font-medium text-[#c9b586] uppercase">HAUTE MOBILITY TELEMETRY</span>
          </div>

          <div className="flex items-center gap-6 overflow-x-auto text-slate-300">
            <span className="hidden sm:inline-flex items-center gap-2">
              <span className="text-white font-medium">Vincom Times City:</span>
              <span className="text-emerald-400 font-semibold">45/56 ô trống</span>
              <span className="text-amber-400">⚡ 6 sạc EV</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-2">
              <span className="text-white font-medium">Vincom Bà Triệu:</span>
              <span className="text-emerald-400 font-semibold">28/56 ô trống</span>
              <span className="text-slate-400">• 30k/h</span>
            </span>
            <span className="hidden lg:inline-flex items-center gap-2">
              <span className="text-white font-medium">Landmark 81:</span>
              <span className="text-emerald-400 font-semibold">22/56 ô trống</span>
              <span className="text-amber-400">⚡ DC 60kW</span>
            </span>
          </div>

          <button
            onClick={() => navigate('/parking')}
            className="text-[#c9b586] hover:text-white transition-colors flex items-center gap-1 font-medium tracking-wider"
          >
            <span>SƠ ĐỒ 3D HẦM</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Overline Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1a1a22]/80 border border-[#c9b586]/30 text-[#c9b586] text-xs font-semibold tracking-[0.25em] uppercase mb-6 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#c9b586]" />
          <span>Haute Precision Parking • Việt Nam</span>
        </motion.div>

        {/* Grand Headline with Cormorant Garamond Serif */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight text-white mb-6 leading-[1.08]"
        >
          Nghệ Thuật Đỗ Xe <br className="hidden sm:inline" />
          <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#dfd2b5] via-[#c9b586] to-[#b39e6a]">
            Chuẩn Xác & Thư Thái
          </span>
        </motion.h1>

        {/* Subtitle in High-Contrast Crisp Ivory */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-base sm:text-lg md:text-xl text-slate-200 font-light max-w-3xl mx-auto mb-10 leading-relaxed tracking-wide"
        >
          Định nghĩa lại trải nghiệm gửi xe tại các trung tâm thương mại và đại đô thị cao cấp.
          Biết trước số ô trống thực tế, đặt trước chỗ hoàn hảo và dẫn lối 3D xuyên suốt các tầng hầm sâu nhất.
        </motion.p>

        {/* Luxury Booking Concierge Terminal */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="w-full max-w-4xl mx-auto rounded-3xl bg-[#101015]/90 backdrop-blur-xl border border-[#c9b586]/30 p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-left"
        >
          {/* Vehicle Type Tabs */}
          <div className="flex items-center gap-2 mb-5 border-b border-white/10 pb-4">
            <button
              type="button"
              onClick={() => setVehicleType('car')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 ${
                vehicleType === 'car'
                  ? 'bg-gradient-to-r from-[#c9b586] to-[#b39e6a] text-black shadow-[0_4px_16px_rgba(201,181,134,0.35)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Ô TÔ</span>
            </button>

            <button
              type="button"
              onClick={() => setVehicleType('bike')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 ${
                vehicleType === 'bike'
                  ? 'bg-gradient-to-r from-[#c9b586] to-[#b39e6a] text-black shadow-[0_4px_16px_rgba(201,181,134,0.35)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>XE MÁY</span>
            </button>

            <button
              type="button"
              onClick={() => setVehicleType('ev')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 ${
                vehicleType === 'ev'
                  ? 'bg-gradient-to-r from-[#c9b586] to-[#b39e6a] text-black shadow-[0_4px_16px_rgba(201,181,134,0.35)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>XE ĐIỆN (EV SẠC)</span>
            </button>
          </div>

          {/* Search Inputs & Action Button */}
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Destination Input */}
            <div className="md:col-span-6 relative">
              <label className="block text-[11px] font-semibold text-[#c9b586] tracking-[0.2em] uppercase mb-1.5">
                ĐIỂM ĐẾN / TTTM / ĐẠI ĐÔ THỊ
              </label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-3.5 w-4 h-4 text-[#c9b586]" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Ví dụ: Times City, Royal City, Landmark 81..."
                  className="w-full pl-10 pr-4 py-3.5 bg-[#181820] border border-white/10 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#c9b586] transition-colors"
                />
              </div>
            </div>

            {/* Arrival Time */}
            <div className="md:col-span-3 relative">
              <label className="block text-[11px] font-semibold text-[#c9b586] tracking-[0.2em] uppercase mb-1.5">
                THỜI GIAN ĐẾN
              </label>
              <div className="relative flex items-center">
                <Clock className="absolute left-3.5 w-4 h-4 text-[#c9b586]" />
                <select
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  className="w-full pl-10 pr-8 py-3.5 bg-[#181820] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#c9b586] appearance-none cursor-pointer"
                >
                  <option value="now">Đến ngay bây giờ</option>
                  <option value="30m">Sau 30 phút nữa</option>
                  <option value="1h">Sau 1 giờ nữa</option>
                  <option value="tonight">Tối nay (18:00 - 22:00)</option>
                </select>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="md:col-span-3 md:self-end">
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#dfd2b5] via-[#c9b586] to-[#b39e6a] text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_4px_20px_rgba(201,181,134,0.4)]"
              >
                <span>TÌM CHỖ ĐỖ NGAY</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Destination Chips */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5 flex-wrap">
            <span className="text-xs text-slate-400 font-medium mr-1">Tìm nhanh:</span>
            {popularChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setDestination(chip);
                  navigate(`/parking?location=${encodeURIComponent(chip)}&type=${vehicleType}`);
                }}
                className="text-xs px-3 py-1 rounded-lg bg-white/5 hover:bg-[#c9b586]/20 border border-white/10 hover:border-[#c9b586]/40 text-slate-300 hover:text-white transition-all duration-200"
              >
                {chip}
              </button>
            ))}
          </div>
        </motion.div>

        {/* 3 Driver Guarantees */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 max-w-4xl mx-auto text-left">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="w-8 h-8 rounded-full bg-[#c9b586]/10 flex items-center justify-center text-[#c9b586]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Giữ chỗ 100% trước khi đến</div>
              <div className="text-[11px] text-slate-400">Không lo hết chỗ giờ cao điểm</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="w-8 h-8 rounded-full bg-[#c9b586]/10 flex items-center justify-center text-[#c9b586]">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Dẫn đường 3D xuyên hầm</div>
              <div className="text-[11px] text-slate-400">Định vị chính xác không cần GPS</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="w-8 h-8 rounded-full bg-[#c9b586]/10 flex items-center justify-center text-[#c9b586]">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Vào ra tự động với VETC & ePass</div>
              <div className="text-[11px] text-slate-400">Nhận diện biển số mở barie tức thì</div>
            </div>
          </div>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-14 pt-10 border-t border-white/10 max-w-4xl mx-auto">
          <div>
            <div className="font-serif text-3xl sm:text-4xl text-[#dfd2b5] font-light">5.200+</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Chỗ đỗ liên kết</div>
          </div>
          <div>
            <div className="font-serif text-3xl sm:text-4xl text-[#dfd2b5] font-light">99.8%</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Độ chính xác số ô</div>
          </div>
          <div>
            <div className="font-serif text-3xl sm:text-4xl text-[#dfd2b5] font-light">&lt; 30s</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Thời gian đặt chỗ</div>
          </div>
          <div>
            <div className="font-serif text-3xl sm:text-4xl text-[#dfd2b5] font-light">4.9 ★</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Đánh giá tài xế</div>
          </div>
        </div>
      </div>
    </div>
  );
}
