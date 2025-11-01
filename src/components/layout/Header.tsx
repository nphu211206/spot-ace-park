import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Car, LogOut, User, Settings, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        checkAdminRole(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        checkAdminRole(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
            <Car className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            ParkingSmart
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <Link to="/parking" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Tìm bãi xe
          </Link>
          {session && (
            <>
              <Link to="/bookings" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Đặt chỗ của tôi
              </Link>
              {isAdmin && (
                <Link to="/admin" className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  <Settings className="w-4 h-4 mr-1" />
                  Quản trị
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center space-x-3">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Tài khoản
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Thông tin cá nhân
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">Đăng nhập</Button>
              </Link>
              <Link to="/auth">
                <Button variant="hero" size="sm">Đăng ký</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link to="/" className="block text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
              Trang chủ
            </Link>
            <Link to="/parking" className="block text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
              Tìm bãi xe
            </Link>
            {session ? (
              <>
                <Link to="/bookings" className="block text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
                  Đặt chỗ của tôi
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="block text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
                    Quản trị
                  </Link>
                )}
                <Link to="/profile" className="block text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
                  Thông tin cá nhân
                </Link>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </Button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">Đăng nhập</Button>
                </Link>
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="hero" size="sm" className="w-full">Đăng ký</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;