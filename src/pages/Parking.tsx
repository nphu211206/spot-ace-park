import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import ParkingList from "@/components/parking/ParkingList";
import ParkingFilters from "@/components/parking/ParkingFilters";
import Parking3DView from "@/components/parking/Parking3DView";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Box, List, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  amenities: string[] | null; // Backend trả về string, cần parse nếu là JSON
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
    
    // Polling đơn giản để cập nhật dữ liệu (Thay thế Realtime của Supabase)
    const interval = setInterval(fetchParkingLots, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchParkingLots = async () => {
    try {
      // GỌI API TỪ SERVER LOCAL CỦA BẠN
      const response = await fetch('http://localhost:3000/api/parking-lots');
      if (!response.ok) throw new Error('Lỗi kết nối Server');
      
      const data = await response.json();
      
      // Parse amenities nếu nó là chuỗi từ SQL Server
      const processedData = data.map((lot: any) => ({
         ...lot,
         amenities: typeof lot.amenities === 'string' ? lot.amenities.split(',') : lot.amenities
      }));

      setParkingLots(processedData);
      setFilteredLots(processedData);
      
      if (!selectedLotId && processedData.length > 0) {
        setSelectedLotId(processedData[0].id);
      }
      setLoading(false);
    } catch (error: any) {
      console.error(error);
      // toast.error("Không kết nối được Server Local!");
    }
  };

  // ... (Giữ nguyên phần handleFilter và return UI như cũ)
  // ĐỂ TIẾT KIỆM DÒNG, BẠN COPY LẠI PHẦN UI (return) CỦA FILE CŨ VÀO ĐÂY.
  // HOẶC DÙNG FILE FULL BÊN DƯỚI NẾU BẠN MUỐN CHẮC CHẮN:

  const handleFilter = (filters: { search: string; minPrice: number; maxPrice: number; minRating: number }) => {
    let filtered = [...parkingLots];
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(lot => 
        lot.name.toLowerCase().includes(term) || lot.address.toLowerCase().includes(term)
      );
    }
    filtered = filtered.filter(lot => 
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
              Dữ liệu từ SQL Server (Local)
            </p>
          </div>

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "3d")} className="w-full md:w-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list"><List className="w-4 h-4 mr-2" /> Danh sách</TabsTrigger>
              <TabsTrigger value="3d"><Box className="w-4 h-4 mr-2" /> Bản đồ 3D</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1 space-y-6">
            <ParkingFilters onFilter={handleFilter} />
            {viewMode === "3d" && (
              <div className="bg-card rounded-lg border p-4 shadow-sm">
                <h3 className="font-semibold mb-3">Chọn bãi xe:</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {filteredLots.map(lot => (
                    <div key={lot.id} onClick={() => setSelectedLotId(lot.id)} className={`p-3 rounded-md cursor-pointer border ${selectedLotId === lot.id ? "bg-primary/10 border-primary" : "hover:bg-muted border-transparent"}`}>
                      <div className="font-medium text-sm">{lot.name}</div>
                      <div className="flex justify-between mt-1"><span className="text-xs text-muted-foreground">{lot.available_spots} chỗ</span><Badge variant="secondary" className="text-[10px]">{lot.current_price.toLocaleString()}đ</Badge></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <div className="lg:col-span-3">
            {loading ? <div className="text-center py-20">Đang tải dữ liệu...</div> : (
              viewMode === "list" ? <ParkingList parkingLots={filteredLots} /> : (
                selectedLot ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                      <div><h2 className="text-2xl font-bold">{selectedLot.name}</h2><p className="text-muted-foreground">{selectedLot.address}</p></div>
                      <Button size="lg" onClick={() => navigate(`/parking/${selectedLot.id}`)}>Đặt chỗ ngay</Button>
                    </div>
                    <Parking3DView parkingLot={selectedLot} onBook={(spotId) => {
                        toast.success(`Chọn vị trí ${spotId}`);
                        setTimeout(() => navigate(`/parking/${selectedLot.id}?spot=${spotId}`), 500);
                    }} />
                  </div>
                ) : <div className="text-center">Chọn bãi xe để xem</div>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Parking;