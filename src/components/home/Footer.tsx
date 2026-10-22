import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-[#050507] text-white border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          <div>
            <div className="font-serif text-2xl tracking-widest text-white font-medium mb-3">
              SPOTACE
            </div>
            <p className="text-xs text-slate-400 font-light leading-relaxed mb-4">
              Nền tảng đặt chỗ đỗ xe và định vị 3D trong hầm chuẩn xác hàng đầu Việt Nam. Mang lại trải nghiệm thảnh thơi, minh bạch cho tài xế.
            </p>
            <div className="text-[11px] text-[#c9b586] uppercase tracking-wider">
              Hotline hỗ trợ 24/7: 1900 xxxx
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-[#c9b586] tracking-widest uppercase mb-4">
              ĐIỂM ĐỖ NỔI BẬT
            </div>
            <ul className="space-y-2 text-xs text-slate-400 font-light">
              <li><Link to="/parking?hub=times-city" className="hover:text-white transition-colors">Times City Hà Nội</Link></li>
              <li><Link to="/parking?hub=ba-trieu" className="hover:text-white transition-colors">Vincom Bà Triệu Hà Nội</Link></li>
              <li><Link to="/parking?hub=royal-city" className="hover:text-white transition-colors">Royal City Thanh Xuân</Link></li>
              <li><Link to="/parking?hub=landmark-81" className="hover:text-white transition-colors">Landmark 81 TP. Hồ Chí Minh</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold text-[#c9b586] tracking-widest uppercase mb-4">
              DỊCH VỤ & TIỆN ÍCH
            </div>
            <ul className="space-y-2 text-xs text-slate-400 font-light">
              <li><Link to="/parking" className="hover:text-white transition-colors">Bản đồ bãi đỗ xe</Link></li>
              <li><Link to="/parking" className="hover:text-white transition-colors">Bản đồ 3D tìm xe trong hầm</Link></li>
              <li><Link to="/charging" className="hover:text-white transition-colors">Trạm sạc xe điện EV</Link></li>
              <li><Link to="/bookings" className="hover:text-white transition-colors">Quản lý vé & thanh toán</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold text-[#c9b586] tracking-widest uppercase mb-4">
              HỖ TRỢ & PHÁP LÝ
            </div>
            <ul className="space-y-2 text-xs text-slate-400 font-light">
              <li><a href="#rules" className="hover:text-white transition-colors">Quy định gửi xe</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Chính sách giá & hoàn vé</a></li>
              <li><a href="#privacy" className="hover:text-white transition-colors">Bảo mật thông tin khách hàng</a></li>
              <li><a href="#terms" className="hover:text-white transition-colors">Điều khoản dịch vụ</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 font-light">
          <div>© 2026 SpotAce Park. All rights reserved. Haute Horlogerie inspired experience.</div>
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
