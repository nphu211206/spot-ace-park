export type ChargingStationStatus = "available" | "busy" | "maintenance";
export type ConnectorStatus = "available" | "charging" | "maintenance";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface ChargingConnector {
  id: string;
  type: string;
  status: ConnectorStatus;
  powerKw: number;
}

export interface ChargingOccupancySnapshot {
  totalConnectors: number;
  availableConnectors: number;
  activeChargingVehicles: number;
  maintenanceConnectors: number;
  updatedAt: string;
}

export interface ChargingSceneConfig {
  accentColor: string;
  canopyColor: string;
  surfaceColor: string;
}

export interface ChargingStation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  heroImage: string;
  supportedConnectorTypes: string[];
  totalConnectors: number;
  availableConnectors: number;
  activeChargingVehicles: number;
  status: ChargingStationStatus;
  maxPowerKw: number;
  sceneConfig: ChargingSceneConfig;
  connectors: ChargingConnector[];
  occupancy: ChargingOccupancySnapshot;
  amenities: string[];
}

export interface StationRoutePreview {
  distanceText: string;
  durationText: string;
  googleMapsUrl: string;
  embedUrl?: string;
  status: "ready" | "missing-api-key" | "permission-required" | "error";
}

export type RoutePreview = StationRoutePreview;
