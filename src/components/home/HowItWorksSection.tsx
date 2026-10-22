import React from 'react';
import { Search, ShieldCheck, Navigation } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Tìm kiếm & Đặt trước',
      desc: 'Nhập điểm đến trên ứng dụng để kiểm tra số ô trống thực tế và giá cước từng giờ. Giữ trước vị trí đỗ thuận tiện nhất.',
      tag: 'Nhanh chóng trong 30 giây',
      icon: Search,
    },
    {
      num: '02',
      title: 'Vào bãi tự động',
      desc: 'Khi lái xe đến cổng, camera tự động nhận diện biển số xe qua liên thông VETC & ePass mở barie tức thì, không cần hạ kính lấy vé giấy.',
      tag: 'Tự động không tiếp xúc',
      icon: ShieldCheck,
    },
    {
      num: '03',
      title: 'Dễ dàng tìm lại xe bằng 3D',
      desc: 'Khi trở lại hầm, mở bản đồ 3D trên điện thoại. Dải mũi tên neon và avatar 3D sẽ dẫn đường từng bước đưa bạn về đúng xe đã đỗ.',
      tag: 'Không lo lạc xe trong hầm',
      icon: Navigation,
    },
  ];

  return (
    <section className="py-20 bg-[#f4f4f7] text-slate-900 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="text-xs font-bold text-blue-700 tracking-wider uppercase mb-1.5">
            QUY TRÌNH TINH GIẢN
          </div>
          <h2 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            3 Bước Đơn Giản Cho Mỗi Lần Gửi Xe
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2 font-normal">
            Xóa bỏ mọi phiền toái khi đi gửi xe tại các trung tâm thương mại và đô thị lớn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-7 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-700">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-sans text-2xl font-extrabold text-blue-200">{step.num}</span>
                </div>
                <h3 className="font-sans text-xl font-bold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4 font-normal">
                  {step.desc}
                </p>
                <div className="text-xs font-bold text-blue-700">
                  ✓ {step.tag}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
