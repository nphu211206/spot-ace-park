import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Car, LogOut, User, Settings, Menu, X, ScanLine, ShieldCheck, MapPin, History } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Kiểm tra đăng nhập từ LocalStorage (Cơ chế mới)
  const checkLoginState = () => {
    try {
      const userStr = localStorage.getItem('spot_user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    }
  };

  useEffect(() => {
    checkLoginState();
    // Lắng nghe sự kiện đăng nhập/đăng xuất để cập nhật Header ngay lập tức
    window.addEventListener('auth-change', checkLoginState);
    return () => window.removeEventListener('auth-change', checkLoginState);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('spot_user');
    window.dispatchEvent(new Event('auth-change')); // Báo cho toàn app biết
    toast.info("Đã đăng xuất");
    navigate("/auth");
    setIsMenuOpen(false);
  };

  // Hàm điều hướng chuẩn SPA (Không reload)
  const goTo = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* LOGO */}
        <div 
          className="flex items-center cursor-pointer group select-none" 
          onClick={() => goTo('/')}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg group-hover:scale-105 transition-transform duration-300">
            <Car className="h-6 w-6 text-white" />
          </div>
          <span className="ml-2 text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 tracking-tight">
            SpotAce
          </span>
        </div>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden md:flex items-center gap-2">
          <Button 
            variant={isActive('/parking') ? "secondary" : "ghost"} 
            className="text-sm font-medium"
            onClick={() => goTo('/parking')}
            type="button"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Tìm bãi xe
          </Button>
          
          {user && (
            <Button 
              variant={isActive('/bookings') ? "secondary" : "ghost"} 
              className="text-sm font-medium"
              onClick={() => goTo('/bookings')}
              type="button"
            >
              <History className="w-4 h-4 mr-2" />
              Lịch sử đặt
            </Button>
          )}

          {/* Nút Scanner nổi bật */}
          {user && (
            <Button 
              variant="outline" 
              className="ml-2 border-purple-500/30 text-purple-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-500 group relative overflow-hidden"
              onClick={() => goTo('/scanner')}
              type="button"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-500/10 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
              <ScanLine className="w-4 h-4 mr-2" />
              AI Scanner
            </Button>
          )}

          {user?.role === 'admin' && (
            <Button 
              variant="default" 
              className="ml-2 bg-slate-900 hover:bg-slate-800 text-white shadow-md"
              onClick={() => goTo('/admin')}
              type="button"
            >
              <Settings className="w-4 h-4 mr-2" /> Quản trị
            </Button>
          )}
        </nav>

        {/* AUTH SECTION */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-auto px-3 rounded-full bg-slate-100 hover:bg-slate-200 flex gap-2 border border-slate-200">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold shadow-sm">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex flex-col items-start text-xs text-left">
                    <span className="font-bold text-slate-700 max-w-[80px] truncate">{user.name}</span>
                    <span className="text-slate-500 capitalize text-[10px]">{user.role}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => goTo('/profile')}>
                  <User className="w-4 h-4 mr-2" /> Hồ sơ cá nhân
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                  <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900" onClick={() => goTo('/auth')}>
                Đăng nhập
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
                onClick={() => goTo('/auth')}
              >
                Đăng ký ngay
              </Button>
            </>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-t border-slate-200 shadow-xl animate-in slide-in-from-top-5 z-50">
          <div className="p-4 space-y-3">
            <Button variant="ghost" className="w-full justify-start" onClick={() => goTo('/parking')}>
              <MapPin className="mr-2 h-4 w-4" /> Tìm bãi xe
            </Button>
            
            {user ? (
              <>
                <Button variant="ghost" className="w-full justify-start" onClick={() => goTo('/bookings')}>
                  <History className="mr-2 h-4 w-4" /> Lịch sử đặt
                </Button>
                <Button variant="outline" className="w-full justify-start border-purple-200 text-purple-700" onClick={() => goTo('/scanner')}>
                  <ScanLine className="mr-2 h-4 w-4" /> AI Scanner
                </Button>
                {user.role === 'admin' && (
                  <Button variant="default" className="w-full justify-start bg-slate-900" onClick={() => goTo('/admin')}>
                    <Settings className="mr-2 h-4 w-4" /> Quản trị
                  </Button>
                )}
                <div className="border-t pt-3 mt-3">
                  <Button variant="destructive" className="w-full" onClick={handleLogout}>Đăng xuất</Button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <Button variant="outline" onClick={() => goTo('/auth')}>Đăng nhập</Button>
                <Button onClick={() => goTo('/auth')}>Đăng ký</Button>
              </div>
            )}
          </div>
        </div>
      )}
      <style>{`
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        .animate-shimmer { animation: shimmer 1.5s infinite; }
      `}</style>
    </header>
  );
};

export default Header;