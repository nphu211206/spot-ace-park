import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { User, Phone, Save } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load dữ liệu từ LocalStorage (Vì chưa có API Get Profile riêng, ta dùng tạm cái đã lưu lúc Login)
  // *Master Note: Trong thực tế, nên gọi API /api/profile để lấy mới nhất.
  useEffect(() => {
    const userStr = localStorage.getItem('spot_user');
    if (!userStr) {
      navigate("/auth");
      return;
    }
    setUser(JSON.parse(userStr));
  }, [navigate]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Giả lập update (Cần thêm API update ở server.js sau này để hoàn thiện)
    // Hiện tại ta cập nhật LocalStorage để UI đổi ngay
    try {
      localStorage.setItem('spot_user', JSON.stringify(user));
      // Gọi API update nếu có (Chưa implement ở server.js v1, sẽ làm ở v2)
      // await fetch('http://localhost:3000/api/profile', ...)
      
      window.dispatchEvent(new Event('auth-change')); // Cập nhật Header
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3">
              <User className="w-6 h-6" /> Hồ sơ cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <Label>Họ và tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    value={user.name || ''} 
                    onChange={e => setUser({...user, name: e.target.value})} 
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Số điện thoại (Tên đăng nhập)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    value={user.phone || ''} 
                    disabled 
                    className="pl-10 bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-slate-400">Không thể thay đổi số điện thoại.</p>
              </div>

              <div className="space-y-2">
                <Label>Vai trò</Label>
                <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md font-bold border border-indigo-100 inline-block capitalize">
                  {user.role === 'admin' ? 'Quản Trị Viên (Super Admin)' : 'Khách Hàng Thân Thiết'}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Đang lưu..." : <><Save className="w-4 h-4 mr-2"/> Lưu thay đổi</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;