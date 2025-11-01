import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar, MapPin, Car } from "lucide-react";

interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  total_cost: number;
  status: string;
  vehicle_number: string | null;
  parking_lots: {
    name: string;
    address: string;
  };
}

interface BookingListProps {
  userId: string;
}

const BookingList = ({ userId }: BookingListProps) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [userId]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          parking_lots (name, address)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast.error("Không thể tải lịch sử đặt chỗ");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (error) throw error;
      toast.success("Đã hủy đặt chỗ thành công");
      fetchBookings();
    } catch (error: any) {
      toast.error("Không thể hủy đặt chỗ");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      confirmed: "default",
      cancelled: "destructive",
      completed: "secondary",
    };
    const labels: Record<string, string> = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      cancelled: "Đã hủy",
      completed: "Hoàn thành",
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  if (loading) {
    return <p>Đang tải...</p>;
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Chưa có lịch sử đặt chỗ</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{booking.parking_lots.name}</CardTitle>
              {getStatusBadge(booking.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {booking.parking_lots.address}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />
              <span>
                {format(new Date(booking.start_time), "dd/MM/yyyy HH:mm", { locale: vi })} -{" "}
                {format(new Date(booking.end_time), "HH:mm", { locale: vi })}
              </span>
            </div>
            {booking.vehicle_number && (
              <div className="flex items-center gap-2 text-sm">
                <Car className="w-4 h-4" />
                <span>Biển số: {booking.vehicle_number}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Tổng chi phí</p>
                <p className="text-xl font-bold text-primary">
                  {booking.total_cost.toLocaleString()}đ
                </p>
              </div>
              {booking.status === "confirmed" && (
                <Button
                  variant="outline"
                  onClick={() => handleCancelBooking(booking.id)}
                >
                  Hủy đặt chỗ
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BookingList;