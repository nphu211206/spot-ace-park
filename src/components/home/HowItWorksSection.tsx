import { Search, CheckCircle, Navigation, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const HowItWorksSection = () => {
  const navigate = useNavigate();

  const steps = [
    {
      step: "01",
      icon: Search,
      title: "Tìm kiếm & So sánh",
      description:
        "Nhập điểm đến trên ứng dụng để xem các bãi đỗ xe gần nhất. Kiểm tra trước số lượng ô trống theo thời gian thực và giá cước từng giờ.",
    },
    {
      step: "02",
      icon: CheckCircle,
      title: "Đặt chỗ & Nhận lộ trình",
      description:
        "Chọn vị trí đỗ mong muốn và thanh toán trực tuyến. Nhận mã định danh xe; khi đến cổng, camera tự động nhận diện biển số mở barie không cần lấy vé giấy.",
    },
    {
      step: "03",
      icon: Navigation,
      title: "Dễ dàng tìm lại xe bằng 3D",
      description:
        "Lúc đi chơi xong, mở bản đồ hầm 3D trên điện thoại. Mũi tên neon và nhân vật ảo sẽ chỉ đường từng bước dẫn bạn trở lại đúng vị trí xe đã đậu.",
    },
  ];

  return (
    <section className="py-20 bg-slate-900/60 text-white relative border-t border-slate-800/80">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full">
            Đơn giản & Tiện lợi
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mt-4">
            Quy Trình 3 Bước Dành Cho Tài Xế
          </h2>
          <p className="text-slate-400 text-base md:text-lg mt-3">
            Xóa bỏ mọi phiền toái khi đi gửi xe tại các trung tâm thương mại và đô thị lớn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8 relative flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <item.icon className="w-7 h-7" />
                  </div>
                  <span className="font-mono text-3xl font-black text-slate-700">{item.step}</span>
                </div>

                <h3 className="text-xl font-black text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center gap-1.5 text-xs text-cyan-400 font-semibold">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Nhanh chóng • Không tiếp xúc</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            onClick={() => navigate("/parking")}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl h-12 px-8 shadow-xl shadow-cyan-500/20 text-sm md:text-base group"
          >
            <span>Trải Nghiệm Thử Ngay Bây Giờ</span>
            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};
