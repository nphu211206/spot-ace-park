import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Footprints, Volume2, ArrowRight, Sparkles } from 'lucide-react';

export function CarFinderSpotlight() {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-[#faf9f6] text-slate-900 border-t border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Direct, Understandable Copy */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wider uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TÍNH NĂNG ĐỘC QUYỀN SPOT ACE PARK</span>
            </div>

            <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-5 leading-tight">
              Bản Đồ 3D Chỉ Đường <br />
              <span className="text-blue-700">Tìm Lại Xe Dưới Hầm Sâu</span>
            </h2>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-6 font-normal">
              Dưới các tầng hầm bê tông sâu của Times City hay Royal City, điện thoại thường mất hoàn toàn sóng GPS. 
              Spot Ace Park mô phỏng không gian bãi xe dưới dạng 3D chân thực, hiển thị dải lụa neon phát sáng và nhân vật 3D avatar bước đi từng bước đưa bạn về đúng xe đã đỗ.
            </p>

            {/* 3 Core Highlights */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 mt-0.5 shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Mũi tên Neon uốn lượn theo hành lang hầm B2/B3</div>
                  <div className="text-xs text-slate-500 mt-0.5">Vạch rõ lối đi ngắn nhất từ thang máy sảnh tới đúng ô xe.</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 mt-0.5 shrink-0">
                  <Footprints className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Avatar người 3D di chuyển theo góc nhìn người đi bộ</div>
                  <div className="text-xs text-slate-500 mt-0.5">Xoay camera 360 độ quan sát các cột zone và biển báo thực tế.</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mt-0.5 shrink-0">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Bấm còi Bíp & nháy đèn xe từ xa qua ứng dụng</div>
                  <div className="text-xs text-slate-500 mt-0.5">Định vị bằng âm thanh khi bạn đã bước tới gần khu vực đỗ.</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/parking')}
              className="py-3.5 px-8 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs tracking-wider uppercase flex items-center gap-2.5 shadow-md transition-all"
            >
              <span>TRẢI NGHIỆM TÍNH NĂNG TÌM XE 3D</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Column: Visual Mockup */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-xl p-3">
              <div className="rounded-2xl overflow-hidden relative">
                <img
                  src="/images/luxury_carfinder_mobile.jpg"
                  alt="Spot Ace Park 3D Car Finder"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 flex items-center justify-between text-xs shadow-sm">
                  <div>
                    <div className="text-[10px] text-blue-700 uppercase font-bold tracking-wider">ĐỊNH VỊ TRONG HẦM</div>
                    <div className="text-slate-900 font-semibold mt-0.5">Thang máy Sảnh B ➔ Ô B2-A08 (38m)</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-emerald-600 font-bold uppercase">KẾT NỐI 100%</div>
                    <div className="text-slate-700 font-bold">~ 35s đi bộ</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
