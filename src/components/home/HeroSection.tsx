import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, DollarSign, Star } from "lucide-react";
import heroImage from "@/assets/parking-hero.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Smart Parking System"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-accent/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Tìm chỗ đỗ xe
            <span className="block bg-gradient-to-r from-accent to-warning bg-clip-text text-transparent">
              thông minh
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed">
            Hệ thống quản lý bãi đỗ xe với AI, giá động theo thời gian thực và đặt chỗ trước tiện lợi
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="hero" size="xl" className="group" onClick={() => navigate("/parking")}>
              <MapPin className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Tìm bãi đỗ xe
            </Button>
            <Button variant="outline" size="xl" className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary" onClick={() => navigate("/auth")}>
              Đăng ký ngay
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <MapPin className="h-8 w-8 text-accent mb-3 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Bản đồ trực quan</h3>
              <p className="text-sm text-white/80">Xem tất cả bãi xe trên bản đồ</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <Clock className="h-8 w-8 text-accent mb-3 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Thời gian thực</h3>
              <p className="text-sm text-white/80">Cập nhật chỗ trống liên tục</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <DollarSign className="h-8 w-8 text-accent mb-3 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Giá thông minh</h3>
              <p className="text-sm text-white/80">Giá cả tự động theo nhu cầu</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <Star className="h-8 w-8 text-accent mb-3 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Đánh giá cao</h3>
              <p className="text-sm text-white/80">Được người dùng tin tưởng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;