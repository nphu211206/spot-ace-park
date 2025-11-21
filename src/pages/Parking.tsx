import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import ParkingList from "@/components/parking/ParkingList";
import ParkingFilters from "@/components/parking/ParkingFilters";
import Parking3DView from "@/components/parking/Parking3DView";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Box, List, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // <--- ĐÃ THÊM DÒNG NÀY ĐỂ FIX LỖI

export interface ParkingLot {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  total_spots: number;
  available_spots: number;
  base_price: number;
  current_price: number;
  rating: number;
  description: string | null;
  amenities: string[] | null;
  image_url: string | null;
}

const Parking = () => {
  const navigate = useNavigate();
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [filteredLots, setFilteredLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "3d">("list");

  useEffect(() => {
    fetchParkingLots();
    subscribeToRealtimeUpdates();
  }, []);

  const subscribeToRealtimeUpdates = () => {
    const channel = supabase
      .channel('parking-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'parking_lots' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setParkingLots((prev) => 
              prev.map((lot) => lot.id === payload.new.id ? { ...lot, ...payload.new } as ParkingLot : lot)
            );
            setFilteredLots((prev) => 
              prev.map((lot) => lot.id === payload.new.id ? { ...lot, ...payload.new } as ParkingLot : lot)
            );
            toast.info(`⚡ AI Update: Bãi xe ${payload.new.name} vừa cập nhật trạng thái!`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchParkingLots = async () => {
    try {
      const { data, error } = await supabase
        .from("parking_lots")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setParkingLots(data || []);
      setFilteredLots(data || []);
      
      if (data && data.length > 0) {
        setSelectedLotId(data[0].id);
      }
    } catch (error: any) {
      toast.error("Không thể tải danh sách bãi đỗ xe");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters: { search: string; minPrice: number; maxPrice: number; minRating: number }) => {
    let filtered = [...parkingLots];

    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(
        (lot) =>
          lot.name.toLowerCase().includes(term) ||
          lot.address.toLowerCase().includes(term)
      );
    }

    filtered = filtered.filter(
      (lot) =>
        lot.current_price >= filters.minPrice &&
        lot.current_price <= filters.maxPrice &&
        (lot.rating || 0) >= filters.minRating
    );

    setFilteredLots(filtered);
  };

  const selectedLot = parkingLots.find(lot => lot.id === selectedLotId);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Hệ thống Đỗ xe Thông minh
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Radio className="w-4 h-4 text-green-500 animate-pulse" /> 
              Dữ liệu cập nhật thời gian thực (Live)
            </p>
          </div>

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "3d")} className="w-full md:w-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">
                <List className="w-4 h-4 mr-2" /> Danh sách
              </TabsTrigger>
              <TabsTrigger value="3d">
                <Box className="w-4 h-4 mr-2" /> Bản đồ 3D
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1 space-y-6">
            <ParkingFilters onFilter={handleFilter} />
            
            {viewMode === "3d" && (
              <div className="bg-card rounded-lg border p-4 shadow-sm animate-in slide-in-from-left">
                <h3 className="font-semibold mb-3">Chọn bãi xe để xem 3D:</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {filteredLots.map(lot => (
                    <div 
                      key={lot.id}
                      onClick={() => setSelectedLotId(lot.id)}
                      className={`p-3 rounded-md cursor-pointer transition-all border ${
                        selectedLotId === lot.id 
                          ? "bg-primary/10 border-primary" 
                          : "hover:bg-muted border-transparent"
                      }`}
                    >
                      <div className="font-medium text-sm">{lot.name}</div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-muted-foreground">{lot.available_spots} chỗ trống</span>
                        <Badge variant="secondary" className="text-[10px]">{lot.current_price.toLocaleString()}đ</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {viewMode === "list" ? (
                  <ParkingList parkingLots={filteredLots} />
                ) : (
                  <div className="animate-in fade-in duration-500">
                    {selectedLot ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                          <div>
                            <h2 className="text-2xl font-bold">{selectedLot.name}</h2>
                            <p className="text-muted-foreground">{selectedLot.address}</p>
                          </div>
                          {/* Nút này sẽ dẫn sang trang BookingPage mới */}
                          <Button size="lg" onClick={() => navigate(`/parking/${selectedLot.id}`)}>
                            Đặt chỗ ngay
                          </Button>
                        </div>
                        
                        <Parking3DView 
                          parkingLot={selectedLot} 
                          onBook={(spotId) => {
                            toast.success(`Đã chọn vị trí ${spotId}`, {
                              description: "Đang chuyển sang trang thanh toán...",
                            });
                            // Chuyển hướng sang trang đặt chỗ
                            setTimeout(() => navigate(`/parking/${selectedLot.id}?spot=${spotId}`), 1000);
                          }}
                        />
                        
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div className="bg-card p-4 rounded-lg border text-center">
                            <div className="text-2xl font-bold text-green-500">{selectedLot.available_spots}</div>
                            <div className="text-xs text-muted-foreground uppercase">Chỗ trống</div>
                          </div>
                          <div className="bg-card p-4 rounded-lg border text-center">
                            <div className="text-2xl font-bold text-primary">{selectedLot.total_spots}</div>
                            <div className="text-xs text-muted-foreground uppercase">Tổng sức chứa</div>
                          </div>
                          <div className="bg-card p-4 rounded-lg border text-center">
                            <div className="text-2xl font-bold text-yellow-500">{selectedLot.rating} ⭐</div>
                            <div className="text-xs text-muted-foreground uppercase">Đánh giá</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-20 text-muted-foreground">
                        Vui lòng chọn một bãi xe để xem mô hình 3D
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Parking;