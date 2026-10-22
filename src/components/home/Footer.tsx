import { Phone } from "lucide-react";
import { Link } from "react-router-dom";

export const HomeFooter = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs md:text-sm border-t border-slate-800/80 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500 flex items-center justify-center text-slate-950 font-black text-base">
                P
              </div>
              <span className="text-lg font-black text-white tracking-tight">Spot Ace Park</span>
            </div>
            <p className="text-slate-400 max-w-md leading-relaxed mb-4">
              Nền tảng tìm kiếm, đặt chỗ bãi đỗ xe và chỉ đường trong hầm bằng mô hình 3D trực quan. Giúp tài xế tiết kiệm thời gian, nhiên liệu và loại bỏ hoàn toàn nỗi lo hết chỗ đỗ xe.
            </p>
            <div className="flex items-center gap-3 text-slate-300">
              <span className="flex items-center gap-1.5 font-medium">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                Hotline hỗ trợ: 1900 8888 (24/7)
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-xs">Điểm đỗ nổi bật</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/parking?search=Times%20City" className="hover:text-cyan-300 transition-colors">
                  Bãi xe Times City Hà Nội
                </Link>
              </li>
              <li>
                <Link to="/parking?search=Vincom%20Bà%20Triệu" className="hover:text-cyan-300 transition-colors">
                  Bãi xe Vincom Bà Triệu
                </Link>
              </li>
              <li>
                <Link to="/parking?search=Royal%20City" className="hover:text-cyan-300 transition-colors">
                  Bãi xe Royal City Hà Nội
                </Link>
              </li>
              <li>
                <Link to="/parking?search=Landmark%2081" className="hover:text-cyan-300 transition-colors">
                  Bãi xe Landmark 81 TP.HCM
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-xs">Hỗ trợ khách hàng</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/parking" className="hover:text-cyan-300 transition-colors">
                  Bản đồ bãi đỗ xe
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-cyan-300 transition-colors">
                  Đăng nhập tài xế
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Chính sách bảo mật & hoàn tiền</span>
              </li>
              <li>
                <span className="text-slate-500">Hướng dẫn sử dụng tìm xe 3D</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-xs gap-4">
          <div>© 2026 Spot Ace Park. Bản quyền thuộc về Đồ Án Nhóm 1.</div>
          <div className="flex items-center gap-1">
            <span>Thiết kế tối ưu vì trải nghiệm của mọi tài xế Việt Nam</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
