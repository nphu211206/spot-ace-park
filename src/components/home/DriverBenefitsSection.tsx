import React from 'react';
import { Clock, Compass, ShieldCheck, DollarSign } from 'lucide-react';

export function DriverBenefitsSection() {
  const benefits = [
    {
      num: '01',
      title: 'Hết cảnh chạy lòng vòng tìm chỗ',
      badge: 'Tiết kiệm 15 - 20 phút',
      desc: 'Bạn luôn biết trước bãi xe còn bao nhiêu ô đỗ trước khi lái xe tới. Không còn lo lắng đến nơi gặp cảnh bãi xe treo biển "HẾT CHỖ" vào giờ cao điểm hay ngày lễ.',
      icon: Clock,
    },
    {
      num: '02',
      title: 'Không bao giờ lạc xe trong hầm',
      badge: 'Định vị 3D không cần GPS',
      desc: 'Các tầng hầm Times City, Royal City, Landmark 81 rộng hàng chục nghìn mét vuông rất dễ làm bạn quên vị trí xe. Bản đồ 3D dẫn đường từng bước đến đúng cột xe đậu.',
      icon: Compass,
    },
    {
      num: '03',
      title: 'Vào ra tự động, không lo mất vé',
      badge: 'Liên thông VETC & ePass',
      desc: 'Hệ thống camera nhận diện biển số xe tự động mở barie. Không cần phải dừng xe hạ kính trời mưa, không lo làm rơi hay mất vé thẻ từ phạt tiền phiền phức.',
      icon: ShieldCheck,
    },
    {
      num: '04',
      title: 'Giá cước công khai, minh bạch',
      badge: 'Biết trước chi phí 100%',
      desc: 'Bảng giá niêm yết rõ ràng theo từng block giờ, không phụ phí phát sinh bất ngờ. Tự động lưu lịch sử đỗ xe và xuất hóa đơn điện tử cho tài xế doanh nghiệp.',
      icon: DollarSign,
    },
  ];

  return (
    <section className="py-20 bg-[#faf9f6] text-slate-900 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="text-xs font-bold text-blue-700 tracking-wider uppercase mb-1.5">
            LỢI ÍCH THỰC TẾ
          </div>
          <h2 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Giải Quyết Triệt Để 4 Nỗi Lo Khi Gửi Xe
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2 font-normal">
            Những khó khăn thực tế mà mọi tài xế ô tô và xe máy tại Việt Nam đều từng gặp phải.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((b, idx) => (
            <div
              key={idx}
              className="p-7 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3.5">
                <span className="font-sans text-xl font-extrabold text-blue-200">{b.num}</span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                  {b.badge}
                </span>
              </div>
              <h3 className="font-sans text-xl font-bold text-slate-900 mb-2">
                {b.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed font-normal">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
