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
    <section className="py-24 bg-[#070709] text-white border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-semibold text-[#c9b586] tracking-[0.25em] uppercase mb-2">
            LỢI ÍCH THỰC TẾ
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white">
            Giải Quyết Triệt Để Nỗi Lo Khi Gửi Xe
          </h2>
          <p className="text-slate-400 text-sm md:text-base mt-2 font-light">
            Những khó khăn thực tế mà mọi tài xế xe ô tô và xe máy tại Việt Nam đều từng gặp phải.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((b, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-[#121217] border border-white/10 hover:border-[#c9b586]/40 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-serif text-2xl text-[#c9b586]/60 font-light">{b.num}</span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#c9b586]/10 text-[#c9b586] border border-[#c9b586]/20">
                  {b.badge}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-normal text-white mb-3">
                {b.title}
              </h3>
              <p className="text-slate-300 text-sm font-light leading-relaxed">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
