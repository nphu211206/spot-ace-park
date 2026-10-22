import React from 'react';
import { Link } from 'react-router-dom';
import { SpotAceLogo } from '@/components/common/SpotAceLogo';

export function Footer() {
  return (
    <footer className="bg-white text-slate-900 border-t border-slate-200 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-200">
          <div>
            <div className="mb-3">
              <SpotAceLogo size="md" showSubtitle={true} />
            </div>
            <p className="text-xs text-slate-600 font-normal leading-relaxed mb-4">
              Nền tảng kết nối mạng lưới bãi đỗ xe và trạm sạc thông minh hàng đầu Việt Nam. Dẫn đường 3D trong hầm chuẩn xác và thanh toán không dừng.
            </p>
            <div className="text-xs font-bold text-blue-700">
              Hotline hỗ trợ 24/7: 1900 xxxx
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-900 tracking-wider uppercase mb-4">
              ĐIỂM ĐỖ NỔI BẬT
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link to="/parking?hub=times-city" className="hover:text-blue-700 transition-colors">Times City Hà Nội</Link></li>
              <li><Link to="/parking?hub=ba-trieu" className="hover:text-blue-700 transition-colors">Vincom Bà Triệu Hà Nội</Link></li>
              <li><Link to="/parking?hub=royal-city" className="hover:text-blue-700 transition-colors">Royal City Thanh Xuân</Link></li>
              <li><Link to="/parking?hub=landmark-81" className="hover:text-blue-700 transition-colors">Landmark 81 TP. Hồ Chí Minh</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-900 tracking-wider uppercase mb-4">
              DỊCH VỤ & TIỆN ÍCH
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link to="/parking" className="hover:text-blue-700 transition-colors">Bản đồ bãi đỗ xe</Link></li>
              <li><Link to="/parking" className="hover:text-blue-700 transition-colors">Bản đồ 3D tìm xe trong hầm</Link></li>
              <li><Link to="/charging" className="hover:text-blue-700 transition-colors">Trạm sạc xe điện EV</Link></li>
              <li><Link to="/bookings" className="hover:text-blue-700 transition-colors">Quản lý vé & thanh toán</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-900 tracking-wider uppercase mb-4">
              HỖ TRỢ & PHÁP LÝ
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><a href="#rules" className="hover:text-blue-700 transition-colors">Quy định gửi xe</a></li>
              <li><a href="#pricing" className="hover:text-blue-700 transition-colors">Chính sách giá & hoàn vé</a></li>
              <li><a href="#privacy" className="hover:text-blue-700 transition-colors">Bảo mật thông tin khách hàng</a></li>
              <li><a href="#terms" className="hover:text-blue-700 transition-colors">Điều khoản dịch vụ</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 font-normal">
          <div>© 2026 Spot Ace Park. Tất cả các quyền được bảo lưu.</div>
          <div className="mt-2 sm:mt-0 flex items-center gap-4">
            <span>Tiếng Việt</span>
            <span>•</span>
            <span>English</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
