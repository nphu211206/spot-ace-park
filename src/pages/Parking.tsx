import { useEffect, useState, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import ParkingFilters from "@/components/parking/ParkingFilters";
import Parking3DView from "@/components/parking/Parking3DView";
import { toast } from "sonner";
import { List, MapPin, Star, Navigation, Info, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);

  useEffect(() => {
    const fetchParkingLots = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/parking-lots');
        if (!response.ok) throw new Error('Server Error');
        const data = await response.json();
        
        const processedData = data.map((lot: any) => ({
           ...lot,
           amenities: typeof lot.amenities === 'string' ? lot.amenities.split(',') : lot.amenities || []
        }));

        setParkingLots(processedData);
        setFilteredLots(processedData);
        if (processedData.length > 0) setSelectedLot(processedData[0]);
      } catch (error) {
        toast.error("Không kết nối được Server. Hãy chạy 'node server.js'");
      } finally {
        setLoading(false);
      }
    };

    fetchParkingLots();
  }, []);

  const handleFilter = (filters: any) => {
    let filtered = [...parkingLots];
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(lot => 
        lot.name.toLowerCase().includes(term) || lot.address.toLowerCase().includes(term)
      );
    }
    setFilteredLots(filtered);
    if (filtered.length > 0) setSelectedLot(filtered[0]);
  };

  const handleBook = (spotId: string) => {
    if(!selectedLot) return;
    toast.success(`Đã chọn vị trí ${spotId}.`);
    setTimeout(() => {
        navigate(`/parking/${selectedLot.id}?spot=${spotId}`);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-6 h-[calc(100vh-64px)] flex flex-col">
        
        <div className="mb-6">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Đặt Chỗ Thông Minh</h1>
            <p className="text-slate-500 mt-1 text-sm">Hệ thống bản sao số (Digital Twin)</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 h-full pb-6">
            {/* DANH SÁCH BÃI XE */}
            <div className="lg:col-span-4 flex flex-col gap-6 h-full">
                <ParkingFilters onFilter={handleFilter} />
                
                <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <List className="w-4 h-4"/> Danh sách bãi xe ({filteredLots.length})
                        </h3>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-3 space-y-3">
                            {loading ? (
                                <div className="text-center py-10 text-slate-400"><Loader2 className="animate-spin mx-auto"/></div>
                            ) : filteredLots.length === 0 ? (
                                <div className="text-center py-10 text-slate-400">Không tìm thấy bãi xe nào</div>
                            ) : filteredLots.map((lot) => (
                                <div 
                                    key={lot.id} 
                                    onClick={() => setSelectedLot(lot)}
                                    className={`p-4 rounded-lg cursor-pointer transition-all border group relative overflow-hidden ${selectedLot?.id === lot.id ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500" : "bg-white border-slate-200 hover:border-blue-300"}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <h4 className={`font-bold ${selectedLot?.id === lot.id ? "text-blue-700" : "text-slate-800"}`}>{lot.name}</h4>
                                        <Badge variant="secondary" className="bg-white shadow-sm border border-slate-100 text-yellow-600">
                                            <Star className="w-3 h-3 fill-yellow-400 stroke-yellow-400 mr-1" /> {lot.rating}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-2 mb-3">
                                        <MapPin className="w-3 h-3" /> {lot.address}
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-600">
                                            Trống: <span className="text-emerald-600 font-bold">{lot.available_spots}</span>
                                        </div>
                                        <span className="font-bold text-blue-600">{lot.current_price?.toLocaleString()}đ/h</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* BẢN ĐỒ 3D (ĐÃ BỌC SUSPENSE ĐỂ TRÁNH TRẮNG TRANG) */}
            <div className="lg:col-span-8 flex flex-col h-full gap-4">
                {selectedLot ? (
                    <Card className="flex-1 border-slate-200 shadow-lg overflow-hidden flex flex-col bg-white">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white z-10 relative">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                    <Navigation className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg text-slate-800">{selectedLot.name}</h2>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Info className="w-3 h-3"/> Chọn ô trống màu xanh để đặt chỗ
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex-1 bg-slate-100 relative">
                            <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-slate-400">Đang tải mô hình 3D...</div>}>
                                <Parking3DView parkingLot={selectedLot} onBook={handleBook} />
                            </Suspense>
                        </div>
                    </Card>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 text-slate-400">
                        Chọn một bãi đỗ xe để xem chi tiết
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
};

export default Parking;