import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import AdminDashboard from "@/components/admin/AdminDashboard";
import ControlPanel from "@/components/admin/ControlPanel"; // Import mới
import JarvisWidget from "@/components/admin/JarvisWidget"; // Import mới
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userStr = localStorage.getItem('spot_user');
        if (!userStr) throw new Error("Chưa đăng nhập");
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

  if (isLoading || !isAuthorized) return null;

  return (
    <div className="min-h-screen bg-[#020617] overflow-x-hidden">
      <Header />
      <main className="container mx-auto px-4 py-6 pb-24">
        {/* DASHBOARD CHÍNH */}
        <AdminDashboard />
        
        {/* GOD MODE PANEL */}
        <div className="animate-in slide-in-from-bottom-10 duration-1000 delay-200">
           <ControlPanel />
        </div>
      </main>

      {/* J.A.R.V.I.S LUÔN HIỂN THỊ */}
      <JarvisWidget />
    </div>
  );
};

export default Admin;