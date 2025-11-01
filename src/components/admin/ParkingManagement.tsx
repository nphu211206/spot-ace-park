import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
import { Plus } from "lucide-react";

interface ParkingLot {
  id: string;
  name: string;
  address: string;
  total_spots: number;
  available_spots: number;
  base_price: number;
  is_active: boolean;
}

const ParkingManagement = () => {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParkingLots();
  }, []);

  const fetchParkingLots = async () => {
    try {
      const { data, error } = await supabase
        .from("parking_lots")
        .select("id, name, address, total_spots, available_spots, base_price, is_active")
        .order("name");

      if (error) throw error;
      setParkingLots(data || []);
    } catch (error: any) {
      toast.error("Không thể tải danh sách bãi xe");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("parking_lots")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success("Đã cập nhật trạng thái");
      fetchParkingLots();
    } catch (error: any) {
      toast.error("Không thể cập nhật");
    }
  };

  if (loading) {
    return <p>Đang tải...</p>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Quản lý bãi đỗ xe</CardTitle>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Thêm bãi xe
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên bãi</TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead className="text-center">Tổng chỗ</TableHead>
              <TableHead className="text-center">Chỗ trống</TableHead>
              <TableHead className="text-right">Giá cơ bản</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parkingLots.map((lot) => (
              <TableRow key={lot.id}>
                <TableCell className="font-medium">{lot.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {lot.address}
                </TableCell>
                <TableCell className="text-center">{lot.total_spots}</TableCell>
                <TableCell className="text-center">{lot.available_spots}</TableCell>
                <TableCell className="text-right">
                  {lot.base_price.toLocaleString()}đ
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={lot.is_active ? "default" : "secondary"}>
                    {lot.is_active ? "Hoạt động" : "Tạm ngừng"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(lot.id, lot.is_active)}
                  >
                    {lot.is_active ? "Tạm ngừng" : "Kích hoạt"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ParkingManagement;