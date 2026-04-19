import RoutePreviewMap from "@/components/maps/RoutePreviewMap";
import { LatLng, StationRoutePreview } from "@/features/charging/types";

interface ChargingRouteMapProps {
  apiKey?: string;
  origin: LatLng | null;
  destination: LatLng;
  stationName: string;
  onRouteResolved: (preview: StationRoutePreview | null) => void;
  onError: (message: string) => void;
}

const ChargingRouteMap = ({
  apiKey,
  origin,
  destination,
  stationName,
  onRouteResolved,
  onError,
}: ChargingRouteMapProps) => (
  <RoutePreviewMap
    apiKey={apiKey}
    origin={origin}
    destination={destination}
    destinationLabel={stationName}
    onRouteResolved={onRouteResolved}
    onError={onError}
    emptyDescription={`Cấp quyền định vị để xem tuyến thật tới ${stationName}.`}
  />
);

export default ChargingRouteMap;
