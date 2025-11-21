import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Car, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userStr = localStorage.getItem('spot_user');
        if (!userStr) { navigate('/auth'); return; }
        
        const user = JSON.parse(userStr);
        
        // Gọi API Local
        const response = await fetch(`http://localhost:3000/api/bookings?userId=${user.id}`);
        if (!response.ok) throw new Error("Không thể kết nối Server");
        
        const data = await response.json();
        setBookings(data);
      } catch (err: any) {
        console.error(err);
        setError("Lỗi tải dữ liệu. Hãy chắc chắn bạn đã chạy 'node server.js'");
      } finally {
        setLoading(false); // QUAN TRỌNG: Luôn tắt Loading dù thành công hay thất bại
      }
    };
    fetchData();
  }, [navigate]);

  if (loading) return (
    <div className="min-h-screen bg-background flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-slate-800">Lịch sử đặt chỗ</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        <div className="space-y-4">
            {bookings.map((booking: any) => (
                <Card key={booking.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 border-b bg-slate-50/50">
                        <CardTitle className="text-lg font-bold text-primary">{booking.parking_name}</CardTitle>
                        <Badge className={booking.status === 'confirmed' ? 'bg-green-500' : 'bg-slate-500'}>
                          {booking.status === 'confirmed' ? 'Đã xác nhận' : booking.status}
                        </Badge>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="grid gap-3 text-sm text-slate-600">
                            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-red-500"/> {booking.address}</div>
                            <div className="flex items-center gap-2"><Car className="w-4 h-4 text-blue-500"/> Biển số: <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 rounded">{booking.vehicle_number}</span></div>
                            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-purple-500"/> {format(new Date(booking.start_time), "HH:mm - dd/MM/yyyy", {locale: vi})}</div>
                            <div className="font-bold text-lg text-right text-primary">
                              {booking.total_cost ? Number(booking.total_cost).toLocaleString() : 0}đ
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
            
            {!error && bookings.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                <div className="text-slate-400 mb-4">Chưa có lịch sử đặt chỗ nào</div>
                <Button onClick={() => navigate('/parking')}>Đặt chỗ ngay</Button>
              </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default Bookings;