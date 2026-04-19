import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { AlertCircle, Car, Clock, History as HistoryIcon, MapPin, QrCode } from "lucide-react";
import BookingQrDialog from "@/components/bookings/BookingQrDialog";
import Header from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mergeBookings, readLocalBookings, StoredBooking } from "@/lib/booking-storage";
import { formatDurationLabel, getDurationMinutesBetween } from "@/lib/parking-pricing";

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<StoredBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<StoredBooking | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const userStr = localStorage.getItem("spot_user");

      if (!userStr) {
        navigate("/auth");
        return;
      }

      const user = JSON.parse(userStr);
      const localBookings = readLocalBookings(user.id);

      try {
        const response = await fetch(`http://localhost:3000/api/bookings?userId=${user.id}`);
        if (!response.ok) {
          throw new Error("Server Error");
        }

        const data = await response.json();
        setBookings(mergeBookings(data, localBookings));
      } catch {
        if (localBookings.length > 0) {
          setBookings(localBookings);
          setError("Máy chủ dữ liệu đang lỗi, hiện đang hiển thị lịch sử lưu cục bộ trên trình duyệt.");
        } else {
          setError("Không thể kết nối đến Máy chủ Dữ liệu.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "active") {
      return booking.status === "confirmed";
    }

    if (filter === "completed") {
      return booking.status === "completed";
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500 hover:bg-green-600">Đang hoạt động</Badge>;
      case "completed":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Hoàn thành</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">Chờ xử lý</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Lịch Sử Đặt Chỗ</h1>
            <p className="text-slate-500 text-sm mt-1">Quản lý các vé điện tử và giao dịch của bạn</p>
          </div>
          <Button onClick={() => navigate("/parking")} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
            Đặt Chỗ Mới
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        <Tabs defaultValue="all" onValueChange={setFilter} className="w-full">
          <TabsList className="bg-white border border-slate-200 p-1 mb-6">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="active">Đang hoạt động</TabsTrigger>
            <TabsTrigger value="completed">Lịch sử</TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.transaction_id || booking.id} className="bg-white border-slate-200 hover:shadow-md transition-all group overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3">
                        {getStatusBadge(booking.status)}
                        <span className="text-xs text-slate-400 font-mono">ID: #{booking.id}</span>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-1">{booking.parking_name}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                          <MapPin className="w-3 h-3" /> {booking.address}
                        </p>
                      </div>

                      <div className="flex gap-6 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <div className="p-2 rounded bg-slate-100">
                            <Car className="w-4 h-4" />
                          </div>
                          <span className="font-bold">{booking.vehicle_number}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <div className="p-2 rounded bg-slate-100">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold">
                              {format(new Date(booking.start_time), "HH:mm dd/MM", { locale: vi })}
                              {" - "}
                              {format(new Date(booking.end_time), "HH:mm dd/MM", { locale: vi })}
                            </span>
                            <span className="text-xs text-slate-400">
                              {formatDurationLabel(
                                booking.duration_minutes || getDurationMinutesBetween(booking.start_time, booking.end_time),
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-end border-l border-slate-100 pl-6 md:w-48">
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Tổng tiền</p>
                        <p className="text-2xl font-black text-blue-600">{Number(booking.total_cost).toLocaleString()}đ</p>
                      </div>

                      <Button
                        className="w-full bg-slate-900 text-white hover:bg-slate-800 font-bold mt-4"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <QrCode className="w-4 h-4 mr-2" /> Mở Vé QR
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {!loading && filteredBookings.length === 0 && (
              <div className="text-center py-20 border-2 border-dashed border-slate-300 rounded-xl bg-white">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <HistoryIcon className="w-8 h-8" />
                </div>
                <h3 className="text-slate-500 font-bold">Chưa có dữ liệu</h3>
              </div>
            )}
          </div>
        </Tabs>

        <BookingQrDialog
          booking={selectedBooking}
          open={Boolean(selectedBooking)}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedBooking(null);
            }
          }}
        />
      </main>
    </div>
  );
};

export default Bookings;
