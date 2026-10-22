import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Zap, ShieldCheck, ArrowRight, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

export function PopularLocationsSection() {
  const navigate = useNavigate();

  const locations = [
    {
      id: 'times-city',
      name: 'Vincom Mega Mall Times City',
      tag: '01 / TỔ HỢP ĐÔ THỊ ĐẲNG CẤP',
      address: '458 Minh Khai, Vĩnh Tuy, Hai Bà Trưng (Hà Nội)',
      level: 'Hầm B2 (Xe máy) & B3 (Ô tô)',
      availableSlots: 45,
      totalSlots: 56,
      rate: '25.000đ/h',
      features: ['Trụ sạc nhanh VinFast', 'Hỗ trợ tìm xe 3D', 'Barie tự động VETC'],
      slug: '/parking?hub=times-city',
      isHero: true,
      image: '/images/luxury_hero_arrival.jpg',
    },
    {
      id: 'ba-trieu',
      name: 'Vincom Center Bà Triệu',
      tag: '02 / TRUNG TÂM PHỐ CỔ',
      address: '191 Bà Triệu, Lê Đại Hành, Hai Bà Trưng (Hà Nội)',
      level: 'Hầm B2 & B3 (Ô tô), B1 (Xe máy)',
      availableSlots: 28,
      totalSlots: 56,
      rate: '30.000đ/h',
      features: ['Trụ sạc xe điện', 'Camera AI nhận diện', 'Barie tự động VETC'],
      slug: '/parking?hub=ba-trieu',
      isHero: false,
    },
    {
      id: 'royal-city',
      name: 'Vincom Mega Mall Royal City',
      tag: '03 / HẦM ĐỖ RỘNG NHẤT MIỀN BẮC',
      address: '72A Nguyễn Trãi, Thượng Đình, Thanh Xuân (Hà Nội)',
      level: 'Hầm B1 - B3 (Khu R1 đến R6 có linh vật)',
      availableSlots: 61,
      totalSlots: 80,
      rate: '25.000đ/h',
      features: ['Dẫn đường 3D phân khu', 'Sạc xe điện VinFast', 'Liên thông VETC'],
      slug: '/parking?hub=royal-city',
      isHero: false,
    },
    {
      id: 'landmark-81',
      name: 'Landmark 81 Smart Parking',
      tag: '04 / TÒA THÁP BIỂU TƯỢNG TP. HỒ CHÍ MINH',
      address: '208 Nguyễn Hữu Cảnh, P. 22, Bình Thạnh (TP. Hồ Chí Minh)',
      level: 'Hầm B2 & B3 cao cấp',
      availableSlots: 22,
      totalSlots: 56,
      rate: '22.000đ/h',
      features: ['Trạm sạc siêu nhanh 60kW', 'Đỗ xe tự động VIP', 'Hỗ trợ 24/7'],
      slug: '/parking?hub=landmark-81',
      isHero: true,
      image: '/images/luxury_hub_architecture.jpg',
    },
  ];

  return (
    <section className="py-24 bg-[#0a0a0e] text-white border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-white/10">
          <div>
            <div className="text-xs font-semibold text-[#c9b586] tracking-[0.25em] uppercase mb-2">
              BỘ SƯU TẬP ĐIỂM ĐỖ HAUTE SELECTION
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white">
              Các Không Gian Đỗ Xe Tiêu Biểu
            </h2>
            <p className="text-slate-400 text-sm md:text-base mt-2 max-w-xl font-light">
              Được tuyển chọn tại các tổ hợp trung tâm thương mại và đại đô thị danh giá nhất Hà Nội & TP. Hồ Chí Minh.
            </p>
          </div>

          <button
            onClick={() => navigate('/parking')}
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-[#c9b586] hover:text-white uppercase transition-colors"
          >
            <span>XEM TẤT CẢ TRÊN BẢN ĐỒ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Asymmetrical Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Card 1: Large Spotlight - Times City */}
          <div className="md:col-span-12 lg:col-span-7 rounded-3xl overflow-hidden bg-[#121218] border border-[#c9b586]/30 shadow-2xl relative group">
            <div className="h-72 sm:h-80 w-full overflow-hidden relative">
              <img
                src={locations[0].image}
                alt={locations[0].name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121218] via-[#121218]/50 to-transparent" />
              <div className="absolute top-5 left-5 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#c9b586]/40 text-[#c9b586] text-[11px] font-semibold tracking-wider uppercase">
                {locations[0].tag}
              </div>
              <div className="absolute top-5 right-5 bg-emerald-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                Còn {locations[0].availableSlots}/{locations[0].totalSlots} ô trống
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-white mb-2">
                {locations[0].name}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-6">
                <MapPin className="w-3.5 h-3.5 text-[#c9b586]" />
                <span>{locations[0].address}</span>
              </p>

              <div className="grid grid-cols-2 gap-4 py-4 px-5 rounded-2xl bg-white/[0.03] border border-white/5 mb-6 text-sm">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider">Vị trí hầm</div>
                  <div className="font-medium text-white mt-0.5">{locations[0].level}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider">Giá niêm yết</div>
                  <div className="font-serif text-lg text-[#dfd2b5] mt-0.5">{locations[0].rate}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {locations[0].features.map((feat, idx) => (
                  <span key={idx} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                    {feat}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(locations[0].slug)}
                  className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-[#dfd2b5] via-[#c9b586] to-[#b39e6a] text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                >
                  <span>ĐẶT CHỖ TẠI ĐÂY</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate(locations[0].slug)}
                  className="py-3 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs tracking-wider uppercase transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4 text-[#c9b586]" />
                  <span>XEM SƠ ĐỒ 3D</span>
                </button>
              </div>
            </div>
          </div>

          {/* Staggered Vertical Cards - Ba Trieu & Royal City */}
          <div className="md:col-span-12 lg:col-span-5 flex flex-col justify-between gap-6">
            {/* Card 2: Ba Trieu */}
            <div className="rounded-3xl p-6 sm:p-7 bg-[#121218] border border-white/10 hover:border-[#c9b586]/40 transition-all duration-300">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-semibold text-[#c9b586] tracking-widest uppercase">
                  {locations[1].tag}
                </span>
                <span className="text-xs text-emerald-400 font-semibold px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/20">
                  Còn {locations[1].availableSlots}/{locations[1].totalSlots} ô
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-normal text-white mb-1">
                {locations[1].name}
              </h3>
              <p className="text-xs text-slate-400 mb-4">{locations[1].address}</p>
              <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-white/[0.02] border border-white/5 mb-4 text-xs">
                <span className="text-slate-400">{locations[1].level}</span>
                <span className="font-serif text-base text-[#dfd2b5]">{locations[1].rate}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(locations[1].slug)}
                  className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-[#c9b586] hover:text-black border border-white/10 text-xs font-semibold tracking-wider uppercase transition-all"
                >
                  ĐẶT CHỖ TRƯỚC
                </button>
                <button
                  onClick={() => navigate(locations[1].slug)}
                  className="px-3.5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition-colors"
                >
                  3D
                </button>
              </div>
            </div>

            {/* Card 3: Royal City */}
            <div className="rounded-3xl p-6 sm:p-7 bg-[#121218] border border-white/10 hover:border-[#c9b586]/40 transition-all duration-300">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-semibold text-[#c9b586] tracking-widest uppercase">
                  {locations[2].tag}
                </span>
                <span className="text-xs text-emerald-400 font-semibold px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/20">
                  Còn {locations[2].availableSlots}/{locations[2].totalSlots} ô
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-normal text-white mb-1">
                {locations[2].name}
              </h3>
              <p className="text-xs text-slate-400 mb-4">{locations[2].address}</p>
              <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-white/[0.02] border border-white/5 mb-4 text-xs">
                <span className="text-slate-400">{locations[2].level}</span>
                <span className="font-serif text-base text-[#dfd2b5]">{locations[2].rate}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(locations[2].slug)}
                  className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-[#c9b586] hover:text-black border border-white/10 text-xs font-semibold tracking-wider uppercase transition-all"
                >
                  ĐẶT CHỖ TRƯỚC
                </button>
                <button
                  onClick={() => navigate(locations[2].slug)}
                  className="px-3.5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition-colors"
                >
                  3D
                </button>
              </div>
            </div>
          </div>

          {/* Card 4: Panoramic Skyline Showcase - Landmark 81 */}
          <div className="md:col-span-12 rounded-3xl overflow-hidden bg-[#121218] border border-white/10 relative group">
            <div className="h-64 sm:h-72 w-full overflow-hidden relative">
              <img
                src={locations[3].image}
                alt={locations[3].name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0e] via-[#0a0a0e]/70 to-transparent" />
              <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-center max-w-2xl">
                <span className="text-[11px] font-semibold text-[#c9b586] tracking-widest uppercase mb-2">
                  {locations[3].tag}
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl font-normal text-white mb-2">
                  {locations[3].name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mb-6 font-light">
                  {locations[3].address} • {locations[3].level} • Trạm sạc DC 60kW VinFast
                </p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate(locations[3].slug)}
                    className="py-3 px-6 rounded-xl bg-gradient-to-r from-[#dfd2b5] via-[#c9b586] to-[#b39e6a] text-black font-semibold text-xs tracking-wider uppercase transition-all"
                  >
                    ĐẶT CHỖ LANDMARK 81
                  </button>
                  <span className="text-sm font-serif text-[#dfd2b5]">
                    {locations[3].rate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
