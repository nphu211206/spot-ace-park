import { useEffect, useRef, useState } from "react";
import { Loader2, MapPinned, Route, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  buildGoogleMapsDirectionsUrl,
  fetchOpenStreetMapRoute,
  loadGoogleMapsScript,
  loadLeafletAssets,
} from "@/features/charging/maps";
import {
  buildFallbackRoutePreview,
  buildFallbackRouteShape,
  buildOpenStreetMapRoutePreview,
  buildStationRoutePreview,
} from "@/features/charging/service";
import { LatLng, StationRoutePreview } from "@/features/charging/types";

interface RoutePreviewMapProps {
  apiKey?: string;
  origin: LatLng | null;
  destination: LatLng;
  destinationLabel: string;
  onRouteResolved: (preview: StationRoutePreview | null) => void;
  onError: (message: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
  mapClassName?: string;
}

const DEFAULT_BACKGROUND =
  "radial-gradient(circle at top, rgba(191,219,254,0.72), rgba(226,232,240,0.94) 45%, rgba(241,245,249,1) 100%)";

const RoutePreviewMap = ({
  apiKey,
  origin,
  destination,
  destinationLabel,
  onRouteResolved,
  onError,
  emptyTitle = "Chưa có vị trí người dùng",
  emptyDescription = `Cấp quyền định vị để xem tuyến thật tới ${destinationLabel}.`,
  className,
  mapClassName,
}: RoutePreviewMapProps) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const onErrorRef = useRef(onError);
  const onRouteResolvedRef = useRef(onRouteResolved);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [providerLabel, setProviderLabel] = useState(apiKey ? "Google Maps Live Preview" : "OpenStreetMap Route");

  useEffect(() => {
    onErrorRef.current = onError;
    onRouteResolvedRef.current = onRouteResolved;
  }, [onError, onRouteResolved]);

  const clearRenderedMap = () => {
    if (mapInstanceRef.current?.remove) {
      mapInstanceRef.current.remove();
    }

    if (mapRef.current) {
      mapRef.current.innerHTML = "";
      mapRef.current.style.background = DEFAULT_BACKGROUND;
    }

    mapInstanceRef.current = null;
  };

