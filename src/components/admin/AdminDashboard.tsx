import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Car, Activity, Server } from "lucide-react";
import { toast } from "sonner";

// Gọi API Local thay vì Supabase
const AdminDashboard = () => {
  const [stats, setStats] = useState({ revenue: 0, bookings: 0, occupancy: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
        toast.success("Đã kết nối SQL Server Local!");
      })
      .catch(err => {
        toast.error("Lỗi kết nối Server Node.js! Bạn đã chạy 'node server.js' chưa?");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center">Đang tải dữ liệu từ SQL Server...</div>;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.revenue.toLocaleString()}đ</div>
            <p className="text-xs text-green-600">Tổng tiền mặt thu được</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Lượt đặt chỗ</CardTitle>
            <Car className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.bookings} xe</div>
            <p className="text-xs text-blue-600">Đang hoạt động trong hệ thống</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Tỉ lệ lấp đầy</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats.occupancy.toFixed(1)}%</div>
            <p className="text-xs text-purple-600">Hiệu suất khai thác</p>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 border rounded-lg bg-gray-50 flex items-center gap-2 text-sm text-gray-500">
        <Server className="w-4 h-4" />
        Đang chạy trên: <strong>DESKTOP-UKPMA8V\SQLEXPRESS02</strong> (Local Mode)
      </div>
    </div>
  );
};

export default AdminDashboard;