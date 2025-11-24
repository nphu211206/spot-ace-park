import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShieldCheck, User, Lock, Phone, KeyRound, ArrowRight, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    fullName: "",
    adminCode: "",
  });

  useEffect(() => {
    const user = localStorage.getItem('spot_user');
    if (user) navigate('/');
  }, [navigate]);

  const handleAuth = async (type: 'login' | 'signup') => {
    setLoading(true);
    try {
      const endpoint = type === 'login' ? '/api/auth/login' : '/api/auth/signup';
      
      const payload = {
        ...formData,
        adminCode: type === 'signup' ? formData.adminCode : undefined 
      };

      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!data.success) throw new Error(data.message);

      if (type === 'login') {
        localStorage.setItem('spot_user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('auth-change'));
        
        if(data.user.role === 'admin') {
            toast.success(`Đã kích hoạt Giao thức Quản trị. Chào sếp ${data.user.name}!`);
            // Force redirect to Admin immediately
            setTimeout(() => navigate("/admin"), 500);
        } else {
            toast.success("Đăng nhập thành công!");
            navigate("/");
        }
      } else {
        toast.success("Khởi tạo định danh thành công. Mời đăng nhập.");
      }
    } catch (error: any) {
      toast.error(error.message || "Lỗi kết nối Server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] relative overflow-hidden font-sans">
      {/* --- ANIMATED BACKGROUND (Cyberpunk Grid) --- */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      {/* --- GLOW EFFECTS --- */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] ${isAdminMode ? 'bg-red-500/20' : 'bg-blue-500/20'} blur-[120px] rounded-full transition-colors duration-700`}></div>

      <Card className="w-full max-w-md border-slate-800 bg-slate-950/80 backdrop-blur-xl shadow-2xl relative z-10">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 border border-slate-800">
            {isAdminMode ? <ShieldCheck className="h-6 w-6 text-red-500" /> : <User className="h-6 w-6 text-blue-500" />}
          </div>
          <CardTitle className={`text-2xl font-black tracking-tight ${isAdminMode ? 'text-red-500' : 'text-white'}`}>
            {isAdminMode ? 'HỆ THỐNG QUẢN TRỊ' : 'SPOT ACE PARK'}
          </CardTitle>
          <CardDescription>
            Nhập thông tin định danh để truy cập hệ thống
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-900">
              <TabsTrigger value="login">Đăng Nhập</TabsTrigger>
              <TabsTrigger value="signup">Đăng Ký</TabsTrigger>
            </TabsList>

            {/* --- LOGIN FORM --- */}
            <TabsContent value="login">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input 
                      className="pl-9 bg-slate-900/50 border-slate-800 focus-visible:ring-offset-0 focus-visible:ring-blue-500" 
                      placeholder="0912..." 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input 
                      type="password" 
                      className="pl-9 bg-slate-900/50 border-slate-800 focus-visible:ring-offset-0 focus-visible:ring-blue-500" 
                      placeholder="••••••" 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border border-slate-800 rounded-lg bg-slate-900/30">
                    <div className="flex items-center space-x-2">
                        <Switch id="admin-mode" checked={isAdminMode} onCheckedChange={setIsAdminMode} className="data-[state=checked]:bg-red-600"/>
                        <Label htmlFor="admin-mode" className={`cursor-pointer ${isAdminMode ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                            {isAdminMode ? 'Chế độ Admin' : 'Chế độ Khách'}
                        </Label>
                    </div>
                </div>

                <Button 
                    className={`w-full font-bold h-11 ${isAdminMode ? 'bg-red-600 hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_20px_rgba(37,99,235,0.3)]'}`} 
                    onClick={() => handleAuth('login')}
                    disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'TRUY CẬP HỆ THỐNG'}
                </Button>
              </div>
            </TabsContent>

            {/* --- SIGNUP FORM --- */}
            <TabsContent value="signup">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Họ và tên</Label>
                  <Input 
                    className="bg-slate-900/50 border-slate-800" 
                    placeholder="Nguyễn Văn A" 
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <Input 
                    className="bg-slate-900/50 border-slate-800" 
                    placeholder="0912..." 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mật khẩu</Label>
                  <Input 
                    type="password" 
                    className="bg-slate-900/50 border-slate-800" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                
                {/* MASTER KEY SECTION */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <Label className="text-yellow-500 flex items-center gap-2">
                    <KeyRound className="w-4 h-4"/> Mã Kích Hoạt (Tùy chọn)
                  </Label>
                  <Input 
                    type="password" 
                    className="bg-slate-900/50 border-yellow-500/30 text-yellow-500 placeholder:text-yellow-500/20 focus-visible:ring-yellow-500" 
                    placeholder="Nhập Master Key để tạo Admin..." 
                    value={formData.adminCode}
                    onChange={(e) => setFormData({...formData, adminCode: e.target.value})}
                  />
                </div>

                <Button className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200 font-bold" onClick={() => handleAuth('signup')} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'TẠO TÀI KHOẢN'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="justify-center border-t border-slate-800 pt-4">
          <p className="text-xs text-slate-500 text-center">
            Hệ thống bảo mật Spot Ace Park v2.0 <br/> Powered by Infinity Core
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;