import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { User, LogOut, ShieldAlert, Menu, X, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SpotAceLogo } from "@/components/common/SpotAceLogo";
import { toast } from "sonner";

export const Header = () => {
  const navigate = useNavigate();
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
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto flex h-18 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* LOGO */}
        <div 
          className="cursor-pointer group py-1" 
          onClick={() => goTo('/')}
        >
          <SpotAceLogo size="md" showSubtitle={true} />
        </div>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {user?.role === 'admin' && (
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-sm mr-2"
              onClick={() => goTo('/admin')}
            >
              <ShieldAlert className="w-4 h-4 mr-1.5" /> WAR ROOM
            </Button>
          )}

          <button
            onClick={() => goTo('/parking')}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wider text-slate-700 hover:text-blue-700 hover:bg-slate-100 transition-colors uppercase"
          >
            Tìm bãi xe
          </button>

          <button
            onClick={() => goTo('/parking')}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wider text-slate-700 hover:text-blue-700 hover:bg-slate-100 transition-colors uppercase"
          >
            Sơ đồ 3D hầm
          </button>

          <button
            onClick={() => goTo('/charging')}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wider text-slate-700 hover:text-blue-700 hover:bg-slate-100 transition-colors uppercase"
          >
            Trạm sạc EV
          </button>

          <button
            onClick={() => goTo('/bookings')}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wider text-slate-700 hover:text-blue-700 hover:bg-slate-100 transition-colors uppercase"
          >
            Lịch sử vé
          </button>
        </nav>

        {/* AUTH BUTTONS */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => goTo('/profile')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
              >
                <User className="w-3.5 h-3.5 text-blue-700" />
                <span>{user.name || user.phone}</span>
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full text-slate-400 hover:text-red-600 transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => goTo('/auth')}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-semibold text-xs tracking-wider uppercase shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>ĐĂNG NHẬP / ĐĂNG KÝ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-2">
          <button
            onClick={() => goTo('/parking')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Tìm bãi xe & Sơ đồ 3D
          </button>
          <button
            onClick={() => goTo('/charging')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Trạm sạc xe điện EV
          </button>
          <button
            onClick={() => goTo('/bookings')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Quản lý vé & Thanh toán
          </button>
          <div className="pt-2 border-t border-slate-100">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full text-left py-2 px-3 text-sm text-red-600 font-medium"
              >
                Đăng xuất ({user.name || user.phone})
              </button>
            ) : (
              <button
                onClick={() => goTo('/auth')}
                className="w-full py-2.5 rounded-lg bg-blue-700 text-white text-sm font-semibold text-center"
              >
                Đăng nhập / Đăng ký
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
