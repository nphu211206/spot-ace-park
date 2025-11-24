import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Car, LogOut, User, LayoutDashboard, Menu, X, ScanLine, History, ShieldAlert } from "lucide-react";
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
    window.addEventListener('auth-change', checkLoginState);
    return () => window.removeEventListener('auth-change', checkLoginState);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('spot_user');
    window.dispatchEvent(new Event('auth-change'));
    toast.info("Đã đăng xuất");
    navigate("/auth");
  };

  const goTo = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

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
          {/* --- NÚT ADMIN QUYỀN LỰC (CHỈ HIỆN KHI LÀ ADMIN) --- */}
          {user?.role === 'admin' && (
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse mr-4 border-2 border-red-400"
              onClick={() => goTo('/admin')}
            >
              <ShieldAlert className="w-4 h-4 mr-2" /> VÀO WAR ROOM
            </Button>
          )}

          <Button variant="ghost" onClick={() => goTo('/parking')}>Tìm bãi xe</Button>
          
          {user && (
            <>
              <Button variant="ghost" onClick={() => goTo('/bookings')}>Lịch sử</Button>
              <Button variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50" onClick={() => goTo('/scanner')}>
                <ScanLine className="w-4 h-4 mr-2" /> AI Scanner
              </Button>
            </>
          )}
        </nav>

        {/* AUTH SECTION */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-auto px-3 rounded-full bg-slate-100 hover:bg-slate-200 flex gap-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${user.role === 'admin' ? 'bg-red-500' : 'bg-blue-500'}`}>
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex flex-col items-start text-xs text-left">
                    <span className="font-bold text-slate-700 max-w-[100px] truncate">{user.name}</span>
                    <span className={`text-[10px] uppercase font-bold ${user.role === 'admin' ? 'text-red-500' : 'text-slate-500'}`}>
                      {user.role === 'admin' ? 'SUPER ADMIN' : 'Thành viên'}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
                {user.role === 'admin' && (
                    <DropdownMenuItem onClick={() => goTo('/admin')} className="text-red-600 font-bold cursor-pointer focus:text-red-600 focus:bg-red-50">
                      <LayoutDashboard className="w-4 h-4 mr-2" /> Trang Quản Trị
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => goTo('/profile')}>
                  <User className="w-4 h-4 mr-2" /> Hồ sơ cá nhân
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                  <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => goTo('/auth')}>
              Đăng nhập / Đăng ký
            </Button>
          )}
        </div>

        {/* MOBILE MENU */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>
    </header>
  );
};

export default Header;