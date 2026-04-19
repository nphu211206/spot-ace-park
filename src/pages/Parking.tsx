import { Suspense, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import ParkingFilters from "@/components/parking/ParkingFilters";
import Parking3DView from "@/components/parking/Parking3DView";
import RoutePreviewMap from "@/components/maps/RoutePreviewMap";
import { toast } from "sonner";
import {
  Clock3,
  Info,
  List,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  Route,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { buildGoogleMapsDirectionsUrl, getUserLocation } from "@/features/charging/maps";
import { LatLng, RoutePreview } from "@/features/charging/types";

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
  const routeCardRef = useRef<HTMLDivElement | null>(null);

  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [filteredLots, setFilteredLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [routePreview, setRoutePreview] = useState<RoutePreview | null>(null);
  const [locationState, setLocationState] = useState<"idle" | "loading" | "ready" | "denied" | "error">("idle");

  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();

  useEffect(() => {
    const fetchParkingLots = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/parking-lots");
        if (!response.ok) {
          throw new Error("Server Error");
        }

        const data = await response.json();
        const processedData = data.map((lot: any) => ({
          ...lot,
          amenities: typeof lot.amenities === "string" ? lot.amenities.split(",") : lot.amenities || [],
        }));

        setParkingLots(processedData);
        setFilteredLots(processedData);
        if (processedData.length > 0) {
          setSelectedLot(processedData[0]);
        }
      } catch {
        toast.error("Không kết nối được server. Hãy chạy backend local trước khi test.");
      } finally {
        setLoading(false);
      }
    };

    fetchParkingLots();
  }, []);

  const refreshLocation = async () => {
    setLocationState("loading");

    try {
      const location = await getUserLocation();
      setUserLocation(location);
      setLocationState("ready");
      toast.success("Đã lấy vị trí hiện tại và đang cập nhật tuyến tới bãi đã chọn.");
    } catch (error: any) {
      const nextState = error?.code === 1 ? "denied" : "error";
      setLocationState(nextState);
      setUserLocation(null);
      setRoutePreview(null);
      toast.error(
        nextState === "denied"
          ? "Bạn đã từ chối quyền định vị. Vẫn có thể mở Google Maps để đi tiếp."
          : "Không lấy được vị trí hiện tại. Hãy thử lại sau ít phút.",
      );
    }
  };

  useEffect(() => {
    refreshLocation();
  }, []);

  useEffect(() => {
    setRoutePreview(null);
  }, [selectedLot?.id]);

  const handleFilter = (filters: any) => {
    let filtered = [...parkingLots];

    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(
        (lot) => lot.name.toLowerCase().includes(term) || lot.address.toLowerCase().includes(term),
      );
    }

    setFilteredLots(filtered);
    if (filtered.length > 0) {
      setSelectedLot(filtered[0]);
    }
  };

  const handleBook = (spotId: string) => {
    if (!selectedLot) return;
    toast.success(`Đã chọn vị trí ${spotId}.`);
    setTimeout(() => {
      navigate(`/parking/${selectedLot.id}?spot=${spotId}`);
    }, 500);
  };

  const handlePreviewDirections = async () => {
    routeCardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });

    if (locationState !== "loading" && !userLocation) {
      await refreshLocation();
      return;
    }

    if (userLocation) {
      toast.success("Tuyến đường trong app đã sẵn sàng cho bãi đang chọn.");
    }
  };

  const destination = selectedLot
    ? {
        lat: selectedLot.latitude,
        lng: selectedLot.longitude,
      }
    : null;

  const googleMapsUrl = destination ? buildGoogleMapsDirectionsUrl(userLocation, destination) : "#";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header />
      <main className="flex min-h-[calc(100vh-64px)] w-full flex-col px-4 py-6 xl:px-6 2xl:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Đặt Chỗ Thông Minh</h1>
          <p className="mt-1 text-sm text-slate-500">Parking digital twin + chỉ đường thật ngay trong app</p>
        </div>

        <div className="grid h-full gap-6 pb-6 lg:grid-cols-[330px_minmax(0,1fr)] 2xl:grid-cols-[350px_minmax(0,1fr)]">
          <div className="flex h-full flex-col gap-6">
            <ParkingFilters onFilter={handleFilter} />

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50/50 p-4">
                <h3 className="flex items-center gap-2 font-bold text-slate-700">
                  <List className="h-4 w-4" />
                  Danh sách bãi xe ({filteredLots.length})
                </h3>
              </div>
              <ScrollArea className="flex-1">
                <div className="space-y-3 p-3">
                  {loading ? (
                    <div className="py-10 text-center text-slate-400">
                      <Loader2 className="mx-auto animate-spin" />
                    </div>
                  ) : filteredLots.length === 0 ? (
                    <div className="py-10 text-center text-slate-400">Không tìm thấy bãi xe nào</div>
                  ) : (
                    filteredLots.map((lot) => (
                      <div
                        key={lot.id}
                        onClick={() => setSelectedLot(lot)}
                        className={`relative cursor-pointer overflow-hidden rounded-lg border p-4 transition-all ${
                          selectedLot?.id === lot.id
                            ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                            : "border-slate-200 bg-white hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <h4 className={`font-bold ${selectedLot?.id === lot.id ? "text-blue-700" : "text-slate-800"}`}>{lot.name}</h4>
                          <Badge variant="secondary" className="border border-slate-100 bg-white text-yellow-600 shadow-sm">
                            <Star className="mr-1 h-3 w-3 fill-yellow-400 stroke-yellow-400" /> {lot.rating}
                          </Badge>
                        </div>

                        <div className="mb-3 mt-2 flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="h-3 w-3" />
                          {lot.address}
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                            Trống: <span className="font-bold text-emerald-600">{lot.available_spots}</span>
                          </div>
                          <span className="font-bold text-blue-600">{lot.current_price?.toLocaleString()}đ/h</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          <div className="flex h-full min-w-0 flex-col gap-4">
            {selectedLot ? (
              <Card className="flex flex-1 flex-col overflow-hidden border-slate-200 bg-white shadow-lg">
                <div className="relative z-10 flex items-center justify-between border-b border-slate-100 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <Navigation className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">{selectedLot.name}</h2>
                      <p className="flex items-center gap-1 text-xs text-slate-500">
                        <Info className="h-3 w-3" />
                        Chọn ô trống để đặt chỗ, xem route tới bãi và cảm nhận không gian trước khi đến.
                      </p>
                    </div>
                  </div>

                  <div className="hidden gap-2 xl:flex">
                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                      {selectedLot.available_spots}/{selectedLot.total_spots} chỗ trống
                    </Badge>
                    <Badge variant="outline" className="border-slate-200 text-slate-600">
                      {selectedLot.current_price?.toLocaleString()}đ/h
                    </Badge>
                  </div>
                </div>

                <div className="grid flex-1 gap-4 bg-slate-100 p-4 xl:grid-cols-[310px_minmax(0,1fr)] 2xl:grid-cols-[330px_minmax(0,1.25fr)]">
                  <div ref={routeCardRef} className="space-y-4 xl:max-w-[330px]">
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Route & arrival</p>
                          <h3 className="mt-2 text-2xl font-black text-slate-900">Chỉ đường tới bãi</h3>
                          <p className="mt-2 text-sm text-slate-500">{selectedLot.address}</p>
                        </div>
                        <Badge className="bg-slate-900 text-white hover:bg-slate-900">Parking live twin</Badge>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-emerald-50 p-4">
                          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Còn trống</div>
                          <div className="mt-2 text-2xl font-black text-emerald-600">{selectedLot.available_spots}</div>
                        </div>
                        <div className="rounded-2xl bg-slate-100 p-4">
                          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Giá hiện tại</div>
                          <div className="mt-2 text-2xl font-black text-slate-900">{selectedLot.current_price?.toLocaleString()}đ</div>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <Button onClick={refreshLocation} variant="outline" className="border-slate-200 bg-white">
                          <LocateFixed className="mr-2 h-4 w-4" />
                          {locationState === "loading" ? "Đang lấy vị trí..." : "Cập nhật vị trí"}
                        </Button>
                        <Button onClick={handlePreviewDirections} variant="secondary" className="bg-slate-900 text-white hover:bg-slate-800">
                          <Route className="mr-2 h-4 w-4" />
                          Chỉ đường
                        </Button>
                        <Button asChild className="bg-blue-600 hover:bg-blue-700">
                          <a href={googleMapsUrl} target="_blank" rel="noreferrer">
                            <Navigation className="mr-2 h-4 w-4" />
                            Mở Google Maps
                          </a>
                        </Button>
                      </div>
                    </div>

                    {destination && (
                      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Directions</p>
                            <h3 className="mt-2 text-xl font-black text-slate-900">Tuyến đường trong app</h3>
                          </div>
                          <Badge variant="outline" className="border-slate-200 text-slate-600">
                            {mapsApiKey ? "Google Maps" : "OpenStreetMap"}
                          </Badge>
                        </div>

                        <RoutePreviewMap
                          apiKey={mapsApiKey}
                          origin={userLocation}
                          destination={destination}
                          destinationLabel={selectedLot.name}
                          onRouteResolved={setRoutePreview}
                          onError={(message) => toast.error(message)}
                          emptyDescription={`Cấp quyền định vị để xem tuyến thật tới ${selectedLot.name}.`}
                        />

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-2xl bg-slate-100 p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                              <Route className="h-3.5 w-3.5" />
                              Khoảng cách
                            </div>
                            <div className="mt-2 text-2xl font-black text-slate-900">{routePreview?.distanceText || "Đợi định vị"}</div>
                          </div>
                          <div className="rounded-2xl bg-slate-100 p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                              <Clock3 className="h-3.5 w-3.5" />
                              ETA
                            </div>
                            <div className="mt-2 text-2xl font-black text-slate-900">{routePreview?.durationText || "Đợi định vị"}</div>
                          </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                          {locationState === "denied" && "Bạn đã từ chối vị trí. App vẫn cho mở lộ trình chuẩn trên Google Maps."}
                          {locationState === "error" && "Không lấy được vị trí hiện tại. Hãy thử lại để tải tuyến thật trong app."}
                          {locationState === "ready" && "App đang dùng vị trí hiện tại để tính tuyến thật và ETA tới bãi đã chọn."}
                          {locationState === "loading" && "Đang xin quyền định vị và đồng bộ lộ trình..."}
                          {locationState === "idle" && "Chuẩn bị lấy vị trí hiện tại..."}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="min-h-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">3D Parking Twin</p>
                        <h2 className="mt-2 text-2xl font-black text-slate-900">Mô phỏng bãi đỗ xe</h2>
                        <p className="mt-2 text-sm text-slate-500">Digital twin giữ nguyên thao tác đặt chỗ nhưng được dựng lại theo profile bãi thực tế hơn.</p>
                      </div>
                      <Badge className="bg-slate-900 text-white hover:bg-slate-900">
                        {selectedLot.rating} <Star className="ml-1 h-3.5 w-3.5 fill-white stroke-white" />
                      </Badge>
                    </div>

                    <Suspense fallback={<div className="flex h-[820px] items-center justify-center text-slate-400">Đang tải mô hình 3D...</div>}>
                      <Parking3DView
                        parkingLot={selectedLot}
                        onBook={handleBook}
                        className="h-[820px] xl:h-[calc(100vh-210px)] xl:min-h-[780px] 2xl:min-h-[860px]"
                      />
                    </Suspense>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-100 text-slate-400">
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
