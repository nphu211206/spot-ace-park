import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { Button } from "@/components/ui/button";
import { ShieldCheck, LogOut, ServerCrash } from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // KIỂM TRA QUYỀN TỪ LOCAL STORAGE (KHÔNG DÙNG SUPABASE NỮA)
    const checkAuth = () => {
      try {
        const userStr = localStorage.getItem('spot_user');
        if (!userStr) {
          throw new Error("Chưa đăng nhập");
        }

        const user = JSON.parse(userStr);
        if (user.role !== 'admin') {
          toast.error("Bạn không phải là Admin!");
          navigate("/");
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('spot_user');
    navigate("/auth");
    toast.info("Đã đăng xuất");
  };

  if (isLoading) return null;

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in slide-in-from-bottom-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <ShieldCheck className="w-8 h-8 text-indigo-600" />
              </div>
              <h1 className="text-3xl font-black text-slate-800">
                Trung Tâm Quản Trị
              </h1>
            </div>
            <p className="text-sm text-slate-500 font-medium ml-1">
              ● Đang kết nối SQL Server Local (Port 3000)
            </p>
          </div>
          
          <Button variant="destructive" onClick={handleLogout} className="shadow-lg hover:shadow-xl transition-all">
            <LogOut className="w-4 h-4 mr-2" /> Đăng xuất Admin
          </Button>
        </div>

        {/* DASHBOARD CONTENT */}
        <div className="animate-in fade-in duration-700">
           <AdminDashboard />
        </div>
      </main>
    </div>
  );
};

export default Admin;