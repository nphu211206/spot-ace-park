import { ChargingStation, ChargingConnector } from "./types";

const buildStation = (
  station: Omit<ChargingStation, "occupancy" | "totalConnectors" | "availableConnectors" | "activeChargingVehicles">,
) => {
  const totalConnectors = station.connectors.length;
  const availableConnectors = station.connectors.filter((connector) => connector.status === "available").length;
  const activeChargingVehicles = station.connectors.filter((connector) => connector.status === "charging").length;
  const maintenanceConnectors = station.connectors.filter((connector) => connector.status === "maintenance").length;

  return {
    ...station,
    totalConnectors,
    availableConnectors,
    activeChargingVehicles,
    occupancy: {
      totalConnectors,
      availableConnectors,
      activeChargingVehicles,
      maintenanceConnectors,
      updatedAt: new Date().toISOString(),
    },
  };
};

const connectors = (stationId: string, specs: Array<{ type: string; status: ChargingConnector["status"]; powerKw: number }>) =>
  specs.map((spec, index) => ({
    id: `${stationId}-connector-${index + 1}`,
    ...spec,
  }));

export const chargingStations: ChargingStation[] = [
  buildStation({
    id: "ev-d1-riverside",
    name: "SpotAce Riverside EV Hub",
    address: "12 Bến Vân Đồn, Quận 4, TP.HCM",
    latitude: 10.760193,
    longitude: 106.704967,
    heroImage: "/charging/spotace-riverside-ev.jpg",
    supportedConnectorTypes: ["CCS2", "Type 2"],
    status: "available",
    maxPowerKw: 180,
    sceneConfig: {
      accentColor: "#22c55e",
      canopyColor: "#0f172a",
      surfaceColor: "#e2e8f0",
    },
    amenities: ["24/7", "Camera AI", "Coffee kiosk", "Rest zone"],
    connectors: connectors("ev-d1-riverside", [
      { type: "CCS2", status: "charging", powerKw: 180 },
      { type: "CCS2", status: "charging", powerKw: 180 },
      { type: "Type 2", status: "available", powerKw: 22 },
      { type: "Type 2", status: "available", powerKw: 22 },
      { type: "CCS2", status: "available", powerKw: 120 },
      { type: "Type 2", status: "maintenance", powerKw: 22 },
    ]),
  }),
  buildStation({
    id: "ev-d7-skyline",
    name: "Skyline Fast Charge Station",
    address: "88 Nguyễn Đức Cảnh, Quận 7, TP.HCM",
    latitude: 10.729721,
    longitude: 106.719491,
    heroImage: "/charging/skyline-fast-charge.jpg",
    supportedConnectorTypes: ["CCS2", "CHAdeMO", "Type 2"],
    status: "busy",
    maxPowerKw: 150,
    sceneConfig: {
      accentColor: "#38bdf8",
      canopyColor: "#111827",
      surfaceColor: "#dbeafe",
    },
    amenities: ["Lounge", "Wi-Fi", "Toilet", "Security onsite"],
    connectors: connectors("ev-d7-skyline", [
      { type: "CCS2", status: "charging", powerKw: 150 },
      { type: "CCS2", status: "charging", powerKw: 150 },
      { type: "CHAdeMO", status: "charging", powerKw: 100 },
      { type: "Type 2", status: "available", powerKw: 22 },
      { type: "Type 2", status: "available", powerKw: 22 },
      { type: "CCS2", status: "available", powerKw: 90 },
      { type: "Type 2", status: "maintenance", powerKw: 11 },
      { type: "CCS2", status: "charging", powerKw: 150 },
    ]),
  }),
  buildStation({
    id: "ev-tp-thuduc-techpark",
    name: "TechPark Charge Point",
    address: "5 Xa Lộ Hà Nội, TP. Thủ Đức, TP.HCM",
    latitude: 10.801842,
    longitude: 106.731527,
    heroImage: "/charging/techpark-charge-point.jpg",
    supportedConnectorTypes: ["CCS2", "Type 2"],
    status: "available",
    maxPowerKw: 90,
    sceneConfig: {
      accentColor: "#a855f7",
      canopyColor: "#1e1b4b",
      surfaceColor: "#ede9fe",
    },
    amenities: ["Solar roof", "Smart billing demo", "Rest pods"],
    connectors: connectors("ev-tp-thuduc-techpark", [
      { type: "CCS2", status: "available", powerKw: 90 },
      { type: "CCS2", status: "available", powerKw: 90 },
      { type: "Type 2", status: "charging", powerKw: 22 },
      { type: "Type 2", status: "available", powerKw: 22 },
      { type: "Type 2", status: "available", powerKw: 22 },
      { type: "CCS2", status: "available", powerKw: 60 },
    ]),
  }),
];
