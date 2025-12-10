import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShieldCheck, User, Lock, Phone, KeyRound, Briefcase, ArrowRight, Loader2, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  
  // Mode UI: 'user' (Xanh), 'admin' (Đỏ), 'manager' (Cam)
  const [uiMode, setUiMode] = useState<'user' | 'admin' | 'manager'>('user');
  
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    fullName: "",
    adminCode: "",
  });

  // Hiệu ứng tự động đổi giao diện khi nhập mã kích hoạt
  useEffect(() => {
    const code = formData.adminCode.trim();
    if (code === 'SPOT_ACE_MASTER' || code.startsWith('MASTER')) {
        setUiMode('admin');
    } else if (code === 'SPOT_ACE_MANAGER' || code.includes('MANAGER')) {
        setUiMode('manager');
    } else {
        setUiMode('user');
    }
  }, [formData.adminCode]);

  useEffect(() => {
    const userStr = localStorage.getItem('spot_user');
    if (userStr) {
        const user = JSON.parse(userStr);
        navigateByUserRole(user.role);
    }
  }, [navigate]);

  const navigateByUserRole = (role: string) => {
      if (role === 'admin') navigate('/admin');
      else if (role === 'manager') navigate('/manager');
      else navigate('/');
  };

  const handleAuth = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const payload = { ...formData, adminCode: activeTab === 'signup' ? formData.adminCode : undefined };

      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      if (activeTab === 'login') {
        localStorage.setItem('spot_user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('auth-change'));
        
        toast.success(`Chào mừng trở lại, ${data.user.name}!`);
        setTimeout(() => navigateByUserRole(data.user.role), 500);
      } else {
        toast.success("Tạo tài khoản thành công. Mời đăng nhập.");
        setActiveTab("login");
        setFormData(prev => ({ ...prev, password: "" }));
      }
    } catch (error: any) {
      toast.error(error.message || "Lỗi kết nối Server");
    } finally {
      setLoading(false);
    }
  };

  // Config màu sắc giao diện
  const theme = {
      user: { color: 'blue', icon: User, title: 'KHÁCH HÀNG', gradient: 'from-blue-600/20 to-cyan-600/20' },
      manager: { color: 'orange', icon: Briefcase, title: 'ĐỐI TÁC QUẢN LÝ', gradient: 'from-orange-600/20 to-amber-600/20' },
      admin: { color: 'red', icon: ShieldCheck, title: 'QUẢN TRỊ VIÊN', gradient: 'from-red-600/20 to-rose-900/20' }
  };
  const currentTheme = theme[uiMode];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden font-sans selection:bg-primary/30">
      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradient} transition-all duration-1000`}></div>
      
      <motion.div 
        animate={{ x: [0, 100, 0], y: [0, -50, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 20, repeat: Infinity }}
        className={`absolute top-0 right-0 w-[600px] h-[600px] bg-${currentTheme.color}-500/20 blur-[150px] rounded-full`}
      />

      <Card className="w-full max-w-md border-white/10 bg-black/60 backdrop-blur-2xl shadow-2xl relative z-10 overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${currentTheme.color}-500 to-transparent opacity-80`}></div>

        <CardHeader className="space-y-1 text-center pb-8">
          <motion.div 
            key={uiMode}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-${currentTheme.color}-500/10 border border-${currentTheme.color}-500/20 shadow-[0_0_30px_-5px_rgba(0,0,0,0.3)]`}
          >
            <currentTheme.icon className={`h-8 w-8 text-${currentTheme.color}-500`} />
          </motion.div>
          <CardTitle className={`text-3xl font-black tracking-tighter text-white drop-shadow-lg`}>
            SPOT ACE PARK
          </CardTitle>
          <CardDescription className={`text-${currentTheme.color}-400 font-bold uppercase tracking-widest text-xs`}>
            Cổng {currentTheme.title}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5 border border-white/5">
              <TabsTrigger value="login">Đăng Nhập</TabsTrigger>
              <TabsTrigger value="signup">Đăng Ký</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-4">
                  {activeTab === 'signup' && (
                    <div className="space-y-2">
                      <Label className="text-slate-300">Họ và tên</Label>
                      <Input className="bg-white/5 border-white/10 focus:border-white/20 text-white" placeholder="Ví dụ: Tony Stark" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-slate-300">Số điện thoại</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input className="pl-10 bg-white/5 border-white/10 focus:border-white/20 text-white font-mono" placeholder="0912..." value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Mật khẩu</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input type="password" className="pl-10 bg-white/5 border-white/10 focus:border-white/20 text-white font-mono tracking-widest" placeholder="••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} onKeyDown={(e) => e.key === 'Enter' && handleAuth()} />
                    </div>
                  </div>

                  {/* MÃ KÍCH HOẠT CAO CẤP */}
                  {activeTab === 'signup' && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="pt-2"
                    >
                      <div className={`p-4 rounded-xl border border-dashed border-${currentTheme.color}-500/30 bg-${currentTheme.color}-500/5 transition-colors duration-500`}>
                        <Label className={`text-[10px] uppercase tracking-widest font-bold text-${currentTheme.color}-400 flex items-center gap-2 mb-2`}>
                          <KeyRound className="w-3 h-3"/> Mã Kích Hoạt (Optional)
                        </Label>
                        <Input 
                          type="text" 
                          className="bg-black/50 border-white/5 text-center font-mono text-sm tracking-widest text-white placeholder:tracking-normal placeholder:text-slate-600 focus:ring-0 uppercase" 
                          placeholder="NHẬP MÃ ĐỐI TÁC..." 
                          value={formData.adminCode}
                          onChange={(e) => setFormData({...formData, adminCode: e.target.value.toUpperCase()})}
                        />
                        <p className="text-[10px] text-slate-500 mt-2 text-center italic">
                            *Để trống nếu là Khách hàng cá nhân
                        </p>
                      </div>
                    </motion.div>
                  )}

                  <Button 
                    className={`w-full font-bold h-12 mt-4 shadow-lg shadow-${currentTheme.color}-500/20 hover:shadow-${currentTheme.color}-500/40 transition-all duration-300 group text-white`}
                    style={{ backgroundColor: uiMode === 'admin' ? '#dc2626' : uiMode === 'manager' ? '#ea580c' : '#2563eb' }}
                    onClick={handleAuth}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 
                    <>
                        {activeTab === 'login' ? 'TRUY CẬP HỆ THỐNG' : 'KHỞI TẠO TÀI KHOẢN'}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>}
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </CardContent>
        
        <CardFooter className="justify-center border-t border-white/5 pt-6 pb-6">
          <div className="text-center space-y-1">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold flex items-center gap-2">
              <Zap className="w-3 h-3 text-yellow-500" /> Powered by Infinity Core v3.0
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;