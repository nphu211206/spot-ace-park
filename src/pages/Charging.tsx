import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  BatteryCharging,
  CarFront,
  Clock3,
  LocateFixed,
  MapPin,
  Navigation,
  Route,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Header from "@/components/layout/Header";
import ChargingStation3DView from "@/components/charging/ChargingStation3DView";
import ChargingRouteMap from "@/components/charging/ChargingRouteMap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { buildGoogleMapsDirectionsUrl, getUserLocation } from "@/features/charging/maps";
import { getChargingStations } from "@/features/charging/service";
import { ChargingStation, LatLng, StationRoutePreview } from "@/features/charging/types";

const Charging = () => {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>("");
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [routePreview, setRoutePreview] = useState<StationRoutePreview | null>(null);
  const [locationState, setLocationState] = useState<"idle" | "loading" | "ready" | "denied" | "error">("idle");

  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();

  useEffect(() => {
    const loadStations = async () => {
      const data = await getChargingStations();
      setStations(data);
      if (data.length > 0) {
        setSelectedStationId(data[0].id);
      }
    };

    loadStations();
  }, []);

  const selectedStation = stations.find((station) => station.id === selectedStationId) || null;

  const refreshLocation = async () => {
    setLocationState("loading");

    try {
      const location = await getUserLocation();
      setUserLocation(location);
      setLocationState("ready");
      toast.success("Đã lấy vị trí hiện tại. Tuyến đường đang được cập nhật.");
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

  const totals = stations.reduce(
    (summary, station) => {
      summary.total += station.totalConnectors;
      summary.available += station.availableConnectors;
      summary.active += station.activeChargingVehicles;
      return summary;
    },
    { total: 0, available: 0, active: 0 },
  );

  if (!selectedStation) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center text-slate-500">Đang tải dữ liệu trạm sạc EV...</div>
        </main>
      </div>
    );
  }

  const destination = {
    lat: selectedStation.latitude,
    lng: selectedStation.longitude,
  };
  const googleMapsUrl = buildGoogleMapsDirectionsUrl(userLocation, destination);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              <BatteryCharging className="mr-2 h-3.5 w-3.5" />
              EV Charging Discovery
            </Badge>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Tìm trạm sạc điện gần bạn</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-500">
                Chọn trạm, xem mô phỏng digital twin, kiểm tra số cổng còn trống và dẫn đường thật tới điểm sạc.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-center">
              <div className="text-2xl font-black text-emerald-600">{totals.available}</div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Cổng trống</div>
            </div>
            <div className="rounded-2xl bg-sky-50 px-4 py-3 text-center">
              <div className="text-2xl font-black text-sky-600">{totals.active}</div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700">Đang sạc</div>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-center">
              <div className="text-2xl font-black text-slate-800">{totals.total}</div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">Tổng cổng</div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <Card className="overflow-hidden border-slate-200 shadow-sm xl:col-span-4">
            <div className="border-b border-slate-100 bg-white px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Danh sách trạm sạc</h2>
                  <p className="text-xs text-slate-500">Dữ liệu demo có cấu trúc, sẵn cho phase backend thật.</p>
                </div>
                <Badge variant="outline" className="border-slate-200 text-slate-600">
                  {stations.length} trạm
                </Badge>
              </div>
            </div>
            <ScrollArea className="h-[760px] bg-slate-50/60">
              <div className="space-y-4 p-4">
                {stations.map((station) => {
                  const isSelected = station.id === selectedStation.id;

                  return (
                    <button
                      key={station.id}
                      type="button"
                      onClick={() => setSelectedStationId(station.id)}
                      className={`w-full overflow-hidden rounded-3xl border text-left transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                      }`}
                    >
                      <div className="relative h-40">
                        <img src={station.heroImage} alt={station.name} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">SpotAce Demo</div>
                            <div className="text-lg font-black text-white">{station.name}</div>
                          </div>
                          <Badge
                            className={`border-0 ${
                              station.status === "busy" ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
                            }`}
                          >
                            {station.status === "busy" ? "Đông xe" : "Sẵn sàng"}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-4 p-4">
                        <div className="flex items-start gap-2 text-sm text-slate-500">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                          <span>{station.address}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="rounded-2xl bg-emerald-50 p-3 text-center">
                            <div className="text-xl font-black text-emerald-600">{station.availableConnectors}</div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">Còn trống</div>
                          </div>
                          <div className="rounded-2xl bg-sky-50 p-3 text-center">
                            <div className="text-xl font-black text-sky-600">{station.activeChargingVehicles}</div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-700">Đang sạc</div>
                          </div>
                          <div className="rounded-2xl bg-slate-100 p-3 text-center">
                            <div className="text-xl font-black text-slate-800">{station.maxPowerKw}</div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">kW max</div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {station.supportedConnectorTypes.map((connectorType) => (
                            <Badge key={connectorType} variant="outline" className="border-slate-200 bg-white text-slate-600">
                              {connectorType}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </Card>

          <div className="space-y-6 xl:col-span-4">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="space-y-5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Route & status</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900">{selectedStation.name}</h2>
                    <p className="mt-2 text-sm text-slate-500">{selectedStation.address}</p>
                  </div>
                  <Badge className="bg-slate-900 text-white hover:bg-slate-900">
                    <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                    Demo telemetry
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedStation.amenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                      {amenity}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={refreshLocation} variant="outline" className="border-slate-200 bg-white">
                    <LocateFixed className="mr-2 h-4 w-4" />
                    {locationState === "loading" ? "Đang lấy vị trí..." : "Cập nhật vị trí"}
                  </Button>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <a href={googleMapsUrl} target="_blank" rel="noreferrer">
                      <Navigation className="mr-2 h-4 w-4" />
                      Mở Google Maps
                    </a>
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-emerald-50 p-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Cổng trống</div>
                    <div className="mt-2 text-2xl font-black text-emerald-600">{selectedStation.availableConnectors}</div>
                  </div>
                  <div className="rounded-2xl bg-sky-50 p-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Đang sạc</div>
                    <div className="mt-2 text-2xl font-black text-sky-600">{selectedStation.activeChargingVehicles}</div>
                  </div>
                  <div className="rounded-2xl bg-violet-50 p-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">Tổng cổng</div>
                    <div className="mt-2 text-2xl font-black text-violet-600">{selectedStation.totalConnectors}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Directions</p>
                    <h3 className="mt-2 text-xl font-black text-slate-900">Tuyến đường trong app</h3>
                  </div>
                  <Badge variant="outline" className="border-slate-200 text-slate-600">
                    {mapsApiKey ? "Google Maps" : "OpenStreetMap"}
                  </Badge>
                </div>

                <ChargingRouteMap
                  apiKey={mapsApiKey}
                  origin={userLocation}
                  destination={destination}
                  stationName={selectedStation.name}
                  onRouteResolved={setRoutePreview}
                  onError={(message) => toast.error(message)}
                />

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-100 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      <Route className="h-3.5 w-3.5" />
                      Khoảng cách
                    </div>
                    <div className="mt-2 text-2xl font-black text-slate-900">
                      {routePreview?.distanceText || "Đợi định vị"}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      <Clock3 className="h-3.5 w-3.5" />
                      ETA
                    </div>
                    <div className="mt-2 text-2xl font-black text-slate-900">
                      {routePreview?.durationText || "Đợi định vị"}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  {locationState === "denied" && "Bạn đã từ chối vị trí. App vẫn cho mở lộ trình chuẩn trên Google Maps."}
                  {locationState === "error" && "Không lấy được vị trí hiện tại. Hãy thử lại để tải tuyến thật trong app."}
                  {locationState === "ready" && "App đang dùng vị trí hiện tại để tính tuyến thật và ETA tới trạm đã chọn."}
                  {locationState === "loading" && "Đang xin quyền định vị và đồng bộ lộ trình..."}
                  {locationState === "idle" && "Chuẩn bị lấy vị trí hiện tại..."}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 xl:col-span-4">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">3D Digital Twin</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900">Mô phỏng trạm sạc</h2>
                  </div>
                  <Badge className="bg-slate-900 text-white hover:bg-slate-900">
                    <Zap className="mr-1.5 h-3.5 w-3.5" />
                    {selectedStation.maxPowerKw}kW max
                  </Badge>
                </div>

                <ChargingStation3DView station={selectedStation} />

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-100 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      <BatteryCharging className="h-3.5 w-3.5" />
                      Connector types
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedStation.supportedConnectorTypes.map((connectorType) => (
                        <Badge key={connectorType} variant="outline" className="border-slate-200 bg-white text-slate-700">
                          {connectorType}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      <CarFront className="h-3.5 w-3.5" />
                      Xe đang sạc
                    </div>
                    <div className="mt-2 text-3xl font-black text-slate-900">{selectedStation.activeChargingVehicles}</div>
                    <div className="mt-1 text-sm text-slate-500">HUD và scene dùng cùng một snapshot dữ liệu.</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Charging;
