import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, Eye, ShieldCheck, Zap } from 'lucide-react';

export function PopularLocationsSection() {
  const navigate = useNavigate();

  const locations = [
    {
      id: 'times-city',
      name: 'Vincom Mega Mall Times City',
      tag: 'TỔ HỢP ĐÔ THỊ ĐẲNG CẤP',
      address: '458 Minh Khai, Vĩnh Tuy, Hai Bà Trưng (Hà Nội)',
      level: 'Hầm B2 (Xe máy) & B3 (Ô tô)',
      availableSlots: 45,
      totalSlots: 56,
      rate: '25.000đ/h',
      features: ['Trụ sạc nhanh VinFast', 'Hỗ trợ tìm xe 3D', 'Barie tự động VETC'],
      slug: '/parking?hub=times-city',
      image: '/images/luxury_hero_arrival.jpg',
    },
    {
      id: 'ba-trieu',
      name: 'Vincom Center Bà Triệu',
      tag: 'TRUNG TÂM PHỐ CỔ',
      address: '191 Bà Triệu, Lê Đại Hành, Hai Bà Trưng (Hà Nội)',
      level: 'Hầm B2 & B3 (Ô tô), B1 (Xe máy)',
      availableSlots: 28,
      totalSlots: 56,
      rate: '30.000đ/h',
      features: ['Trụ sạc xe điện', 'Camera AI nhận diện', 'Barie tự động VETC'],
      slug: '/parking?hub=ba-trieu',
    },
    {
      id: 'royal-city',
      name: 'Vincom Mega Mall Royal City',
      tag: 'HẦM ĐỖ RỘNG NHẤT MIỀN BẮC',
      address: '72A Nguyễn Trãi, Thượng Đình, Thanh Xuân (Hà Nội)',
      level: 'Hầm B1 - B3 (Khu R1 đến R6 có linh vật)',
      availableSlots: 61,
      totalSlots: 80,
      rate: '25.000đ/h',
      features: ['Dẫn đường 3D phân khu', 'Sạc xe điện VinFast', 'Liên thông VETC'],
      slug: '/parking?hub=royal-city',
    },
    {
      id: 'landmark-81',
      name: 'Landmark 81 Smart Parking',
      tag: 'TÒA THÁP BIỂU TƯỢNG TP. HỒ CHÍ MINH',
      address: '208 Nguyễn Hữu Cảnh, P. 22, Bình Thạnh (TP. Hồ Chí Minh)',
      level: 'Hầm B2 & B3 cao cấp',
      availableSlots: 22,
      totalSlots: 56,
      rate: '22.000đ/h',
      features: ['Trạm sạc siêu nhanh 60kW', 'Đỗ xe tự động VIP', 'Hỗ trợ 24/7'],
      slug: '/parking?hub=landmark-81',
      image: '/images/luxury_hub_architecture.jpg',
    },
  ];

  return (
    <section className="py-20 bg-[#f4f4f7] text-slate-900 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-5 border-b border-slate-200">
          <div>
            <div className="text-xs font-bold text-blue-700 tracking-wider uppercase mb-1.5">
              HỆ THỐNG ĐIỂM ĐỖ KẾT NỐI
            </div>
            <h2 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Các Bãi Đỗ Xe Được Đặt Nhiều Nhất
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-1.5 max-w-xl font-normal">
              Cập nhật trực tiếp số lượng ô đỗ trống, giá cước niêm yết và hỗ trợ dẫn đường vào tận hầm.
            </p>
          </div>

          <button
            onClick={() => navigate('/parking')}
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-blue-700 hover:text-blue-800 uppercase transition-colors"
          >
            <span>XEM TẤT CẢ TRÊN BẢN ĐỒ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Times City Hero Card */}
          <div className="md:col-span-12 lg:col-span-7 rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-md relative group flex flex-col justify-between">
            <div>
              <div className="h-64 sm:h-72 w-full overflow-hidden relative">
                <img
                  src={locations[0].image}
                  alt={locations[0].name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3.5 py-1 rounded-full text-white text-[11px] font-bold tracking-wider uppercase">
                  {locations[0].tag}
                </div>
                <div className="absolute top-4 right-4 bg-emerald-600 px-3.5 py-1 rounded-full text-white text-xs font-bold shadow-sm">
                  Còn {locations[0].availableSlots}/{locations[0].totalSlots} ô trống
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-sans text-2xl font-bold text-slate-900 mb-1.5">
                  {locations[0].name}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-blue-700" />
                  <span>{locations[0].address}</span>
                </p>

                <div className="grid grid-cols-2 gap-4 py-3 px-4 rounded-xl bg-slate-50 border border-slate-100 mb-4 text-xs">
                  <div>
                    <div className="text-slate-500 font-medium">Vị trí hầm</div>
                    <div className="font-bold text-slate-800 mt-0.5">{locations[0].level}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-medium">Giá niêm yết</div>
                    <div className="font-bold text-blue-700 text-sm mt-0.5">{locations[0].rate}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {locations[0].features.map((feat, idx) => (
                    <span key={idx} className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 flex items-center gap-3">
              <button
                onClick={() => navigate(locations[0].slug)}
                className="flex-1 py-3 px-6 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span>ĐẶT CHỖ TẠI ĐÂY</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate(locations[0].slug)}
                className="py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs tracking-wider uppercase transition-colors flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4 text-blue-700" />
                <span>XEM SƠ ĐỒ 3D</span>
              </button>
            </div>
          </div>

          {/* Staggered Vertical Cards - Ba Trieu & Royal City */}
          <div className="md:col-span-12 lg:col-span-5 flex flex-col justify-between gap-6">
            {/* Card 2: Ba Trieu */}
            <div className="rounded-3xl p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                  {locations[1].tag}
                </span>
                <span className="text-xs text-emerald-700 font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                  Còn {locations[1].availableSlots}/{locations[1].totalSlots} ô
                </span>
              </div>
              <h3 className="font-sans text-xl font-bold text-slate-900 mb-1">
                {locations[1].name}
              </h3>
              <p className="text-xs text-slate-500 mb-3">{locations[1].address}</p>
              <div className="flex justify-between items-center py-2.5 px-3 rounded-lg bg-slate-50 border border-slate-100 mb-4 text-xs">
                <span className="text-slate-600 font-medium">{locations[1].level}</span>
                <span className="font-bold text-blue-700">{locations[1].rate}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(locations[1].slug)}
                  className="flex-1 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold tracking-wider uppercase transition-all"
                >
                  ĐẶT CHỖ TRƯỚC
                </button>
                <button
                  onClick={() => navigate(locations[1].slug)}
                  className="px-3.5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-semibold transition-colors"
                >
                  3D
                </button>
              </div>
            </div>

            {/* Card 3: Royal City */}
            <div className="rounded-3xl p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                  {locations[2].tag}
                </span>
                <span className="text-xs text-emerald-700 font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                  Còn {locations[2].availableSlots}/{locations[2].totalSlots} ô
                </span>
              </div>
              <h3 className="font-sans text-xl font-bold text-slate-900 mb-1">
                {locations[2].name}
              </h3>
              <p className="text-xs text-slate-500 mb-3">{locations[2].address}</p>
              <div className="flex justify-between items-center py-2.5 px-3 rounded-lg bg-slate-50 border border-slate-100 mb-4 text-xs">
                <span className="text-slate-600 font-medium">{locations[2].level}</span>
                <span className="font-bold text-blue-700">{locations[2].rate}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(locations[2].slug)}
                  className="flex-1 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold tracking-wider uppercase transition-all"
                >
                  ĐẶT CHỖ TRƯỚC
                </button>
                <button
                  onClick={() => navigate(locations[2].slug)}
                  className="px-3.5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-semibold transition-colors"
                >
                  3D
                </button>
              </div>
            </div>
          </div>

          {/* Card 4: Landmark 81 Panoramic Card */}
          <div className="md:col-span-12 rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm relative group">
            <div className="h-60 sm:h-64 w-full overflow-hidden relative">
              <img
                src={locations[3].image}
                alt={locations[3].name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/60 to-transparent" />
              <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-center max-w-xl text-white">
                <span className="text-[11px] font-bold text-amber-300 tracking-wider uppercase mb-1.5">
                  {locations[3].tag}
                </span>
                <h3 className="font-sans text-2xl sm:text-3xl font-bold mb-1.5">
                  {locations[3].name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 mb-4 font-normal">
                  {locations[3].address} • Trạm sạc VinFast DC 60kW
                </p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate(locations[3].slug)}
                    className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wider uppercase transition-all"
                  >
                    ĐẶT CHỖ LANDMARK 81
                  </button>
                  <span className="text-sm font-bold text-amber-300">
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
