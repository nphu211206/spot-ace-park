import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, DollarSign, Star, ArrowRight } from "lucide-react";
import heroImage from "@/assets/parking-hero.jpg";
import { useEffect, useState } from "react";

const HeroSection = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('spot_user');
    setIsLoggedIn(!!user);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-900">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Smart Parking System"
          className="w-full h-full object-cover opacity-40 scale-105 animate-in fade-in zoom-in duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-10 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Hệ thống AI 4.0 Đẳng Cấp Châu Lục
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight text-white drop-shadow-2xl">
            Tìm chỗ đỗ xe <br />
            <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Thông Minh & Tự Động
            </span>
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-16">
            <Button 
              size="xl" 
              onClick={() => navigate("/parking")} // Dùng navigate trực tiếp
              type="button" // Bắt buộc để không bị form submit
              className="h-16 px-8 text-lg font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.5)] hover:shadow-[0_0_50px_rgba(37,99,235,0.7)] transition-all scale-100 hover:scale-105 border-0"
            >
              <MapPin className="mr-2 h-6 w-6" />
              Tìm bãi đỗ xe ngay
            </Button>
            
            <Button 
              variant="outline" 
              size="xl" 
              onClick={() => navigate(isLoggedIn ? "/bookings" : "/auth")}
              type="button"
              className="h-16 px-8 text-lg font-medium text-white border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm hover:border-white/40 transition-all"
            >
              {isLoggedIn ? (
                <>Lịch sử đặt chỗ <ArrowRight className="ml-2 h-5 w-5" /></>
              ) : (
                <>Đăng ký ngay <ArrowRight className="ml-2 h-5 w-5" /></>
              )}
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {[
              { icon: MapPin, title: "Bản đồ 3D", desc: "Trực quan hóa", color: "text-blue-400" },
              { icon: Clock, title: "Thời gian thực", desc: "Cập nhật tức thì", color: "text-cyan-400" },
              { icon: DollarSign, title: "Giá thông minh", desc: "Tối ưu chi phí", color: "text-green-400" },
              { icon: Star, title: "Đẳng cấp VIP", desc: "Trải nghiệm 5 sao", color: "text-yellow-400" }
            ].map((feature, index) => (
              <div key={index} className="group p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-white/10 hover:bg-slate-800/80 transition-all backdrop-blur-sm cursor-default">
                <feature.icon className={`h-8 w-8 ${feature.color} mb-3 mx-auto group-hover:scale-110 transition-transform`} />
                <h3 className="font-bold text-white mb-1">{feature.title}</h3>
                <p className="text-xs text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;