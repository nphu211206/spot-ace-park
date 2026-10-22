import React from 'react';
import { Search, ShieldCheck, Navigation } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    {
      num: 'I',
      title: 'Tuyển Chọn & Đặt Trước',
      desc: 'Nhập điểm đến trên ứng dụng để khám phá các bãi xe gần nhất. Kiểm tra trước số lượng ô trống theo thời gian thực và giá cước từng giờ.',
      tag: 'Chuẩn xác & Nhanh chóng',
    },
    {
      num: 'II',
      title: 'Khởi Hành & Tiếp Đón',
      desc: 'Chọn vị trí đỗ mong muốn và thanh toán trực tuyến. Khi đến cổng, camera tự động nhận diện biển số mở barie không cần hạ kính lấy vé giấy.',
      tag: 'Tự động không tiếp xúc',
    },
    {
      num: 'III',
      title: 'Dẫn Lối 3D Trở Lại',
      desc: 'Lúc đi chơi xong, mở bản đồ hầm 3D trên điện thoại. Dải lụa neon và nhân vật 3D avatar sẽ chỉ đường từng bước dẫn bạn trở lại đúng chiếc xe.',
      tag: 'Không bao giờ lạc xe',
    },
  ];

  return (
    <section className="py-24 bg-[#0a0a0e] text-white border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-semibold text-[#c9b586] tracking-[0.25em] uppercase mb-2">
            QUY TRÌNH TINH GIẢN
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white">
            3 Bước Thảnh Thơi Cho Mọi Chuyến Đi
          </h2>
          <p className="text-slate-400 text-sm md:text-base mt-2 font-light">
            Xóa bỏ mọi phiền toái khi đi gửi xe tại các trung tâm thương mại và đô thị lớn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-[#121217] border border-white/10 hover:border-[#c9b586]/40 transition-all duration-300 relative group"
            >
              <div className="font-serif text-4xl text-[#c9b586]/40 group-hover:text-[#c9b586] transition-colors mb-6 font-light">
                {step.num}
              </div>
              <h3 className="text-xl sm:text-2xl font-normal text-white mb-3">
                {step.title}
              </h3>
              <p className="text-slate-300 text-sm font-light leading-relaxed mb-6">
                {step.desc}
              </p>
              <div className="inline-block text-[11px] font-semibold text-[#c9b586] uppercase tracking-wider">
                ✓ {step.tag}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