  useEffect(() => {
    let cancelled = false;

    const renderRoute = async () => {
      clearRenderedMap();

      if (!origin) {
        setState("idle");
        onRouteResolvedRef.current(null);
        return;
      }

      if (!mapRef.current) {
        return;
      }

      setState("loading");

      try {
        if (apiKey) {
          setProviderLabel("Google Maps Live Preview");
          const google = await loadGoogleMapsScript(apiKey);

          if (cancelled || !mapRef.current) {
            return;
          }

          const directionsService = new google.maps.DirectionsService();
          const directions = await directionsService.route({
            origin,
            destination,
            travelMode: google.maps.TravelMode.DRIVING,
            drivingOptions: {
              departureTime: new Date(),
              trafficModel: google.maps.TrafficModel.BEST_GUESS,
            },
          });

          if (cancelled || !mapRef.current) {
            return;
          }

          const map = new google.maps.Map(mapRef.current, {
            center: destination,
            zoom: 14,
            disableDefaultUI: true,
            gestureHandling: "cooperative",
            styles: [
              { featureType: "poi", stylers: [{ visibility: "off" }] },
              { featureType: "transit", stylers: [{ visibility: "off" }] },
            ],
          });

          const directionsRenderer = new google.maps.DirectionsRenderer({
            map,
            suppressMarkers: false,
            polylineOptions: {
              strokeColor: "#2563eb",
              strokeWeight: 6,
            },
          });

          directionsRenderer.setDirections(directions);
          mapInstanceRef.current = map;
          onRouteResolvedRef.current(buildStationRoutePreview(apiKey, origin, destination, directions?.routes?.[0]?.legs?.[0]));
          setState("ready");
          return;
        }

        const leaflet = await loadLeafletAssets();

        if (cancelled || !mapRef.current) {
          return;
        }

        const map = leaflet.map(mapRef.current, {
          zoomControl: false,
          attributionControl: true,
        });

        let routeCoordinates = buildFallbackRouteShape(origin, destination);
        let preview = buildFallbackRoutePreview(origin, destination);
        let usedFallback = true;

        try {
          const route = await fetchOpenStreetMapRoute(origin, destination);
          routeCoordinates = route.coordinates;
          preview = buildOpenStreetMapRoutePreview(origin, destination, route);
          usedFallback = false;
        } catch {
          setProviderLabel("SpotAce Local Route");
        }

        if (cancelled) {
          map.remove();
          return;
        }

        if (!usedFallback) {
          setProviderLabel("OpenStreetMap Route");
          leaflet
            .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution: "&copy; OpenStreetMap contributors",
            })
            .addTo(map);
        } else if (mapRef.current) {
          mapRef.current.style.background =
            "linear-gradient(135deg, rgba(219,234,254,0.95), rgba(226,232,240,0.95), rgba(199,210,254,0.9))";
        }

        const polyline = leaflet.polyline(
          routeCoordinates.map((point) => [point.lat, point.lng]),
          {
            color: "#2563eb",
            weight: 6,
            opacity: 0.95,
            dashArray: usedFallback ? "10 8" : undefined,
          },
        ).addTo(map);

        leaflet
          .circleMarker([origin.lat, origin.lng], {
            radius: 8,
            color: "#1d4ed8",
            fillColor: "#3b82f6",
            fillOpacity: 1,
            weight: 2,
          })
          .addTo(map)
          .bindTooltip("Vị trí của bạn", { permanent: false });

        leaflet
          .circleMarker([destination.lat, destination.lng], {
            radius: 9,
            color: "#15803d",
            fillColor: "#22c55e",
            fillOpacity: 1,
            weight: 2,
          })
          .addTo(map)
          .bindTooltip(destinationLabel, { permanent: false });

        map.fitBounds(polyline.getBounds(), { padding: [24, 24] });
        mapInstanceRef.current = map;
        onRouteResolvedRef.current(preview);
        setState("ready");
      } catch {
        if (cancelled) {
          return;
        }

        setState("error");
        onRouteResolvedRef.current({
          distanceText: "Không tải được",
          durationText: "Mở Google Maps để tiếp tục",
          googleMapsUrl: buildGoogleMapsDirectionsUrl(origin, destination),
          status: "error",
        });
        onErrorRef.current("Không tải được bản đồ trong app. Bạn vẫn có thể mở tuyến bằng Google Maps.");
      }
    };

    renderRoute();

    return () => {
      cancelled = true;
      clearRenderedMap();
    };
  }, [apiKey, destination.lat, destination.lng, destinationLabel, origin]);

  if (!origin) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
        <MapPinned className="h-10 w-10 text-slate-400" />
        <div>
          <p className="font-semibold text-slate-700">{emptyTitle}</p>
          <p className="text-sm text-slate-500">{emptyDescription}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm", className)}>
      <div ref={mapRef} className={cn("h-[300px] w-full bg-slate-100", mapClassName)} />

      {(state === "loading" || state === "idle") && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-[2px]">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Đang dựng tuyến đường trong app...</span>
          </div>
        </div>
      )}

      {state === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-amber-50/95 px-6 text-center">
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <TriangleAlert className="mr-1 h-3 w-3" />
            Bản đồ trong app đang lỗi
          </Badge>
          <div>
            <p className="font-semibold text-slate-700">Không tải được preview tuyến đường</p>
            <p className="text-sm text-slate-500">Hãy mở Google Maps để điều hướng live, hoặc cập nhật lại vị trí rồi thử lần nữa.</p>
          </div>
        </div>
      )}

      <div className="absolute left-4 top-4">
        <Badge className="bg-slate-950/80 text-white hover:bg-slate-950/80">
          <Route className="mr-1 h-3 w-3" />
          {providerLabel}
        </Badge>
      </div>

      <div className="absolute bottom-4 right-4">
        <Button type="button" size="sm" variant="secondary" className="bg-white/90 shadow-md">
          <MapPinned className="mr-2 h-4 w-4" />
          {destinationLabel}
        </Button>
      </div>
    </div>
  );
};

export default RoutePreviewMap;
