import { Clock, Compass, ShieldCheck, DollarSign } from "lucide-react";

export const DriverBenefitsSection = () => {
  const benefits = [
    {
      icon: Clock,
      title: "Hết cảnh chạy lòng vòng tìm chỗ",
      description:
        "Bạn luôn biết trước bãi xe còn bao nhiêu ô đỗ trước khi lái xe tới. Không còn lo lắng đến nơi gặp cảnh bãi xe treo biển 'HẾT CHỖ' vào giờ cao điểm hay ngày lễ.",
      tag: "Tiết kiệm 15 - 20 phút",
      tagColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    },
    {
      icon: Compass,
      title: "Không bao giờ lạc xe trong hầm",
      description:
        "Các tầng hầm Times City, Royal City, Landmark 81 rộng hàng chục nghìn mét vuông rất dễ làm bạn quên vị trí xe. Bản đồ 3D dẫn đường từng bước đến đúng cột xe đậu.",
      tag: "Định vị 3D không cần GPS",
      tagColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    },
    {
      icon: ShieldCheck,
      title: "Vào ra tự động, không lo mất vé",
      description:
        "Hệ thống camera nhận diện biển số xe tự động mở barie. Không cần phải dừng xe hạ kính trời mưa, không lo làm rơi hay mất vé thẻ từ phạt tiền phiền phức.",
      tag: "Liên thông VETC & ePass",
      tagColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    },
    {
      icon: DollarSign,
      title: "Giá cước công khai, minh bạch",
      description:
        "Bảng giá niêm yết rõ ràng theo từng block giờ, không phụ phí phát sinh bất ngờ. Tự động lưu lịch sử đỗ xe và xuất hóa đơn điện tử cho tài xế doanh nghiệp.",
      tag: "Biết trước chi phí 100%",
      tagColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    },
  ];

  return (
    <section className="py-20 bg-slate-950 text-white relative border-t border-slate-800/80">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full">
            Lợi ích thiết thực
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mt-4">
            Giải Quyết Triệt Để Nỗi Lo Khi Gửi Xe
          </h2>
          <p className="text-slate-400 text-base md:text-lg mt-3">
            Những khó khăn thực tế mà mọi tài xế xe ô tô và xe máy tại Việt Nam đều từng gặp phải.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((b, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-cyan-400">
                    <b.icon className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${b.tagColor}`}>
                    {b.tag}
                  </span>
                </div>

                <h3 className="text-xl font-black text-white mb-2.5">{b.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
