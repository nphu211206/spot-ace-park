import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, DollarSign, Star, ArrowRight, Sparkles, Zap, Shield, Car, BatteryCharging } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// ==========================================
// ✨ PARTICLE SYSTEM
// ==========================================
const ParticleField = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number; opacity: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      speed: Math.random() * 20 + 10,
      opacity: Math.random() * 0.5 + 0.2
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-blue-400"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, opacity: p.opacity }}
          animate={{ y: [0, -window.innerHeight], opacity: [p.opacity, 0] }}
          transition={{ duration: p.speed, repeat: Infinity, ease: "linear", delay: Math.random() * 10 }}
        />
      ))}
    </div>
  );
};

// ==========================================
// 🌊 GRADIENT MESH BACKGROUND
// ==========================================
const GradientMesh = () => (
  <div className="absolute inset-0 overflow-hidden">
    <motion.div
      className="absolute -inset-[100%] opacity-30"
      style={{ background: "radial-gradient(circle at 30% 20%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 70% 60%, #8b5cf6 0%, transparent 50%), radial-gradient(circle at 40% 80%, #06b6d4 0%, transparent 40%)" }}
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

// ==========================================
// 📊 ANIMATED COUNTER
// ==========================================
const AnimatedCounter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{count.toLocaleString()}{suffix}</span>;
};

// ==========================================
// 🎯 MAIN HERO SECTION
// ==========================================
const HeroSection = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const user = localStorage.getItem('spot_user');
    setIsLoggedIn(!!user);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height });
  }, []);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950"
      onMouseMove={handleMouseMove}
    >
      {/* Animated Background Layers */}
      <GradientMesh />
      <ParticleField />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Mouse follow glow */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-3xl pointer-events-none"
        animate={{ x: mousePos.x * 400 - 300, y: mousePos.y * 400 - 300 }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-8"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              🚀 Hệ thống AI 4.0 • Công nghệ #1 Việt Nam
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-[0.9] tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-white">Đỗ xe</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Thông Minh
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Tìm & đặt chỗ đỗ xe tự động với AI. Tiết kiệm thời gian, tối ưu chi phí.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              size="lg"
              onClick={() => navigate("/parking")}
              className="h-14 px-8 text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:shadow-[0_0_60px_rgba(59,130,246,0.6)] transition-all hover:scale-105 border-0 rounded-xl"
            >
              <Car className="mr-2 h-5 w-5" /> Tìm bãi đỗ xe ngay
            </Button>

            <Button
              size="lg"
              onClick={() => navigate("/charging")}
              className="h-14 px-8 text-lg font-bold bg-white/10 text-white border border-emerald-400/30 backdrop-blur-sm hover:bg-emerald-400/15 hover:border-emerald-300/60 rounded-xl"
            >
              <BatteryCharging className="mr-2 h-5 w-5" /> Tìm trạm sạc EV
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(isLoggedIn ? "/bookings" : "/auth")}
              className="h-14 px-8 text-lg font-medium text-white border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl"
            >
              {isLoggedIn ? "Lịch sử đặt chỗ" : "Đăng ký miễn phí"} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {[
              { value: 50000, suffix: "+", label: "Người dùng", icon: "👥" },
              { value: 200, suffix: "+", label: "Bãi đỗ xe", icon: "🅿️" },
              { value: 99, suffix: "%", label: "Hài lòng", icon: "⭐" },
              { value: 24, suffix: "/7", label: "Hỗ trợ", icon: "🔧" }
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl md:text-3xl font-black text-white">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Features */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            {[
              { icon: MapPin, title: "Bản đồ 3D", desc: "Digital Twin", color: "from-blue-500 to-cyan-500" },
              { icon: Zap, title: "AI Pricing", desc: "Giá động", color: "from-yellow-500 to-orange-500" },
              { icon: Shield, title: "An toàn", desc: "Bảo mật 100%", color: "from-green-500 to-emerald-500" },
              { icon: Star, title: "VIP", desc: "Ưu đãi độc quyền", color: "from-purple-500 to-pink-500" }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group p-5 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-white/20 transition-all cursor-default"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-white mb-1">{feature.title}</h3>
                <p className="text-xs text-slate-400">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
    </section>
  );
};

export default HeroSection;
