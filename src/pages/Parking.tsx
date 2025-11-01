import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import ParkingList from "@/components/parking/ParkingList";
import ParkingFilters from "@/components/parking/ParkingFilters";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [filteredLots, setFilteredLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParkingLots();
  }, []);

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
    } catch (error: any) {
      toast.error("Không thể tải danh sách bãi đỗ xe");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters: { search: string; minPrice: number; maxPrice: number; minRating: number }) => {
    let filtered = [...parkingLots];

    if (filters.search) {
      filtered = filtered.filter(
        (lot) =>
          lot.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          lot.address.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    filtered = filtered.filter(
      (lot) =>
        lot.current_price >= filters.minPrice &&
        lot.current_price <= filters.maxPrice &&
        lot.rating >= filters.minRating
    );

    setFilteredLots(filtered);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Tìm kiếm bãi đỗ xe</h1>
        <div className="grid lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <ParkingFilters onFilter={handleFilter} />
          </aside>
          <div className="lg:col-span-3">
            {loading ? (
              <p className="text-center">Đang tải...</p>
            ) : (
              <ParkingList parkingLots={filteredLots} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Parking;