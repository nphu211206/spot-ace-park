import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation, Compass, Volume2, ArrowRight, CheckCircle2, Footprints } from "lucide-react";

export const CarFinderSpotlight = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white relative border-t border-slate-800/80 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6">
            <Badge className="mb-4 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
              Tính năng độc quyền
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-5">
              Bản Đồ 3D Chỉ Đường{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                Tìm Lại Xe Dưới Hầm
              </span>
            </h2>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-6">
              Dưới các tầng hầm bê tông sâu của Times City hay Royal City, điện thoại thường mất sóng GPS. Spot Ace Park mô phỏng không gian bãi xe dưới dạng 3D chân thực, hiển thị lối đi bằng mũi tên phát sáng và nhân vật 3D avatar bước đi từng bước đưa bạn về đúng xe.
            </p>

            <div className="space-y-3.5 mb-8">
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                <span>Mũi tên Neon uốn lượn theo hành lang hầm B2/B3</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <Footprints className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Avatar người 3D di chuyển theo góc nhìn người đi bộ</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <Volume2 className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Bấm còi Bíp & nháy đèn xe từ xa để định vị âm thanh</span>
              </div>
            </div>

            <Button
              onClick={() => navigate("/parking")}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl h-12 px-7 text-sm md:text-base shadow-xl shadow-cyan-500/25 group"
            >
              <span>Trải Nghiệm Tính Năng Tìm Xe 3D</span>
              <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Right Visual Simulation Box */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-cyan-500/30 bg-slate-950/90 p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                  <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                  <span>Mô phỏng hầm xe: Thang máy Sảnh B ➔ Ô B2-A08</span>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-300 font-mono text-xs">
                  Khoảng cách: 38 mét
                </Badge>
              </div>

              {/* Graphical Simulation Canvas */}
              <div className="h-56 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 mb-3 animate-pulse">
                    <Navigation className="w-8 h-8" />
                  </div>
                  <div className="text-white font-bold text-base mb-1">
                    Đang chỉ dẫn lộ trình ngắn nhất
                  </div>
                  <div className="text-slate-400 text-xs">
                    Rẽ phải ở dãy Cột số 12 ➔ Đi thẳng 20 mét đến ô xe B2-A08
                  </div>
                </div>
              </div>

              {/* Simulation Quick Controls */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Thời gian đi bộ</span>
                  <span className="text-white font-mono font-bold text-sm">Khoảng 35 giây</span>
                </div>
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Tình trạng ô đỗ</span>
                  <span className="text-emerald-400 font-bold text-sm">Xe đang đỗ an toàn</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
