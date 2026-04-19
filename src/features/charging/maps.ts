import { LatLng } from "./types";

declare global {
  interface Window {
    google?: any;
    L?: any;
    __spotAceGoogleMapsReady__?: () => void;
  }
}

const GOOGLE_MAPS_SCRIPT_ID = "spotace-google-maps";
const LEAFLET_SCRIPT_ID = "spotace-leaflet-script";
const LEAFLET_STYLE_ID = "spotace-leaflet-style";

let googleMapsPromise: Promise<any> | null = null;
let leafletPromise: Promise<any> | null = null;

const toCoordinateString = (point: LatLng) => `${point.lat},${point.lng}`;

export const buildGoogleMapsDirectionsUrl = (origin: LatLng | null, destination: LatLng) => {
  const params = new URLSearchParams({
    api: "1",
    destination: toCoordinateString(destination),
    travelmode: "driving",
  });

  if (origin) {
    params.set("origin", toCoordinateString(origin));
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
};

export const buildMapsEmbedDirectionsUrl = (apiKey: string, origin: LatLng, destination: LatLng) => {
  const params = new URLSearchParams({
    key: apiKey,
    origin: toCoordinateString(origin),
    destination: toCoordinateString(destination),
    mode: "driving",
  });

  return `https://www.google.com/maps/embed/v1/directions?${params.toString()}`;
};

export const getUserLocation = () =>
  new Promise<LatLng>((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Trình duyệt này không hỗ trợ định vị."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      },
    );
  });

export const loadGoogleMapsScript = async (apiKey: string) => {
  if (typeof window === "undefined") {
    throw new Error("Google Maps chỉ chạy trên trình duyệt.");
  }

  if (!apiKey) {
    throw new Error("Thiếu VITE_GOOGLE_MAPS_API_KEY.");
  }

  if (window.google?.maps) {
    return window.google;
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.google));
      existingScript.addEventListener("error", () => {
        googleMapsPromise = null;
        reject(new Error("Không thể tải Google Maps."));
      });
      return;
    }

    window.__spotAceGoogleMapsReady__ = () => {
      resolve(window.google);
      delete window.__spotAceGoogleMapsReady__;
    };

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&callback=__spotAceGoogleMapsReady__`;
    script.onerror = () => {
      googleMapsPromise = null;
      reject(new Error("Không thể tải Google Maps."));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

export const loadLeafletAssets = async () => {
  if (typeof window === "undefined") {
    throw new Error("Leaflet chỉ chạy trên trình duyệt.");
  }

  if (window.L) {
    return window.L;
  }

  if (leafletPromise) {
    return leafletPromise;
  }

  leafletPromise = new Promise((resolve, reject) => {
    if (!document.getElementById(LEAFLET_STYLE_ID)) {
      const stylesheet = document.createElement("link");
      stylesheet.id = LEAFLET_STYLE_ID;
      stylesheet.rel = "stylesheet";
      stylesheet.href = "/vendor/leaflet.css";
      document.head.appendChild(stylesheet);
    }

    const existingScript = document.getElementById(LEAFLET_SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.L));
      existingScript.addEventListener("error", () => {
        leafletPromise = null;
        reject(new Error("Không thể tải Leaflet."));
      });
      return;
    }

    const script = document.createElement("script");
    script.id = LEAFLET_SCRIPT_ID;
    script.async = true;
    script.src = "/vendor/leaflet.js";
    script.onload = () => resolve(window.L);
    script.onerror = () => {
      leafletPromise = null;
      reject(new Error("Không thể tải Leaflet."));
    };

    document.head.appendChild(script);
  });

  return leafletPromise;
};

export const formatRouteDistance = (distanceMeters: number) => {
  if (distanceMeters >= 10000) {
    return `${Math.round(distanceMeters / 1000)} km`;
  }

  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(1)} km`;
  }

  return `${Math.round(distanceMeters)} m`;
};

export const formatRouteDuration = (durationSeconds: number) => {
  const totalMinutes = Math.max(1, Math.round(durationSeconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${totalMinutes} phút`;
  }

  if (minutes === 0) {
    return `${hours} giờ`;
  }

  return `${hours} giờ ${minutes} phút`;
};

export const fetchOpenStreetMapRoute = async (origin: LatLng, destination: LatLng) => {
  const url = new URL(
    `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`,
  );
  url.searchParams.set("overview", "full");
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("steps", "false");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Không thể lấy route từ OpenStreetMap.");
  }

  const data = await response.json();
  const route = data.routes?.[0];

  if (!route?.geometry?.coordinates?.length) {
    throw new Error("OpenStreetMap không trả về dữ liệu route.");
  }

  return {
    distanceMeters: Number(route.distance || 0),
    durationSeconds: Number(route.duration || 0),
    coordinates: route.geometry.coordinates.map(([lng, lat]: [number, number]) => ({
      lat,
      lng,
    })),
  };
};
