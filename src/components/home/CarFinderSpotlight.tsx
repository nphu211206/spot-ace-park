import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Sparkles, Footprints, Volume2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function CarFinderSpotlight() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-[#070709] text-white border-t border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Haute Horlogerie Storytelling */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181820] border border-[#c9b586]/30 text-[#c9b586] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ĐỘ CHUẨN XÁC DƯỚI LÒNG ĐẤT</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white mb-6 leading-[1.15]">
              Bản Đồ 3D Dẫn Lối <br />
              <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#dfd2b5] via-[#c9b586] to-[#b39e6a]">
                Tìm Lại Xe Dưới Hầm Sâu
              </span>
            </h2>

            <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed mb-8">
              Dưới các tầng hầm bê tông sâu của Times City hay Royal City, điện thoại thường mất hoàn toàn tín hiệu GPS. 
              SpotAce tái hiện không gian bãi xe dưới dạng bản đồ 3D chân thực, hiển thị dải lụa neon dẫn hướng và nhân vật avatar người 3D từng bước đưa bạn trở về đúng vị trí đỗ xe.
            </p>

            {/* 3 Key Pillars */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#c9b586]/10 border border-[#c9b586]/20 flex items-center justify-center text-[#c9b586] mt-0.5 shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Dải lụa phát sáng Neon uốn lượn hành lang hầm B2/B3</div>
                  <div className="text-xs text-slate-400 mt-0.5">Vạch rõ lộ trình đi bộ ngắn nhất từ sảnh thang máy tới đúng ô xe.</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#c9b586]/10 border border-[#c9b586]/20 flex items-center justify-center text-[#c9b586] mt-0.5 shrink-0">
                  <Footprints className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Avatar người 3D di chuyển theo góc nhìn người đi bộ</div>
                  <div className="text-xs text-slate-400 mt-0.5">Xoay camera 360 độ quan sát các cột zone và biển báo thực tế.</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#c9b586]/10 border border-[#c9b586]/20 flex items-center justify-center text-[#c9b586] mt-0.5 shrink-0">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Bấm còi Bíp & nháy đèn xe từ xa qua ứng dụng</div>
                  <div className="text-xs text-slate-400 mt-0.5">Định vị bằng âm thanh khi bạn đã bước tới gần khu vực đỗ.</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/parking')}
              className="py-4 px-8 rounded-2xl bg-gradient-to-r from-[#dfd2b5] via-[#c9b586] to-[#b39e6a] text-black font-semibold text-xs tracking-widest uppercase flex items-center gap-3 hover:brightness-110 shadow-[0_8px_30px_rgba(201,181,134,0.35)] transition-all"
            >
              <span>TRẢI NGHIỆM TÍNH NĂNG TÌM XE 3D</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Column: Luxury Photographic Mockup */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden border border-[#c9b586]/30 shadow-[0_25px_60px_rgba(0,0,0,0.8)] group">
              <img
                src="/images/luxury_carfinder_mobile.jpg"
                alt="Haute 3D Car Finder Interface"
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-transparent opacity-60" />

              {/* Floating Telemetry Badge */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#0f0f14]/85 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-[#c9b586] uppercase tracking-widest font-semibold">TRẠNG THÁI ĐỊNH VỊ HẦM</div>
                  <div className="text-white font-medium mt-0.5">Thang máy Sảnh B ➔ Ô B2-A08 (38m)</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-emerald-400 font-semibold uppercase">ĐÃ KẾT NỐI</div>
                  <div className="text-slate-300 font-serif text-sm">~ 35 giây đi bộ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
