import {
  buildGoogleMapsDirectionsUrl,
  buildMapsEmbedDirectionsUrl,
  formatRouteDistance,
  formatRouteDuration,
} from "./maps";
import { chargingStations } from "./data";
import { ChargingStation, LatLng, StationRoutePreview } from "./types";

export const getChargingStations = async (): Promise<ChargingStation[]> => {
  return chargingStations;
};

export const buildStationRoutePreview = (
  apiKey: string,
  origin: LatLng,
  destination: LatLng,
  leg?: any,
): StationRoutePreview => ({
  distanceText: leg?.distance?.text || "Đang cập nhật",
  durationText: leg?.duration_in_traffic?.text || leg?.duration?.text || "Đang cập nhật",
  googleMapsUrl: buildGoogleMapsDirectionsUrl(origin, destination),
  embedUrl: buildMapsEmbedDirectionsUrl(apiKey, origin, destination),
  status: "ready",
});

export const buildOpenStreetMapRoutePreview = (
  origin: LatLng,
  destination: LatLng,
  route: { distanceMeters: number; durationSeconds: number },
): StationRoutePreview => ({
  distanceText: formatRouteDistance(route.distanceMeters),
  durationText: formatRouteDuration(route.durationSeconds),
  googleMapsUrl: buildGoogleMapsDirectionsUrl(origin, destination),
  status: "ready",
});

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const getApproximateRouteMetrics = (origin: LatLng, destination: LatLng) => {
  const earthRadiusMeters = 6371000;
  const deltaLat = toRadians(destination.lat - origin.lat);
  const deltaLng = toRadians(destination.lng - origin.lng);
  const startLat = toRadians(origin.lat);
  const endLat = toRadians(destination.lat);

  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(deltaLng / 2) ** 2;
  const straightLineMeters = 2 * earthRadiusMeters * Math.asin(Math.sqrt(haversine));

  // Urban driving tends to be longer than straight-line distance.
  const distanceMeters = Math.max(600, Math.round(straightLineMeters * 1.22));
  const averageCitySpeedMetersPerSecond = 7.5;
  const durationSeconds = Math.max(180, Math.round(distanceMeters / averageCitySpeedMetersPerSecond));

  return {
    distanceMeters,
    durationSeconds,
  };
};

export const buildFallbackRouteShape = (origin: LatLng, destination: LatLng) => {
  const midLat = (origin.lat + destination.lat) / 2;
  const midLng = (origin.lng + destination.lng) / 2;
  const bendLat = (destination.lng - origin.lng) * 0.12;
  const bendLng = (origin.lat - destination.lat) * 0.12;

  return [
    origin,
    {
      lat: (origin.lat + midLat) / 2 + bendLat,
      lng: (origin.lng + midLng) / 2 + bendLng,
    },
    {
      lat: (destination.lat + midLat) / 2 + bendLat * 0.4,
      lng: (destination.lng + midLng) / 2 + bendLng * 0.4,
    },
    destination,
  ];
};

export const buildFallbackRoutePreview = (
  origin: LatLng,
  destination: LatLng,
  label = "Tuyến ước tính trong app",
): StationRoutePreview => {
  const metrics = getApproximateRouteMetrics(origin, destination);

  return {
    distanceText: formatRouteDistance(metrics.distanceMeters),
    durationText: `${formatRouteDuration(metrics.durationSeconds)} (${label})`,
    googleMapsUrl: buildGoogleMapsDirectionsUrl(origin, destination),
    status: "ready",
  };
};
