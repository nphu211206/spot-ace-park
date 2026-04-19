import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  KeyRound,
  Loader2,
  Lock,
  Phone,
  ShieldCheck,
  User,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthTab = "login" | "signup";
type UIMode = "user" | "manager" | "admin";

const themeConfig = {
  user: {
    Icon: User,
    roleLabel: "KHÁCH HÀNG",
    accentText: "text-sky-400",
    accentPanel: "border-sky-400/20 bg-sky-500/10",
    orb: "bg-sky-500/20",
    gradient: "from-sky-600/20 to-cyan-500/20",
    buttonColor: "#2563eb",
  },
  manager: {
    Icon: Briefcase,
    roleLabel: "ĐỐI TÁC QUẢN LÝ",
    accentText: "text-orange-400",
    accentPanel: "border-orange-400/20 bg-orange-500/10",
    orb: "bg-orange-500/20",
    gradient: "from-orange-600/20 to-amber-500/20",
    buttonColor: "#ea580c",
  },
  admin: {
    Icon: ShieldCheck,
    roleLabel: "QUẢN TRỊ VIÊN",
    accentText: "text-rose-400",
    accentPanel: "border-rose-400/20 bg-rose-500/10",
    orb: "bg-rose-500/20",
    gradient: "from-rose-600/20 to-red-500/20",
    buttonColor: "#dc2626",
  },
} satisfies Record<UIMode, {
  Icon: typeof User;
  roleLabel: string;
  accentText: string;
  accentPanel: string;
  orb: string;
  gradient: string;
  buttonColor: string;
}>;

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [uiMode, setUiMode] = useState<UIMode>("user");
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    fullName: "",
    adminCode: "",
  });

  useEffect(() => {
    const code = formData.adminCode.trim().toUpperCase();

    if (code === "SPOT_ACE_MASTER" || code.startsWith("MASTER")) {
      setUiMode("admin");
      return;
    }

    if (code === "SPOT_ACE_MANAGER" || code.includes("MANAGER")) {
      setUiMode("manager");
      return;
    }

    setUiMode("user");
  }, [formData.adminCode]);

  useEffect(() => {
    const userStr = localStorage.getItem("spot_user");
    if (!userStr) {
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user?.role === "admin") {
        navigate("/admin");
      } else if (user?.role === "manager") {
        navigate("/manager");
      } else {
        navigate("/");
      }
    } catch {
      localStorage.removeItem("spot_user");
    }
  }, [navigate]);

  const currentTheme = useMemo(() => themeConfig[uiMode], [uiMode]);

  const updateField =
    (field: "phone" | "password" | "fullName" | "adminCode") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = field === "adminCode" ? event.target.value.toUpperCase() : event.target.value;
      setFormData((current) => ({
        ...current,
        [field]: nextValue,
      }));
    };

  const switchTab = (nextTab: AuthTab) => {
    setActiveTab(nextTab);
    if (nextTab === "login") {
      setFormData((current) => ({
        ...current,
        fullName: "",
        adminCode: "",
      }));
    }
  };

  const navigateByRole = (role: string) => {
    if (role === "admin") {
      navigate("/admin");
      return;
    }

    if (role === "manager") {
      navigate("/manager");
      return;
    }

    navigate("/");
  };

  const handleAuth = async () => {
    setLoading(true);

    try {
      const endpoint = activeTab === "login" ? "/api/auth/login" : "/api/auth/signup";
      const payload =
        activeTab === "login"
          ? {
              phone: formData.phone,
              password: formData.password,
            }
          : {
              phone: formData.phone,
              password: formData.password,
              fullName: formData.fullName,
              adminCode: formData.adminCode,
            };

      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Lỗi kết nối server");
      }

      if (activeTab === "login") {
        localStorage.setItem("spot_user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("auth-change"));
        toast.success(`Chào mừng trở lại, ${data.user.name}!`);
        setTimeout(() => navigateByRole(data.user.role), 400);
      } else {
        toast.success("Tạo tài khoản thành công. Mời đăng nhập.");
        setFormData((current) => ({
          ...current,
          password: "",
        }));
        switchTab("login");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const ThemeIcon = currentTheme.Icon;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] px-4 py-10 font-sans selection:bg-primary/30">
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.svg')] opacity-20" />
      <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradient} transition-all duration-700`} />

      <motion.div
        animate={{ x: [0, 120, 0], y: [0, -60, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 20, repeat: Infinity }}
        className={`absolute right-0 top-0 h-[560px] w-[560px] rounded-full blur-[160px] ${currentTheme.orb}`}
      />

      <Card className="relative z-10 w-full max-w-md overflow-hidden border-white/10 bg-black/60 shadow-2xl backdrop-blur-2xl">
        <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-white/70 to-transparent ${currentTheme.accentText}`} />

        <CardHeader className="space-y-1 pb-8 text-center">
          <motion.div
            key={uiMode}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border shadow-[0_0_30px_-5px_rgba(0,0,0,0.35)] ${currentTheme.accentPanel}`}
          >
            <ThemeIcon className={`h-8 w-8 ${currentTheme.accentText}`} />
          </motion.div>

          <CardTitle className="text-3xl font-black tracking-tight text-white">SPOT ACE PARK</CardTitle>
          <CardDescription className={`text-xs font-bold uppercase tracking-[0.35em] ${currentTheme.accentText}`}>
            Cổng {currentTheme.roleLabel}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="mb-8 grid grid-cols-2 rounded-xl border border-white/5 bg-white/5 p-1">
            <button
              type="button"
              role="tab"
              data-state={activeTab === "login" ? "active" : "inactive"}
              onClick={() => switchTab("login")}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                activeTab === "login" ? "bg-white text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
              }`}
            >
              Đăng Nhập
            </button>
            <button
              type="button"
              role="tab"
              data-state={activeTab === "signup" ? "active" : "inactive"}
              onClick={() => switchTab("signup")}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                activeTab === "signup" ? "bg-white text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
              }`}
            >
              Đăng Ký
            </button>
          </div>

          <motion.div
            key={activeTab}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.18 }}
          >
            <div className="space-y-4">
              {activeTab === "signup" && (
                <div className="space-y-2">
                  <Label className="text-slate-300">Họ và tên</Label>
                  <Input
                    className="border-white/10 bg-white/5 text-white focus:border-white/20"
                    placeholder="Ví dụ: Tony Stark"
                    value={formData.fullName}
                    onChange={updateField("fullName")}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-slate-300">Số điện thoại</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    className="border-white/10 bg-white/5 pl-10 font-mono text-white focus:border-white/20"
                    placeholder="0912..."
                    value={formData.phone}
                    onChange={updateField("phone")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    type="password"
                    className="border-white/10 bg-white/5 pl-10 font-mono tracking-widest text-white focus:border-white/20"
                    placeholder="••••••"
                    value={formData.password}
                    onChange={updateField("password")}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleAuth();
                      }
                    }}
                  />
                </div>
              </div>

              {activeTab === "signup" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="pt-2"
                >
                  <div className={`rounded-xl border border-dashed p-4 transition-colors duration-500 ${currentTheme.accentPanel}`}>
                    <Label className={`mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] ${currentTheme.accentText}`}>
                      <KeyRound className="h-3 w-3" />
                      Mã Kích Hoạt (Optional)
                    </Label>
                    <Input
                      type="text"
                      className="border-white/5 bg-black/50 text-center font-mono text-sm tracking-widest text-white uppercase placeholder:text-slate-600"
                      placeholder="NHẬP MÃ ĐỐI TÁC..."
                      value={formData.adminCode}
                      onChange={updateField("adminCode")}
                    />
                    <p className="mt-2 text-center text-[10px] italic text-slate-500">
                      Để trống nếu là khách hàng cá nhân.
                    </p>
                  </div>
                </motion.div>
              )}

              <Button
                className="mt-4 h-12 w-full font-bold text-white transition-all duration-300"
                style={{ backgroundColor: currentTheme.buttonColor }}
                onClick={handleAuth}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {activeTab === "login" ? "TRUY CẬP HỆ THỐNG" : "KHỞI TẠO TÀI KHOẢN"}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </CardContent>

        <CardFooter className="justify-center border-t border-white/5 pb-6 pt-6">
          <div className="space-y-1 text-center">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">
              <Zap className="h-3 w-3 text-yellow-500" />
              Powered by Infinity Core v3.0
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
