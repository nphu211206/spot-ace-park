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
    <div className="relative min-h-[88vh] flex flex-col justify-center items-center overflow-hidden bg-[#faf9f6] text-slate-900 pt-12 pb-16">
      {/* Background with Luminous Architectural Depth & Warm Champagne Mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,181,134,0.18)_0%,rgba(250,249,246,0.85)_50%,#faf9f6_100%)]" />
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-blue-50/40 via-transparent to-transparent" />
      </div>

      {/* Live Telemetry Ticker (Luminous Style) */}
      <div className="relative z-10 w-full max-w-7xl px-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3 py-2 px-5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-sm text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="tracking-[0.18em] font-bold text-slate-800 uppercase">MẠNG LƯỚI BÃI ĐỖ THỜI GIAN THỰC</span>
          </div>

          <div className="flex items-center gap-6 overflow-x-auto text-slate-600">
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <span className="text-slate-900 font-semibold">Vincom Times City:</span>
              <span className="text-emerald-600 font-bold">45/56 ô trống</span>
              <span className="text-amber-600 font-medium">⚡ 6 sạc EV</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5">
              <span className="text-slate-900 font-semibold">Vincom Bà Triệu:</span>
              <span className="text-emerald-600 font-bold">28/56 ô trống</span>
              <span className="text-slate-500">• 30k/h</span>
            </span>
            <span className="hidden lg:inline-flex items-center gap-1.5">
              <span className="text-slate-900 font-semibold">Landmark 81:</span>
              <span className="text-emerald-600 font-bold">22/56 ô trống</span>
              <span className="text-amber-600 font-medium">⚡ DC 60kW</span>
            </span>
          </div>

          <button
            onClick={() => navigate('/parking')}
            className="text-blue-700 hover:text-blue-800 transition-colors flex items-center gap-1 font-semibold tracking-wider"
          >
            <span>SƠ ĐỒ 3D HẦM</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Brand Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#c9b586]/40 text-amber-900 text-xs font-bold tracking-[0.2em] uppercase mb-6 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Hệ Thống Spot Ace Park • Toàn Diện</span>
        </motion.div>

        {/* Exact Title from User Image 3 */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.14]"
        >
          Kết Nối Mạng Lưới Bãi Đỗ Xe <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-amber-700 font-black">
            Trạm Sạc Thông Minh.
          </span>
        </motion.h1>

        {/* Clear, Driver-Centric Subtitle (No fluff) */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed font-normal"
        >
          Spot Ace Park giúp bạn kiểm tra số ô trống thực tế, đặt trước chỗ đỗ ô tô, xe máy và trạm sạc EV chỉ trong 30 giây. 
          Tự động nhận diện biển số qua barie và định vị 3D dẫn lối trong hầm không cần GPS.
        </motion.p>

        {/* Luminous Concierge Booking Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-4xl mx-auto rounded-3xl bg-white border border-[#c9b586]/35 p-5 sm:p-7 shadow-[0_12px_45px_rgba(0,0,0,0.06)] text-left"
        >
          {/* Vehicle Type Tabs */}
          <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-4">
            <button
              type="button"
              onClick={() => setVehicleType('car')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wider transition-all duration-200 ${
                vehicleType === 'car'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Ô TÔ</span>
            </button>

            <button
              type="button"
              onClick={() => setVehicleType('bike')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wider transition-all duration-200 ${
                vehicleType === 'bike'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>XE MÁY</span>
            </button>

            <button
              type="button"
              onClick={() => setVehicleType('ev')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wider transition-all duration-200 ${
                vehicleType === 'ev'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-200" />
              <span>XE ĐIỆN (EV SẠC)</span>
            </button>
          </div>

          {/* Form Inputs & CTA */}
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
            {/* Destination */}
            <div className="md:col-span-6 relative">
              <label className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                ĐIỂM ĐẾN / TTTM / ĐẠI ĐÔ THỊ
              </label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-3.5 w-4 h-4 text-blue-700" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Ví dụ: Times City, Royal City, Landmark 81..."
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-blue-700 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Arrival Time */}
            <div className="md:col-span-3 relative">
              <label className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-1.5">
                THỜI GIAN ĐẾN
              </label>
              <div className="relative flex items-center">
                <Clock className="absolute left-3.5 w-4 h-4 text-blue-700" />
                <select
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  className="w-full pl-10 pr-8 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-700 focus:bg-white appearance-none cursor-pointer transition-all"
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
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition-all shadow-md"
              >
                <span>TÌM CHỖ ĐỖ NGAY</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Destination Chips */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 flex-wrap">
            <span className="text-xs text-slate-500 font-medium mr-1">Tìm nhanh:</span>
            {popularChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setDestination(chip);
                  navigate(`/parking?location=${encodeURIComponent(chip)}&type=${vehicleType}`);
                }}
                className="text-xs px-3 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-700 hover:border-blue-300 transition-all duration-150"
              >
                {chip}
              </button>
            ))}
          </div>
        </motion.div>

        {/* 3 Driver Guarantees */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 max-w-4xl mx-auto text-left">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/50 flex items-center justify-center text-blue-700 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Giữ chỗ 100% trước khi đến</div>
              <div className="text-[11px] text-slate-500">Biết trước số ô trống thực tế</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/50 flex items-center justify-center text-blue-700 shrink-0">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Dẫn đường 3D xuyên hầm</div>
              <div className="text-[11px] text-slate-500">Tìm lại xe chuẩn xác không cần GPS</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/50 flex items-center justify-center text-emerald-600 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Vào ra tự động với VETC & ePass</div>
              <div className="text-[11px] text-slate-500">Camera nhận diện biển số mở barie</div>
            </div>
          </div>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-14 pt-10 border-t border-slate-200 max-w-4xl mx-auto">
          <div>
            <div className="font-sans text-3xl sm:text-4xl font-extrabold text-blue-800 font-bold">5.200+</div>
            <div className="text-xs text-slate-600 font-semibold uppercase tracking-wider mt-1">Chỗ đỗ liên kết</div>
          </div>
          <div>
            <div className="font-sans text-3xl sm:text-4xl font-extrabold text-blue-800 font-bold">99.8%</div>
            <div className="text-xs text-slate-600 font-semibold uppercase tracking-wider mt-1">Độ chính xác số ô</div>
          </div>
          <div>
            <div className="font-sans text-3xl sm:text-4xl font-extrabold text-blue-800 font-bold">&lt; 30s</div>
            <div className="text-xs text-slate-600 font-semibold uppercase tracking-wider mt-1">Thời gian đặt chỗ</div>
          </div>
          <div>
            <div className="font-sans text-3xl sm:text-4xl font-extrabold text-amber-600 font-bold">4.9 ★</div>
            <div className="text-xs text-slate-600 font-semibold uppercase tracking-wider mt-1">Đánh giá tài xế</div>
          </div>
        </div>
      </div>
    </div>
  );
}
