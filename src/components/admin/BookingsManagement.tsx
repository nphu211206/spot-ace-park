import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  total_cost: number;
  status: string;
  profiles: {
    full_name: string;
  };
  parking_lots: {
    name: string;
  };
}

const BookingsManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          start_time,
          end_time,
          total_cost,
          status,
          user_id,
          profiles!bookings_user_id_fkey (full_name),
          parking_lots (name)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setBookings(data as any || []);
    } catch (error: any) {
      toast.error("Không thể tải danh sách đặt chỗ");
    } finally {
      setLoading(false);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý đặt chỗ</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Bãi xe</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead className="text-right">Chi phí</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">
                  {booking.profiles.full_name}
                </TableCell>
                <TableCell>{booking.parking_lots.name}</TableCell>
                <TableCell className="text-sm">
                  {format(new Date(booking.start_time), "dd/MM/yyyy HH:mm", {
                    locale: vi,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  {booking.total_cost.toLocaleString()}đ
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(booking.status)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default BookingsManagement;