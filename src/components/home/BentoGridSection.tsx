import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Navigation,
  CreditCard,
  Zap,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Eye,
  CheckCircle,
  Clock,
  Compass,
  BatteryCharging,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const BentoGridSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 bg-slate-950 text-white overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-r from-blue-600/15 via-cyan-500/15 to-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-3.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Kiến Trúc Bãi Đỗ Xe Tương Lai 2026
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            Đột Phá Công Nghệ{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
              Smart Mobility 4.0
            </span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-slate-400">
            Tổng hòa giữa WebGL 3D Digital Twin, định vị trong hầm không cần GPS, thanh toán ETC không dừng và năng lượng xe điện thông minh.
          </p>
        </div>

        {/* Bento Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* ============================================================== */}
          {/* CARD 1: 3D INDOOR CAR FINDER (COL-SPAN 2)                     */}
          {/* ============================================================== */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="md:col-span-2 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-blue-950/40 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col justify-between group"
          >
            {/* Visual Top Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-500" />

            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                    <Navigation className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Indoor Navigation</span>
                    <h3 className="text-xl md:text-2xl font-black text-white">Tìm Xe Trong Hầm 3D (Car Finder)</h3>
                  </div>
                </div>
                <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono text-xs">
                  Zero GPS Loss
                </Badge>
              </div>

              <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
                Khi GPS bị mất sóng dưới tầng hầm bê tông, Spot Ace Park kích hoạt thuật toán dẫn đường vi không gian A* trên nền WebGL. Mũi tên neon uốn lượn theo lối đi, nhân vật 3D avatar bước đi trực quan và tích hợp nháy đèn & bấm còi từ xa.
              </p>

              {/* Interactive Preview Simulation Box */}
              <div className="rounded-2xl border border-slate-700/60 bg-slate-950/90 p-4 mb-6 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3 border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5 font-bold text-cyan-300">
                    <Compass className="h-3.5 w-3.5 text-cyan-400 animate-spin-slow" />
                    Mô phỏng lộ trình hầm B2: Thang máy Sảnh A ➔ Ô B2-A08
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">42 mét • 35 giây</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span>Mũi tên Neon phát sáng</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Avatar người 3D góc nhìn 360°</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span>Còi Bíp & Xi-nhan nhấp nháy</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                onClick={() => navigate("/parking")}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-lg shadow-cyan-500/25 rounded-xl h-11 px-6 group"
              >
                Trải nghiệm Tìm Xe 3D Ngay
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <span className="text-xs text-slate-500 hidden sm:inline">Chuẩn hầm Vincom & Landmark</span>
            </div>
          </motion.div>

          {/* ============================================================== */}
          {/* CARD 2: VETC / EPASS NGHỊ ĐỊNH 119 (COL-SPAN 1)                */}
          {/* ============================================================== */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-emerald-950/30 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mb-4">
                <CreditCard className="h-6 w-6" />
              </div>
              <Badge className="mb-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-mono">
                Nghị Định 119/2024/NĐ-CP
              </Badge>
              <h3 className="text-xl font-black text-white mb-2">VETC / ePass Không Dừng</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Tự động quét thẻ RFID ePass/VETC tại cổng barie. Xe ra vào 0.2 giây không cần hạ kính lấy vé giấy hay dừng quét QR.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-3.5 text-xs">
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span>Tốc độ mở Barrier:</span>
                <span className="font-bold text-emerald-400">0.18 giây</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Khấu trừ tự động:</span>
                <span className="font-bold text-white">Tài khoản ETC</span>
              </div>
            </div>
          </motion.div>

          {/* ============================================================== */}
          {/* CARD 3: EV SMART CHARGING & IDLE FEE (COL-SPAN 1)              */}
          {/* ============================================================== */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="rounded-3xl border border-violet-500/30 bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-violet-950/30 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/20 border border-violet-500/40 text-violet-400 mb-4">
                <BatteryCharging className="h-6 w-6" />
              </div>
              <Badge className="mb-2 bg-violet-500/20 text-violet-300 border border-violet-400/40 text-[10px] font-mono">
                OCPP 1.6 & 2.0.1
              </Badge>
              <h3 className="text-xl font-black text-white mb-2">Trạm Sạc EV Thông Minh</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Tích hợp trụ sạc nhanh DC 60kW - 180kW. Tự động áp dụng phí chiếm dụng (idle fee) sau khi sạc đầy để chống chiếm chỗ.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-3.5 text-xs">
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span>Công suất trung bình:</span>
                <span className="font-bold text-violet-400">120 kW Fast</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Thời gian ân hạn:</span>
                <span className="font-bold text-amber-300">15 phút miễn phí</span>
              </div>
            </div>
          </motion.div>

          {/* ============================================================== */}
          {/* CARD 4: AI DYNAMIC PRICING (COL-SPAN 2)                       */}
          {/* ============================================================== */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="md:col-span-2 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-amber-950/30 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Algorithmic Economy</span>
                    <h3 className="text-xl md:text-2xl font-black text-white">AI Định Giá Động Theo Nhu Cầu</h3>
                  </div>
                </div>
                <Badge className="bg-amber-500/20 text-amber-300 border border-amber-400/40 font-mono text-xs">
                  Real-time Elasticity
                </Badge>
              </div>

              <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
                Thuật toán Machine Learning liên tục phân tích mật độ đỗ xe theo thời gian thực, điều kiện thời tiết (mưa/ngập), và các sự kiện quanh trung tâm thương mại để tối ưu doanh thu cho chủ bãi và phân bổ luồng giao thông hợp lý.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Giờ thấp điểm</div>
                  <div className="text-lg font-black text-emerald-400 mt-1">-30% Giá</div>
                </div>
                <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Giờ cao điểm</div>
                  <div className="text-lg font-black text-amber-400 mt-1">Điều tiết linh hoạt</div>
                </div>
                <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Tỷ lệ lấp đầy</div>
                  <div className="text-lg font-black text-cyan-400 mt-1">94.2% Tối ưu</div>
                </div>
                <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Độ trễ cập nhật</div>
                  <div className="text-lg font-black text-white mt-1">&lt; 1 giây</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-800/80 mt-6">
              <span className="text-xs text-slate-400">
                Minh bạch giá cước hiển thị trực tiếp trước khi đặt chỗ trên bản đồ.
              </span>
              <Button
                variant="outline"
                onClick={() => navigate("/pricing")}
                className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 rounded-xl text-xs h-9"
              >
                Xem chi tiết cơ chế giá
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
