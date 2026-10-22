import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Zap, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface PopularLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  freeSpots: number;
  totalSpots: number;
  pricePerHour: string;
  floors: string;
  hasEV: boolean;
  has3D: boolean;
  highlightTag: string;
  searchQuery: string;
}

const POPULAR_HUBS: PopularLocation[] = [
  {
    id: "times-city",
    name: "Vincom Mega Mall Times City",
    address: "458 Minh Khai, Vĩnh Tuy, Hai Bà Trưng",
    city: "Hà Nội",
    freeSpots: 45,
    totalSpots: 56,
    pricePerHour: "25.000đ/h",
    floors: "Hầm B2 (Xe máy) & B3 (Ô tô)",
    hasEV: true,
    has3D: true,
    highlightTag: "Rộng rãi • Có trạm sạc VinFast",
    searchQuery: "Times City",
  },
  {
    id: "vincom-ba-trieu",
    name: "Vincom Center Bà Triệu",
    address: "191 Bà Triệu, Lê Đại Hành, Hai Bà Trưng",
    city: "Hà Nội",
    freeSpots: 28,
    totalSpots: 56,
    pricePerHour: "30.000đ/h",
    floors: "Hầm B2 & B3 (Ô tô), B1 (Xe máy)",
    hasEV: true,
    has3D: true,
    highlightTag: "Trung tâm phố cổ • Camera AI",
    searchQuery: "Vincom Center Bà Triệu",
  },
  {
    id: "royal-city",
    name: "Vincom Mega Mall Royal City",
    address: "72A Nguyễn Trãi, Thượng Đình, Thanh Xuân",
    city: "Hà Nội",
    freeSpots: 61,
    totalSpots: 80,
    pricePerHour: "25.000đ/h",
    floors: "Hầm B1 - B3 (Khu R1 đến R6 có linh vật)",
    hasEV: true,
    has3D: true,
    highlightTag: "Hầm xe lớn nhất • Dẫn đường 3D",
    searchQuery: "Royal City",
  },
  {
    id: "landmark-81",
    name: "Landmark 81 Smart Parking",
    address: "208 Nguyễn Hữu Cảnh, P. 22, Bình Thạnh",
    city: "TP. Hồ Chí Minh",
    freeSpots: 22,
    totalSpots: 56,
    pricePerHour: "22.000đ/h",
    floors: "Hầm B2 & B3 cao cấp",
    hasEV: true,
    has3D: true,
    highlightTag: "Tòa tháp cao nhất • Sạc nhanh 60kW",
    searchQuery: "Landmark 81",
  },
];

export const PopularLocationsSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-slate-950 text-white relative border-t border-slate-800/80">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <Badge className="mb-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wider">
              Bãi đỗ xe đối tác tiêu biểu
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Các Điểm Đỗ Xe Được Tài Xế Đặt Nhiều Nhất
            </h2>
            <p className="text-slate-400 text-sm md:text-base mt-2 max-w-2xl">
              Cập nhật trực tiếp số lượng ô đỗ trống, giá cước niêm yết và hỗ trợ dẫn đường vào tận hầm.
            </p>
          </div>

          <Button
            onClick={() => navigate("/parking")}
            variant="outline"
            className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-cyan-300 hover:text-white font-bold rounded-xl h-11 px-5 self-start md:self-auto shrink-0"
          >
            <span>Xem tất cả bãi xe trên bản đồ</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>

        {/* Location Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {POPULAR_HUBS.map((hub) => (
            <motion.div
              key={hub.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="rounded-3xl border border-slate-800 bg-slate-900/70 hover:border-cyan-500/40 p-6 shadow-xl backdrop-blur-md flex flex-col justify-between transition-all group"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                      {hub.highlightTag}
                    </span>
                    <h3 className="text-xl font-black text-white group-hover:text-cyan-300 transition-colors mt-0.5">
                      {hub.name}
                    </h3>
                  </div>

                  <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1 font-mono text-xs font-bold shrink-0">
                    Còn {hub.freeSpots}/{hub.totalSpots} ô
                  </Badge>
                </div>

                {/* Address */}
                <p className="text-slate-400 text-xs md:text-sm flex items-center gap-1.5 mb-4">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{hub.address} ({hub.city})</span>
                </p>

                {/* Details Pills */}
                <div className="grid grid-cols-2 gap-2 mb-6 text-xs">
                  <div className="rounded-xl bg-slate-950/80 border border-slate-800/80 p-2.5">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Vị trí đỗ</span>
                    <span className="text-slate-200 font-medium">{hub.floors}</span>
                  </div>
                  <div className="rounded-xl bg-slate-950/80 border border-slate-800/80 p-2.5">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Giá cước</span>
                    <span className="text-emerald-400 font-bold font-mono text-sm">{hub.pricePerHour}</span>
                  </div>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  {hub.hasEV && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-700/40 text-emerald-300 text-xs font-medium">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      Có trụ sạc xe điện
                    </span>
                  )}
                  {hub.has3D && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/50 border border-cyan-700/40 text-cyan-300 text-xs font-medium">
                      <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                      Hỗ trợ tìm xe 3D
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-950/50 border border-blue-700/40 text-blue-300 text-xs font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    Barie tự động VETC
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800/80">
                <Button
                  onClick={() => navigate(`/parking?search=${encodeURIComponent(hub.searchQuery)}`)}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl h-11 text-xs md:text-sm"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Đặt Chỗ Trước Tại Đây
                </Button>
                <Button
                  onClick={() => navigate(`/parking?search=${encodeURIComponent(hub.searchQuery)}&auto3d=1`)}
                  variant="outline"
                  className="border-slate-700 hover:border-cyan-500/50 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl h-11 text-xs font-bold px-4"
                >
                  Xem Sơ Đồ 3D
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
