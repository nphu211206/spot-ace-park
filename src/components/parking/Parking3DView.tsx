import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Billboard,
  ContactShadows,
  Environment,
  Float,
  Html,
  MeshReflectorMaterial,
  OrbitControls,
  RoundedBox,
  Sky,
  Sparkles,
  Stars,
  Text,
  useCursor,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";
import { ParkingLot } from "@/pages/Parking";
import { toast } from "sonner";
import { Car as CarIcon, Eye, Moon, RotateCcw, Shield, Sun, Thermometer, Wind, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SlotStatus = "free" | "occupied";
type SlotType = "normal" | "ev" | "vip" | "handicap";
type ParkingSceneProfileKey = "mall_indoor" | "tower_podium" | "open_air_surface";
type ParkingRoofStyle = "open" | "interior" | "podium";
type ParkingCameraMode = "arrival" | "booking";

type ParkingSlotModel = {
  id: string;
  code: string;
  status: SlotStatus;
  type: SlotType;
  row: number;
  column: number;
};

type ParkingSceneProfile = {
  key: ParkingSceneProfileKey;
  label: string;
  surfaceLabel: string;
  roofStyle: ParkingRoofStyle;
  accentColor: string;
  backgroundDay: string;
  backgroundNight: string;
  fogDay: string;
  fogNight: string;
  deckDay: string;
  deckNight: string;
  laneDay: string;
  laneNight: string;
  showSky: boolean;
  showPlanters: boolean;
  showPerimeterBuildings: boolean;
  shellHeight: number;
  environmentDay: "city" | "warehouse";
  environmentNight: "night" | "warehouse";
};

type ParkingVehicleVariant = "sedan" | "suv" | "hatchback" | "mpv" | "pickup" | "taxi";

type ParkingTwinScreenPoint = {
  id: string;
  x: number;
  y: number;
};

declare global {
  interface Window {
    __spotAceParkingTwin?: {
      lotId: string;
      availableSlots: string[];
      screenPoints: ParkingTwinScreenPoint[];
      bookSlot: (slotId: string) => string | null;
      bookFirstAvailable: () => string | null;
    };
  }
}

const SLOT = {
  width: 2.85,
  depth: 5.55,
  spacingX: 3.4,
  bankOffsetZ: 8.2,
  laneWidth: 7.4,
};

const PALETTE = {
  asphalt: "#4b5563",
  asphaltDark: "#334155",
  concrete: "#dfe7ef",
  concreteEdge: "#b6c1ce",
  grass: "#6ea13f",
  tree: "#2f6a2f",
  canopy: "#0f172a",
  building: "#94a3b8",
  glass: "#bfdbfe",
  white: "#f8fafc",
  available: "#22c55e",
  occupied: "#ef4444",
  selected: "#2563eb",
  ev: "#8b5cf6",
  vip: "#f59e0b",
  handicap: "#06b6d4",
};

const STATUS_CAR_COLORS = ["#111827", "#334155", "#475569", "#0f766e", "#7f1d1d", "#1e3a8a", "#3f3f46", "#e5e7eb", "#6b7280"];
const VEHICLE_BODY_COLORS = ["#111827", "#dfe4ea", "#64748b", "#1f2937", "#7f1d1d", "#0f766e", "#1e3a8a", "#4b5563", "#4b5d3c"];
const VEHICLE_ACCENT_COLORS = ["#f59e0b", "#38bdf8", "#22c55e", "#ef4444", "#a855f7"];
const VEHICLE_VARIANTS: ParkingVehicleVariant[] = ["sedan", "suv", "hatchback", "mpv", "pickup", "taxi"];
const VEHICLE_OVERLAY_ASSET_MANIFEST: Record<ParkingVehicleVariant, string> = {
  sedan: "/textures/parking-shared/fleet-v2/sedan-top.svg",
  suv: "/textures/parking-shared/fleet-v2/suv-top.svg",
  hatchback: "/textures/parking-shared/fleet-v2/hatchback-top.svg",
  mpv: "/textures/parking-shared/fleet-v2/mpv-top.svg",
  pickup: "/textures/parking-shared/fleet-v2/pickup-top.svg",
  taxi: "/textures/parking-shared/fleet-v2/taxi-top.svg",
};

const PARKING_SCENE_PROFILES: Record<ParkingSceneProfileKey, ParkingSceneProfile> = {
  mall_indoor: {
    key: "mall_indoor",
    label: "Mall Indoor Twin",
    surfaceLabel: "Indoor Mall Profile",
    roofStyle: "interior",
    accentColor: "#1d4ed8",
    backgroundDay: "#cfd8e2",
    backgroundNight: "#0f172a",
    fogDay: "#d7dee7",
    fogNight: "#0f172a",
    deckDay: "#737b86",
    deckNight: "#334155",
    laneDay: "#66707d",
    laneNight: "#243244",
    showSky: false,
    showPlanters: false,
    showPerimeterBuildings: false,
    shellHeight: 7.3,
    environmentDay: "warehouse",
    environmentNight: "warehouse",
  },
  tower_podium: {
    key: "tower_podium",
    label: "Tower Podium Twin",
    surfaceLabel: "Podium Deck Profile",
    roofStyle: "podium",
    accentColor: "#2563eb",
    backgroundDay: "#d9e7f5",
    backgroundNight: "#0b1220",
    fogDay: "#d9e7f5",
    fogNight: "#0b1220",
    deckDay: "#596574",
    deckNight: "#233142",
    laneDay: "#46525f",
    laneNight: "#1f2a39",
    showSky: true,
    showPlanters: false,
    showPerimeterBuildings: true,
    shellHeight: 6.9,
    environmentDay: "city",
    environmentNight: "night",
  },
  open_air_surface: {
    key: "open_air_surface",
    label: "Vietnam Urban Parking Twin",
    surfaceLabel: "Open-Air Urban VN",
    roofStyle: "open",
    accentColor: "#0ea5e9",
    backgroundDay: "#eef7ff",
    backgroundNight: "#091221",
    fogDay: "#f4fbff",
    fogNight: "#091221",
    deckDay: "#4b5563",
    deckNight: "#334155",
    laneDay: "#4b5563",
    laneNight: "#243244",
    showSky: true,
    showPlanters: true,
    showPerimeterBuildings: true,
    shellHeight: 6.2,
    environmentDay: "city",
    environmentNight: "night",
  },
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const seeded = (seed: number, offset: number) => {
  const value = Math.sin(seed * 91.137 + offset * 17.713) * 43758.5453123;
  return value - Math.floor(value);
};

const normalizeSceneText = (value: string) =>
  String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase();

const getLotSeed = (lotId: string | number) =>
  String(lotId)
    .split("")
    .reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);

const getLotShortLabel = (name: string) =>
  normalizeSceneText(name)
    .replace("spotace", "")
    .replace("parking", "")
    .replace("bai", "")
    .replace("xe", "")
    .trim()
    .split(" ")
    .slice(0, 2)
    .join(" ")
    .toUpperCase();

const getParkingSlotCode = (row: number, column: number) => {
  const rowLabel = row === 0 ? "A" : "B";
  return `${rowLabel}${String(column + 1).padStart(2, "0")}`;
};

const getSlotAccent = (slotType: SlotType, status: SlotStatus, isSelected: boolean) => {
  if (status === "occupied") return PALETTE.occupied;
  if (isSelected) return PALETTE.selected;

  switch (slotType) {
    case "ev":
      return PALETTE.ev;
    case "vip":
      return PALETTE.vip;
    case "handicap":
      return PALETTE.handicap;
    default:
      return PALETTE.available;
  }
};

const deriveParkingSceneProfile = (parkingLot: ParkingLot): ParkingSceneProfile => {
  void parkingLot;
  return PARKING_SCENE_PROFILES.open_air_surface;
};

const getVisualSlotCount = (parkingLot: ParkingLot, profileKey: ParkingSceneProfileKey) => {
  const actualTotal = Math.max(12, parkingLot.total_spots || 24);
  const profileCap =
    profileKey === "mall_indoor" ? 24 : profileKey === "tower_podium" ? 26 : 30;

  return clamp(actualTotal, 16, profileCap);
};

const getVehicleVariant = (index: number, lotSeed: number, slotType: SlotType): ParkingVehicleVariant => {
  const seededIndex = (lotSeed + index * 5) % 17;

  if (slotType === "vip") {
    return seededIndex % 2 === 0 ? "suv" : "pickup";
  }

  if (slotType === "ev") {
    return ["suv", "hatchback", "suv", "sedan"][seededIndex % 4] as ParkingVehicleVariant;
  }

  if (seededIndex === 0 || seededIndex === 11) {
    return "taxi";
  }

  return ["sedan", "mpv", "suv", "sedan", "hatchback", "mpv", "suv", "pickup"][seededIndex % 8] as ParkingVehicleVariant;
};

const getVehicleColor = (index: number, lotSeed: number, slotType: SlotType) => {
  const palette =
    slotType === "vip"
      ? ["#111827", "#dfe4ea", "#334155", "#5b4636"]
      : slotType === "ev"
        ? ["#0f766e", "#1e3a8a", "#dfe4ea", "#475569"]
        : VEHICLE_BODY_COLORS;

  return palette[(lotSeed + index * 3) % palette.length];
};

const getVehicleAccent = (index: number, lotSeed: number, variant: ParkingVehicleVariant) => {
  if (variant === "taxi") {
    return "#facc15";
  }

  return VEHICLE_ACCENT_COLORS[(lotSeed + index * 7) % VEHICLE_ACCENT_COLORS.length];
};

const createSlotStencilTexture = ({
  displayCode,
  slotId,
  occupied,
}: {
  displayCode: string;
  slotId: string;
  occupied: boolean;
}) => {
  if (typeof document === "undefined") {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1536;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const mainPaint = occupied ? "rgba(241,245,249,0.96)" : "rgba(248,250,252,0.985)";
  const strokePaint = occupied ? "rgba(15,23,42,0.5)" : "rgba(15,23,42,0.4)";
  const helperPaint = occupied ? "rgba(226,232,240,0.88)" : "rgba(248,250,252,0.92)";
  const panelPaint = occupied ? "rgba(15,23,42,0.16)" : "rgba(248,250,252,0.16)";

  const drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const drawRunwayMark = (centerY: number, mainCode: string, subCode: string) => {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.strokeStyle = strokePaint;
    ctx.fillStyle = mainPaint;
    ctx.shadowColor = "rgba(15,23,42,0.22)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 3;

    ctx.fillStyle = panelPaint;
    drawRoundedRect(92, centerY - 232, canvas.width - 184, 464, 56);
    ctx.fill();

    ctx.lineWidth = 16;
    ctx.font = "900 338px 'Arial Black', Impact, Arial, sans-serif";
    ctx.strokeText(mainCode, canvas.width / 2, centerY - 18);
    ctx.fillText(mainCode, canvas.width / 2, centerY - 18);

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = helperPaint;
    ctx.font = "900 92px 'Arial Black', Arial, sans-serif";
    ctx.fillText(subCode, canvas.width / 2, centerY + 132);
    ctx.restore();
  };

  drawRunwayMark(420, displayCode, slotId);
  drawRunwayMark(1116, displayCode, slotId);

  const drawSideCode = (x: number, code: string) => {
    ctx.save();
    ctx.translate(x, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.lineWidth = 10;
    ctx.strokeStyle = strokePaint;
    ctx.fillStyle = mainPaint;
    ctx.font = "900 162px 'Arial Black', Impact, Arial, sans-serif";
    ctx.strokeText(code, 0, 0);
    ctx.fillText(code, 0, 0);
    ctx.restore();
  };

  drawSideCode(104, displayCode);
  drawSideCode(canvas.width - 104, displayCode);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
};

const SlotHelperLabel = ({
  code,
  position,
  occupied,
}: {
  code: string;
  position: [number, number, number];
  occupied: boolean;
}) => {
  const helperRef = useRef<THREE.Group | null>(null);
  const { camera } = useThree();
  const worldPosition = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!helperRef.current) {
      return;
    }

    helperRef.current.getWorldPosition(worldPosition);
    const distance = camera.position.distanceTo(worldPosition);
    const elevation = Math.abs(camera.position.y - worldPosition.y) / Math.max(distance, 0.001);
    const shouldShow = distance > 9 || elevation < 0.95;
    helperRef.current.visible = shouldShow;

    if (shouldShow) {
      const scale = clamp(0.98 + distance * 0.024, 1, 1.58);
      helperRef.current.scale.setScalar(scale);
    }
  });

  return (
    <Billboard position={position} follow lockX={false} lockY={false} lockZ={false}>
      <group ref={helperRef}>
        <mesh position={[0, 0, -0.015]}>
          <planeGeometry args={[1.56, 0.52]} />
          <meshBasicMaterial color={occupied ? "#0f172a" : "#111827"} transparent opacity={0.82} depthWrite={false} />
        </mesh>
        <Text
          position={[0, 0.01, 0]}
          fontSize={0.34}
          color="#f8fafc"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#020617"
        >
          {code}
        </Text>
      </group>
    </Billboard>
  );
};

const createSlotPlaqueTexture = ({
  slotId,
  accentColor,
  occupied,
}: {
  slotId: string;
  accentColor: string;
  occupied: boolean;
}) => {
  if (typeof document === "undefined") {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = occupied ? "rgba(2,6,23,0.92)" : "rgba(15,23,42,0.92)";
  ctx.strokeStyle = occupied ? "rgba(248,250,252,0.22)" : `${accentColor}dd`;
  ctx.lineWidth = 10;

  const radius = 28;
  const x = 16;
  const y = 22;
  const width = canvas.width - 32;
  const height = canvas.height - 44;

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#f8fafc";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 94px Arial";
  ctx.fillText(slotId, canvas.width / 2, canvas.height / 2 + 6);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
};

const VehicleWheel = ({
  position,
  radius = 0.24,
  width = 0.18,
}: {
  position: [number, number, number];
  radius?: number;
  width?: number;
}) => (
  <group position={position}>
    <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[radius, radius, width, 20]} />
      <meshStandardMaterial color="#111827" roughness={0.96} />
    </mesh>
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[radius * 0.58, radius * 0.58, width + 0.02, 14]} />
      <meshStandardMaterial color="#cbd5e1" metalness={0.86} roughness={0.22} />
    </mesh>
  </group>
);

const ChargingPedestal = ({ accentColor }: { accentColor: string }) => {
  const glowRef = useRef<THREE.PointLight | null>(null);

  useFrame((state) => {
    if (!glowRef.current) return;
    glowRef.current.intensity = 0.9 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
  });

  return (
    <group position={[0, 0, -1.2]}>
      <RoundedBox args={[0.65, 0.1, 1.1]} radius={0.06} position={[0, 0.05, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#dbe3ec" roughness={0.96} />
      </RoundedBox>

      <RoundedBox args={[0.44, 2.15, 0.36]} radius={0.06} position={[0, 1.12, 0]} castShadow>
        <meshPhysicalMaterial color="#0f172a" metalness={0.85} roughness={0.18} clearcoat={1} clearcoatRoughness={0.12} />
      </RoundedBox>

      <RoundedBox args={[0.3, 0.72, 0.04]} radius={0.02} position={[0, 1.12, 0.2]}>
        <meshPhysicalMaterial color="#08111f" emissive={accentColor} emissiveIntensity={0.35} />
      </RoundedBox>

      <mesh position={[0, 1.74, 0.2]}>
        <boxGeometry args={[0.24, 0.22, 0.04]} />
        <meshBasicMaterial color={accentColor} />
      </mesh>

      <pointLight ref={glowRef} position={[0, 1.2, 0.55]} color={accentColor} distance={2.8} intensity={1} />
    </group>
  );
};

const ParkedCar = ({
  color,
  variant,
  accentColor,
  scale = 1,
}: {
  color: string;
  variant: ParkingVehicleVariant;
  accentColor: string;
  scale?: number;
}) => {
  const overlayMap = useTexture(VEHICLE_OVERLAY_ASSET_MANIFEST[variant]);
  const variantScale =
    variant === "pickup"
      ? 1.44
      : variant === "mpv"
        ? 1.4
        : variant === "suv"
          ? 1.38
          : variant === "taxi"
            ? 1.36
            : variant === "hatchback"
              ? 1.3
              : 1.34;
  const metallicPaint = <meshPhysicalMaterial color={color} metalness={0.82} roughness={0.18} clearcoat={1} clearcoatRoughness={0.08} />;
  const glassPaint = <meshPhysicalMaterial color="#111827" metalness={0.22} roughness={0.04} transmission={0.28} transparent opacity={0.74} />;
  const windshieldPaint = <meshPhysicalMaterial color={PALETTE.glass} transmission={0.38} roughness={0.03} transparent opacity={0.74} />;
  const overlayPlane =
    variant === "pickup"
      ? { width: 1.98, depth: 4.64, y: 1.02 }
      : variant === "mpv"
        ? { width: 1.9, depth: 4.46, y: 1.18 }
        : variant === "suv"
          ? { width: 1.84, depth: 4.28, y: 1.18 }
          : variant === "hatchback"
            ? { width: 1.72, depth: 3.96, y: 1.06 }
            : { width: 1.82, depth: 4.28, y: 1.06 };

  useEffect(() => {
    overlayMap.colorSpace = THREE.SRGBColorSpace;
    overlayMap.anisotropy = 8;
    overlayMap.needsUpdate = true;
  }, [overlayMap]);

  return (
    <group position={[0, 0.08, 0.42]} scale={[scale * variantScale, scale * variantScale, scale * variantScale]}>
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <boxGeometry args={[1.92, 0.06, 4.04]} />
        <meshStandardMaterial color="#020617" transparent opacity={0.3} roughness={1} />
      </mesh>
      {variant === "sedan" && (
        <>
          <RoundedBox args={[1.78, 0.4, 4.18]} radius={0.16} position={[0, 0.34, 0]} castShadow receiveShadow>
            {metallicPaint}
          </RoundedBox>
          <RoundedBox args={[1.18, 0.42, 1.98]} radius={0.18} position={[0, 0.78, -0.04]} castShadow>
            {glassPaint}
          </RoundedBox>
          <RoundedBox args={[1.18, 0.12, 0.88]} radius={0.08} position={[0, 0.57, 1.16]} castShadow>
            {metallicPaint}
          </RoundedBox>
          <RoundedBox args={[1.08, 0.12, 0.72]} radius={0.08} position={[0, 0.56, -1.12]} castShadow>
            {metallicPaint}
          </RoundedBox>
        </>
      )}

      {variant === "suv" && (
        <>
          <RoundedBox args={[1.86, 0.46, 4.1]} radius={0.16} position={[0, 0.38, 0]} castShadow receiveShadow>
            {metallicPaint}
          </RoundedBox>
          <RoundedBox args={[1.26, 0.62, 2.28]} radius={0.18} position={[0, 0.94, 0.02]} castShadow>
            {glassPaint}
          </RoundedBox>
          <RoundedBox args={[1.08, 0.1, 0.16]} radius={0.04} position={[0, 1.3, 0.1]} castShadow>
            <meshStandardMaterial color="#94a3b8" metalness={0.72} roughness={0.22} />
          </RoundedBox>
          {[-0.42, 0.42].map((x) => (
            <mesh key={`roof-rail-${x}`} position={[x, 1.15, 0.05]} castShadow>
              <boxGeometry args={[0.06, 0.05, 1.8]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.74} roughness={0.2} />
            </mesh>
          ))}
        </>
      )}

      {variant === "hatchback" && (
        <>
          <RoundedBox args={[1.7, 0.4, 3.58]} radius={0.16} position={[0, 0.34, 0.02]} castShadow receiveShadow>
            {metallicPaint}
          </RoundedBox>
          <RoundedBox args={[1.14, 0.54, 1.86]} radius={0.18} position={[0, 0.86, -0.12]} castShadow>
            {glassPaint}
          </RoundedBox>
          <RoundedBox args={[1.02, 0.18, 0.64]} radius={0.12} position={[0, 0.6, -1.08]} castShadow>
            {metallicPaint}
          </RoundedBox>
        </>
      )}

      {variant === "mpv" && (
        <>
          <RoundedBox args={[1.88, 0.46, 4.26]} radius={0.14} position={[0, 0.38, 0]} castShadow receiveShadow>
            {metallicPaint}
          </RoundedBox>
          <RoundedBox args={[1.34, 0.72, 2.62]} radius={0.16} position={[0, 0.98, 0.02]} castShadow>
            {glassPaint}
          </RoundedBox>
          <RoundedBox args={[1.16, 0.08, 1.9]} radius={0.04} position={[0, 1.02, 0.14]} castShadow>
            <meshStandardMaterial color="#111827" metalness={0.36} roughness={0.18} />
          </RoundedBox>
          {[-0.74, 0.74].map((x) => (
            <mesh key={`mpv-door-${x}`} position={[x, 0.66, -0.18]}>
              <boxGeometry args={[0.04, 0.46, 1.24]} />
              <meshBasicMaterial color="#cbd5e1" transparent opacity={0.7} />
            </mesh>
          ))}
        </>
      )}

      {variant === "pickup" && (
        <>
          <RoundedBox args={[1.88, 0.42, 4.42]} radius={0.14} position={[0, 0.34, 0]} castShadow receiveShadow>
            {metallicPaint}
          </RoundedBox>
          <RoundedBox args={[1.04, 0.56, 1.56]} radius={0.14} position={[0, 0.84, 0.72]} castShadow>
            {glassPaint}
          </RoundedBox>
          <RoundedBox args={[1.42, 0.16, 1.5]} radius={0.08} position={[0, 0.52, -0.88]} castShadow>
            {metallicPaint}
          </RoundedBox>
          {[-0.68, 0.68].map((x) => (
            <mesh key={`pickup-bed-wall-${x}`} position={[x, 0.7, -0.88]} castShadow>
              <boxGeometry args={[0.08, 0.36, 1.46]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.18} />
            </mesh>
          ))}
          <mesh position={[0, 0.7, -1.58]} castShadow>
            <boxGeometry args={[1.44, 0.34, 0.08]} />
            <meshStandardMaterial color={color} metalness={0.8} roughness={0.18} />
          </mesh>
        </>
      )}

      {variant === "taxi" && (
        <>
          <RoundedBox args={[1.8, 0.4, 4.1]} radius={0.16} position={[0, 0.34, 0]} castShadow receiveShadow>
            {metallicPaint}
          </RoundedBox>
          <RoundedBox args={[1.18, 0.42, 1.98]} radius={0.18} position={[0, 0.78, -0.04]} castShadow>
            {glassPaint}
          </RoundedBox>
          <mesh position={[0, 0.52, 0]}>
            <boxGeometry args={[1.7, 0.05, 3.74]} />
            <meshBasicMaterial color={accentColor} transparent opacity={0.8} />
          </mesh>
          <RoundedBox args={[0.38, 0.12, 0.48]} radius={0.04} position={[0, 1.12, 0.08]} castShadow>
            <meshStandardMaterial color={accentColor} roughness={0.24} metalness={0.12} />
          </RoundedBox>
        </>
      )}

      <mesh position={[0, 0.78, 0.66]}>
        <boxGeometry args={[0.96, 0.12, 0.72]} />
        {windshieldPaint}
      </mesh>
      <mesh position={[0, 0.76, -0.78]}>
        <boxGeometry args={[0.88, 0.12, 0.58]} />
        {windshieldPaint}
      </mesh>
      <mesh position={[0, 0.78, 0.02]}>
        <boxGeometry args={[0.9, 0.08, 1.22]} />
        <meshBasicMaterial color="#111827" transparent opacity={0.5} />
      </mesh>
      {[-0.44, 0.44].map((x) => (
        <mesh key={`door-line-${variant}-${x}`} position={[x, 0.58, -0.06]}>
          <boxGeometry args={[0.03, 0.14, 1.9]} />
          <meshBasicMaterial color="#dbe3ea" transparent opacity={0.52} />
        </mesh>
      ))}

      {[-0.72, 0.72].map((x) => (
        <mesh key={`mirror-${variant}-${x}`} position={[x, 0.72, 0.56]} castShadow>
          <boxGeometry args={[0.1, 0.08, 0.14]} />
          <meshStandardMaterial color="#111827" roughness={0.26} />
        </mesh>
      ))}

      {[
        [-0.62, 0.18, 1.24],
        [0.62, 0.18, 1.24],
        [-0.62, 0.18, -1.24],
        [0.62, 0.18, -1.24],
      ].map((wheel, index) => (
        <VehicleWheel key={`${variant}-${color}-${index}`} position={wheel as [number, number, number]} radius={variant === "suv" || variant === "pickup" ? 0.26 : 0.23} />
      ))}

      <mesh position={[0.48, 0.35, 2.06]}>
        <boxGeometry args={[0.2, 0.12, 0.02]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
      <mesh position={[-0.48, 0.35, 2.06]}>
        <boxGeometry args={[0.2, 0.12, 0.02]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
      <mesh position={[0.46, 0.34, -2.06]}>
        <boxGeometry args={[0.18, 0.12, 0.02]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <mesh position={[-0.46, 0.34, -2.06]}>
        <boxGeometry args={[0.18, 0.12, 0.02]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0, 0.27, 2.08]}>
        <boxGeometry args={[0.82, 0.08, 0.02]} />
        <meshBasicMaterial color="#111827" />
      </mesh>
      <mesh position={[0, 0.26, -2.08]}>
        <boxGeometry args={[0.7, 0.08, 0.02]} />
        <meshBasicMaterial color="#111827" />
      </mesh>
      {[-0.5, 0.5].map((x) => (
        <mesh key={`tail-strip-${variant}-${x}`} position={[x, 0.34, -2.02]}>
          <boxGeometry args={[0.18, 0.06, 0.02]} />
          <meshBasicMaterial color="#fb7185" />
        </mesh>
      ))}
      <mesh position={[0, overlayPlane.y, 0.02]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={8}>
        <planeGeometry args={[overlayPlane.width, overlayPlane.depth]} />
        <meshBasicMaterial
          map={overlayMap}
          transparent
          alphaTest={0.03}
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-2}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};

const ParkingSlot = ({
  slot,
  index,
  lotSeed,
  position,
  rotationY,
  selectedSlot,
  onSelect,
}: {
  slot: ParkingSlotModel;
  index: number;
  lotSeed: number;
  position: [number, number, number];
  rotationY: number;
  selectedSlot: string | null;
  onSelect: () => void;
}) => {
  const [hovered, setHovered] = useState(false);
  const isSelected = selectedSlot === slot.id;
  const displayCode = slot.code;
  const accentColor = getSlotAccent(slot.type, slot.status, isSelected);
  const stripeColor = isSelected ? PALETTE.selected : slot.type === "normal" ? "#f8fafc" : accentColor;
  const slotFill = isSelected ? "#8ea0b6" : slot.status === "occupied" ? "#8996a3" : "#94a2af";
  const slotDeck = slot.status === "occupied" ? "#5f6b77" : "#677484";
  const showAction = (hovered || isSelected) && slot.status === "free";
  const vehicleVariant = getVehicleVariant(index, lotSeed, slot.type);
  const vehicleColor = getVehicleColor(index, lotSeed, slot.type);
  const vehicleAccent = getVehicleAccent(index, lotSeed, vehicleVariant);
  const slotStencilTexture = useMemo(
    () =>
      createSlotStencilTexture({
        displayCode,
        slotId: slot.id,
        occupied: slot.status === "occupied",
      }),
    [displayCode, slot.id, slot.status],
  );
  useCursor(hovered && slot.status === "free");

  useEffect(() => {
    return () => {
      slotStencilTexture?.dispose?.();
    };
  }, [slotStencilTexture]);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <RoundedBox
        args={[SLOT.width, 0.08, SLOT.depth]}
        radius={0.05}
        position={[0, 0.04, 0]}
        receiveShadow
        onPointerOver={() => slot.status === "free" && setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(event) => {
          event.stopPropagation();
          if (slot.status === "occupied") {
            toast.error("Vị trí này đã có xe.");
            return;
          }
          onSelect();
        }}
      >
        <meshStandardMaterial color={slotFill} roughness={0.92} />
      </RoundedBox>

      <RoundedBox args={[SLOT.width - 0.34, 0.03, SLOT.depth - 0.42]} radius={0.04} position={[0, 0.095, 0]} receiveShadow>
        <meshStandardMaterial color={slotDeck} roughness={0.96} />
      </RoundedBox>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.097, 0]} receiveShadow>
        <planeGeometry args={[SLOT.width - 0.66, SLOT.depth - 1.06]} />
        <meshBasicMaterial color="#020617" transparent opacity={0.12} />
      </mesh>

      {[-SLOT.width / 2 + 0.08, SLOT.width / 2 - 0.08].map((stripeX) => (
        <mesh key={`${slot.id}-${stripeX}`} rotation={[-Math.PI / 2, 0, 0]} position={[stripeX, 0.083, 0]} receiveShadow>
          <planeGeometry args={[0.16, SLOT.depth - 0.18]} />
          <meshBasicMaterial color={stripeColor} transparent opacity={slot.type === "normal" ? 0.88 : 0.96} />
        </mesh>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.083, -SLOT.depth / 2 + 0.4]} receiveShadow>
        <planeGeometry args={[SLOT.width - 0.18, 0.18]} />
        <meshBasicMaterial color={stripeColor} transparent opacity={slot.type === "normal" ? 0.82 : 0.95} />
      </mesh>

      <RoundedBox args={[1.8, 0.12, 0.22]} radius={0.05} position={[0, 0.11, SLOT.depth / 2 - 0.42]} castShadow receiveShadow>
        <meshStandardMaterial color="#facc15" roughness={0.95} />
      </RoundedBox>

      <mesh position={[0, 0.03, -SLOT.depth / 2 + 0.82]}>
        <circleGeometry args={[0.09, 18]} />
        <meshBasicMaterial color={slot.status === "occupied" ? PALETTE.occupied : PALETTE.available} />
      </mesh>

      {slotStencilTexture ? (
        <mesh position={[0, 0.104, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={12}>
          <planeGeometry args={[SLOT.width - 0.06, SLOT.depth - 0.24]} />
          <meshBasicMaterial
            map={slotStencilTexture}
            transparent
            alphaTest={0.02}
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-3}
            toneMapped={false}
          />
        </mesh>
      ) : (
        <>
          <Text
            position={[0, 0.11, 0.18]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={1.22}
            color={slot.status === "occupied" ? "#f8fafc" : "#0f172a"}
            anchorX="center"
            outlineWidth={0.04}
            outlineColor={slot.status === "occupied" ? "#020617" : "#f8fafc"}
          >
            {displayCode}
          </Text>
          <Text
            position={[0, 0.11, 1.46]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.52}
            color={slot.status === "occupied" ? "#f8fafc" : "#0f172a"}
            anchorX="center"
            outlineWidth={0.03}
            outlineColor={slot.status === "occupied" ? "#020617" : "#fef3c7"}
          >
            {displayCode}
          </Text>
        </>
      )}

      <SlotHelperLabel code={displayCode} occupied={slot.status === "occupied"} position={[0, 1.1, SLOT.depth / 2 - 0.9]} />

      {slot.type !== "normal" && (
        <>
          <RoundedBox args={[0.7, 0.06, 0.36]} radius={0.04} position={[0, 0.12, -0.1]} castShadow>
            <meshStandardMaterial color={slot.type === "vip" ? "#2b2110" : slot.type === "ev" ? "#1f153d" : "#072a33"} roughness={0.38} />
          </RoundedBox>
          <Text position={[0, 0.16, -0.1]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.24} color={accentColor} anchorX="center">
            {slot.type === "ev" ? "EV" : slot.type === "vip" ? "VIP" : "P"}
          </Text>
        </>
      )}

      {showAction && (
        <>
          <Sparkles position={[0, 0.42, 0.55]} color={accentColor} count={12} size={2.6} scale={0.8} speed={0.2} />
          <Html position={[0, 2.45, 0.4]} center>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/50 bg-slate-900/90 px-4 py-2 text-xs font-semibold text-white shadow-2xl"
            >
              Nhấn để đặt chỗ {slot.type !== "normal" ? `• ${slot.type.toUpperCase()}` : ""}
            </motion.div>
          </Html>
        </>
      )}

      {slot.type === "ev" && slot.status !== "occupied" && <ChargingPedestal accentColor={accentColor} />}
      {slot.status === "occupied" && (
        <ParkedCar
          color={vehicleColor}
          variant={vehicleVariant}
          accentColor={vehicleAccent}
        />
      )}
    </group>
  );
};

const ParkingCanopy = ({
  position,
  width,
  depth,
  accentColor,
  roofStyle = "open",
}: {
  position: [number, number, number];
  width: number;
  depth: number;
  accentColor: string;
  roofStyle?: ParkingRoofStyle;
}) => {
  const supportPositions = useMemo(
    () =>
      width < 14
        ? [-width / 2 + 1.6, width / 2 - 1.6]
        : [-width / 2 + 1.4, -width / 4, width / 4, width / 2 - 1.4],
    [width],
  );

  const roofY = roofStyle === "interior" ? 4.18 : roofStyle === "podium" ? 4.4 : 4.2;
  const roofThickness = roofStyle === "open" ? 0.22 : roofStyle === "podium" ? 0.36 : 0.24;
  const roofColor = roofStyle === "interior" ? "#cbd5e1" : roofStyle === "podium" ? "#1e293b" : PALETTE.canopy;
  const trimColor = roofStyle === "interior" ? "#475569" : accentColor;
  const columnColor = roofStyle === "interior" ? "#9ca3af" : "#475569";
  const lightIntensity = roofStyle === "open" ? 0.5 : 0.85;
  const lightColor = roofStyle === "interior" ? "#f8fafc" : "#fef3c7";

  return (
    <group position={position}>
      <RoundedBox args={[width, roofThickness, depth]} radius={0.12} position={[0, roofY, 0]} castShadow>
        <meshPhysicalMaterial
          color={roofColor}
          metalness={roofStyle === "interior" ? 0.18 : 0.55}
          roughness={roofStyle === "interior" ? 0.55 : 0.18}
          clearcoat={roofStyle === "open" ? 0.92 : 0.4}
        />
      </RoundedBox>

      <RoundedBox args={[width - 0.55, 0.05, depth - 0.55]} radius={0.06} position={[0, roofY + roofThickness / 2 + 0.06, 0]} castShadow>
        <meshStandardMaterial color={trimColor} metalness={0.75} roughness={0.18} />
      </RoundedBox>

      {supportPositions.map((x) => (
        <mesh key={`support-front-${x}`} position={[x, roofY / 2 - 0.08, depth / 2 - 0.72]} castShadow>
          <cylinderGeometry args={[0.13, 0.15, 4.04, 14]} />
          <meshStandardMaterial color={columnColor} metalness={0.82} roughness={0.26} />
        </mesh>
      ))}
      {supportPositions.map((x) => (
        <mesh key={`support-back-${x}`} position={[x, roofY / 2 - 0.08, -depth / 2 + 0.72]} castShadow>
          <cylinderGeometry args={[0.13, 0.15, 4.04, 14]} />
          <meshStandardMaterial color={columnColor} metalness={0.82} roughness={0.26} />
        </mesh>
      ))}

      {[-width / 3, 0, width / 3].map((x) => (
        <group key={`light-${x}`} position={[x, roofY - 0.25, 0]}>
          <mesh>
            <boxGeometry args={[roofStyle === "interior" ? 2.35 : 1.9, 0.05, 0.24]} />
            <meshBasicMaterial color={lightColor} />
          </mesh>
          <pointLight position={[0, -0.1, 0]} color={lightColor} intensity={lightIntensity} distance={7} />
        </group>
      ))}
    </group>
  );
};

const GuardFigure = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh position={[0, 0.2, 0]} castShadow>
      <cylinderGeometry args={[0.12, 0.14, 0.4, 10]} />
      <meshStandardMaterial color="#0f172a" roughness={0.84} />
    </mesh>
    <mesh position={[0, 0.66, 0]} castShadow>
      <capsuleGeometry args={[0.18, 0.52, 4, 10]} />
      <meshStandardMaterial color="#1d4ed8" roughness={0.72} />
    </mesh>
    <mesh position={[0, 1.18, 0.02]} castShadow>
      <sphereGeometry args={[0.16, 16, 16]} />
      <meshStandardMaterial color="#f1c27d" roughness={0.82} />
    </mesh>
    <mesh position={[0, 1.34, 0.02]} castShadow>
      <boxGeometry args={[0.26, 0.06, 0.24]} />
      <meshStandardMaterial color="#0f172a" roughness={0.52} />
    </mesh>
  </group>
);

const SecurityBooth = ({ position, label }: { position: [number, number, number]; label: string }) => {
  const lightRef = useRef<THREE.PointLight | null>(null);

  useFrame((state) => {
    if (!lightRef.current) return;
    lightRef.current.intensity = 0.75 + Math.sin(state.clock.elapsedTime * 2.4) * 0.1;
  });

  return (
    <group position={position}>
      <RoundedBox args={[3.8, 0.14, 3.1]} radius={0.08} position={[0, 0.07, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#cbd5e1" roughness={0.95} />
      </RoundedBox>
      <RoundedBox args={[3.08, 2.18, 2.34]} radius={0.12} position={[0, 1.12, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={PALETTE.white} roughness={0.3} metalness={0.05} />
      </RoundedBox>
      <RoundedBox args={[3.34, 0.16, 2.68]} radius={0.08} position={[0, 2.28, 0]} castShadow>
        <meshStandardMaterial color="#1e293b" metalness={0.58} roughness={0.22} />
      </RoundedBox>
      <RoundedBox args={[1.96, 0.94, 0.08]} radius={0.02} position={[0, 1.28, 1.2]}>
        <meshPhysicalMaterial color={PALETTE.glass} transmission={0.42} roughness={0.03} transparent opacity={0.74} />
      </RoundedBox>
      <RoundedBox args={[0.08, 0.98, 1.26]} radius={0.02} position={[-1.5, 1.22, 0.3]}>
        <meshPhysicalMaterial color={PALETTE.glass} transmission={0.32} roughness={0.04} transparent opacity={0.56} />
      </RoundedBox>
      <RoundedBox args={[0.08, 0.98, 1.26]} radius={0.02} position={[1.5, 1.22, 0.3]}>
        <meshPhysicalMaterial color={PALETTE.glass} transmission={0.32} roughness={0.04} transparent opacity={0.56} />
      </RoundedBox>
      <mesh position={[0.42, 0.66, -0.18]} castShadow>
        <boxGeometry args={[0.92, 0.82, 0.48]} />
        <meshStandardMaterial color="#64748b" roughness={0.88} />
      </mesh>
      <mesh position={[-0.38, 0.78, -0.24]} castShadow>
        <boxGeometry args={[0.62, 0.18, 0.52]} />
        <meshStandardMaterial color="#8b9bb0" roughness={0.84} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 1.72, 0.2]} color="#fff4c2" intensity={0.8} distance={5.5} />
      <GuardFigure position={[-0.56, 0, 0.2]} />
      <Text position={[0, 2.72, 0]} fontSize={0.18} color={PALETTE.white} anchorX="center" maxWidth={2.8}>
        {label}
      </Text>
    </group>
  );
};

const BarrierGate = ({
  position,
  rotationY = 0,
  open,
  label,
}: {
  position: [number, number, number];
  rotationY?: number;
  open: boolean;
  label: string;
}) => {
  const armRef = useRef<THREE.Group | null>(null);

  useFrame(() => {
    if (!armRef.current) return;
    const targetRotation = open ? -Math.PI / 2.8 : 0;
    armRef.current.rotation.z += (targetRotation - armRef.current.rotation.z) * 0.08;
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <RoundedBox args={[0.74, 1.12, 0.66]} radius={0.06} position={[0, 0.56, 0]} castShadow>
        <meshStandardMaterial color="#f59e0b" metalness={0.22} roughness={0.52} />
      </RoundedBox>

      <mesh position={[0, 1.22, 0.2]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={open ? PALETTE.available : PALETTE.occupied} />
      </mesh>
      <pointLight position={[0, 1.22, 0.38]} color={open ? PALETTE.available : PALETTE.occupied} intensity={0.6} distance={1.8} />

      <group ref={armRef} position={[0.1, 0.92, 0]}>
        <RoundedBox args={[3.2, 0.1, 0.08]} radius={0.04} position={[1.6, 0, 0]} castShadow>
          <meshStandardMaterial color={PALETTE.white} roughness={0.58} />
        </RoundedBox>
      </group>

      <Html position={[0, 1.72, 0]} center>
        <div className="rounded-full border border-white/40 bg-slate-950/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
          {label}
        </div>
      </Html>
    </group>
  );
};

const ServiceRoomBlock = ({
  position,
  width = 9.8,
  label,
}: {
  position: [number, number, number];
  width?: number;
  label: string;
}) => (
  <group position={position}>
    <RoundedBox args={[width, 3.4, 2.9]} radius={0.16} position={[0, 1.72, 0]} castShadow receiveShadow>
      <meshPhysicalMaterial color="#eef3f8" roughness={0.42} metalness={0.04} />
    </RoundedBox>
    <RoundedBox args={[width - 0.4, 0.18, 3.1]} radius={0.08} position={[0, 3.44, 0]} castShadow>
      <meshStandardMaterial color="#0f172a" metalness={0.58} roughness={0.24} />
    </RoundedBox>
    <RoundedBox args={[3.8, 1.22, 0.08]} radius={0.03} position={[width * 0.2, 1.72, 1.48]}>
      <meshPhysicalMaterial color={PALETTE.glass} transmission={0.48} transparent opacity={0.78} roughness={0.02} />
    </RoundedBox>
    <RoundedBox args={[2.18, 1.02, 0.08]} radius={0.03} position={[-width * 0.26, 1.48, 1.48]}>
      <meshPhysicalMaterial color={PALETTE.glass} transmission={0.42} transparent opacity={0.72} roughness={0.03} />
    </RoundedBox>
    <Text position={[-width * 0.22, 3.82, 0]} fontSize={0.18} color={PALETTE.white} anchorX="center">
      {label}
    </Text>
  </group>
);

const BasementLobby = ({
  position,
  accentColor,
}: {
  position: [number, number, number];
  accentColor: string;
}) => (
  <group position={position}>
    <RoundedBox args={[5.8, 3.14, 2.6]} radius={0.14} position={[0, 1.57, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#edf2f7" roughness={0.44} />
    </RoundedBox>
    <RoundedBox args={[1.14, 2.14, 0.08]} radius={0.03} position={[-1.02, 1.3, 1.32]}>
      <meshPhysicalMaterial color="#94a3b8" metalness={0.26} roughness={0.28} />
    </RoundedBox>
    <RoundedBox args={[1.14, 2.14, 0.08]} radius={0.03} position={[1.02, 1.3, 1.32]}>
      <meshPhysicalMaterial color="#94a3b8" metalness={0.26} roughness={0.28} />
    </RoundedBox>
    <RoundedBox args={[2.06, 0.48, 0.1]} radius={0.03} position={[0, 2.56, 1.34]}>
      <meshStandardMaterial color="#16a34a" roughness={0.24} />
    </RoundedBox>
    <Text position={[0, 2.58, 1.42]} fontSize={0.12} color="#ffffff" anchorX="center">
      LIFT LOBBY
    </Text>
    <mesh position={[0, 0.06, -0.12]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[4.6, 1.4]} />
      <meshBasicMaterial color={accentColor} transparent opacity={0.08} />
    </mesh>
  </group>
);

const ScooterModel = ({
  position,
  color,
  rotationY = 0,
  scale = 1,
}: {
  position: [number, number, number];
  color: string;
  rotationY?: number;
  scale?: number;
}) => (
  <group position={position} rotation={[0, rotationY, 0]} scale={[scale, scale, scale]}>
    <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.24, 0.16, 1.1]} />
      <meshStandardMaterial color={color} metalness={0.38} roughness={0.28} />
    </mesh>
    <mesh position={[0, 0.38, -0.06]} castShadow>
      <boxGeometry args={[0.26, 0.18, 0.42]} />
      <meshStandardMaterial color="#0f172a" roughness={0.22} />
    </mesh>
    <mesh position={[0, 0.58, 0.18]} rotation={[0.36, 0, 0]} castShadow>
      <boxGeometry args={[0.16, 0.32, 0.12]} />
      <meshStandardMaterial color="#94a3b8" metalness={0.52} roughness={0.24} />
    </mesh>
    <mesh position={[0, 0.74, 0.34]} castShadow>
      <boxGeometry args={[0.32, 0.03, 0.18]} />
      <meshStandardMaterial color="#475569" metalness={0.65} roughness={0.18} />
    </mesh>
    <VehicleWheel position={[-0.18, 0.12, 0.34]} radius={0.12} width={0.1} />
    <VehicleWheel position={[-0.18, 0.12, -0.34]} radius={0.12} width={0.1} />
  </group>
);

const MotorbikeBay = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh position={[0, 0.04, 0]} receiveShadow>
      <boxGeometry args={[10.2, 0.08, 4.8]} />
      <meshStandardMaterial color="#dfe7ef" roughness={0.98} />
    </mesh>
    <mesh position={[0, 2.12, -1.72]} castShadow>
      <boxGeometry args={[9.8, 0.12, 0.18]} />
      <meshStandardMaterial color="#0f172a" roughness={0.28} />
    </mesh>
    {[-4.4, -2.2, 0, 2.2, 4.4].map((x) => (
      <mesh key={`moto-shelter-${x}`} position={[x, 1.04, -1.72]} castShadow>
        <boxGeometry args={[0.08, 2.08, 0.08]} />
        <meshStandardMaterial color="#64748b" metalness={0.62} roughness={0.24} />
      </mesh>
    ))}
    <mesh position={[0, 0.05, 1.7]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[8.6, 0.18]} />
      <meshBasicMaterial color="#facc15" />
    </mesh>
    <Text position={[0, 0.05, 1.34]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.36} color="#0f172a" anchorX="center">
      MOTO
    </Text>
    {[-3.6, -2.4, -1.2, 0, 1.2, 2.4, 3.6].map((x, index) => (
      <ScooterModel
        key={`motorbike-${x}`}
        position={[x, 0.08, index % 2 === 0 ? -0.48 : 0.48]}
        color={["#111827", "#1d4ed8", "#7f1d1d", "#475569", "#0f766e"][index % 5]}
        rotationY={index % 2 === 0 ? 0.04 : Math.PI + 0.04}
      />
    ))}
  </group>
);

const CctvRig = ({ position }: { position: [number, number, number] }) => {
  const headRef = useRef<THREE.Mesh | null>(null);

  useFrame((state) => {
    if (!headRef.current) return;
    headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.55;
  });

  return (
    <group position={position}>
      <mesh position={[0, -0.08, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.24, 12]} />
        <meshStandardMaterial color="#475569" roughness={0.4} />
      </mesh>
      <mesh ref={headRef} rotation={[0.2, 0.3, 0]} castShadow>
        <boxGeometry args={[0.28, 0.16, 0.18]} />
        <meshStandardMaterial color="#111827" metalness={0.26} roughness={0.34} />
      </mesh>
      <pointLight position={[0.1, -0.06, 0.2]} color="#93c5fd" intensity={0.18} distance={1.5} />
    </group>
  );
};

const ConeCluster = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    {[-0.4, 0, 0.4].map((x) => (
      <group key={`cone-${x}`} position={[x, 0, 0]}>
        <mesh position={[0, 0.22, 0]} castShadow>
          <coneGeometry args={[0.12, 0.44, 14]} />
          <meshStandardMaterial color="#f97316" roughness={0.64} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.14, 0.18, 0.1, 14]} />
          <meshStandardMaterial color="#111827" roughness={0.88} />
        </mesh>
      </group>
    ))}
  </group>
);

const PickupShelter = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh position={[0, 1.82, 0]} castShadow>
      <boxGeometry args={[6.2, 0.16, 2.4]} />
      <meshStandardMaterial color="#b9c6d4" metalness={0.28} roughness={0.26} />
    </mesh>
    {[-2.6, 2.6].map((x) => (
      <mesh key={`pickup-post-${x}`} position={[x, 0.9, 0]} castShadow>
        <boxGeometry args={[0.12, 1.8, 0.12]} />
        <meshStandardMaterial color="#64748b" metalness={0.58} roughness={0.24} />
      </mesh>
    ))}
    <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
      <boxGeometry args={[2.2, 0.12, 0.5]} />
      <meshStandardMaterial color="#94a3b8" roughness={0.84} />
    </mesh>
    <Text position={[0, 2.2, 0]} fontSize={0.16} color="#0f172a" anchorX="center">
      PICKUP
    </Text>
  </group>
);

const MovingTrafficCar = ({
  startX,
  endX,
  z,
  speed,
  direction,
  variant,
  color,
  accentColor,
}: {
  startX: number;
  endX: number;
  z: number;
  speed: number;
  direction: 1 | -1;
  variant: ParkingVehicleVariant;
  color: string;
  accentColor: string;
}) => {
  const carRef = useRef<THREE.Group | null>(null);

  useFrame((_, delta) => {
    if (!carRef.current) return;
    carRef.current.position.x += direction * speed * delta;

    if (direction === 1 && carRef.current.position.x > endX) {
      carRef.current.position.x = startX;
    } else if (direction === -1 && carRef.current.position.x < startX) {
      carRef.current.position.x = endX;
    }
  });

  return (
    <group ref={carRef} position={[direction === 1 ? startX : endX, 0, z]} rotation={[0, direction === 1 ? 0 : Math.PI, 0]}>
      <ParkedCar color={color} variant={variant} accentColor={accentColor} scale={0.88} />
    </group>
  );
};

const LampPost = ({ position, nightMode }: { position: [number, number, number]; nightMode: boolean }) => (
  <group position={position}>
    <mesh position={[0, 2.65, 0]} castShadow>
      <cylinderGeometry args={[0.08, 0.1, 5.3, 12]} />
      <meshStandardMaterial color="#475569" metalness={0.82} roughness={0.28} />
    </mesh>
    <mesh position={[0.62, 5.05, 0]} rotation={[0, 0, -0.55]} castShadow>
      <cylinderGeometry args={[0.04, 0.05, 1.15, 10]} />
      <meshStandardMaterial color="#475569" metalness={0.82} roughness={0.28} />
    </mesh>
    <RoundedBox args={[0.44, 0.16, 0.26]} radius={0.04} position={[0.98, 5.18, 0]} castShadow>
      <meshStandardMaterial color="#1e293b" metalness={0.65} roughness={0.2} />
    </RoundedBox>
    <mesh position={[0.98, 5.08, 0]}>
      <boxGeometry args={[0.38, 0.05, 0.2]} />
      <meshBasicMaterial color="#fef3c7" />
    </mesh>
    <pointLight position={[0.98, 4.72, 0]} color="#fef3c7" intensity={nightMode ? 1.25 : 0.32} distance={10} />
  </group>
);

const PlanterIsland = ({ position, width }: { position: [number, number, number]; width: number }) => (
  <group position={position}>
    <RoundedBox args={[width, 0.28, 1.9]} radius={0.12} position={[0, 0.14, 0]} castShadow receiveShadow>
      <meshStandardMaterial color={PALETTE.concreteEdge} roughness={0.95} />
    </RoundedBox>
    <mesh position={[0, 0.29, 0]} receiveShadow>
      <boxGeometry args={[width - 0.2, 0.08, 1.65]} />
      <meshStandardMaterial color="#7ea84c" roughness={0.95} />
    </mesh>
    {[-width / 2 + 1.2, 0, width / 2 - 1.2].map((x, index) => (
      <group key={`tree-${index}`} position={[x, 0.34, 0]}>
        <mesh position={[0, 0.78, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.18, 1.55, 10]} />
          <meshStandardMaterial color="#6b4f34" roughness={0.96} />
        </mesh>
        <mesh position={[0, 1.88, 0]} castShadow>
          <sphereGeometry args={[0.74, 18, 18]} />
          <meshStandardMaterial color={PALETTE.tree} roughness={0.88} />
        </mesh>
      </group>
    ))}
  </group>
);

const OilMark = ({
  position,
  rotation = 0,
  scale = [1, 1, 1],
}: {
  position: [number, number, number];
  rotation?: number;
  scale?: [number, number, number];
}) => (
  <mesh position={position} rotation={[-Math.PI / 2, 0, rotation]} scale={scale}>
    <circleGeometry args={[0.52, 20]} />
    <meshStandardMaterial color="#111827" transparent opacity={0.12} roughness={1} />
  </mesh>
);

const configureRepeatedTexture = (texture: THREE.Texture, repeatX: number, repeatY: number) => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
};

const FenceRun = ({
  position,
  length,
  rotationY = 0,
}: {
  position: [number, number, number];
  length: number;
  rotationY?: number;
}) => {
  const postCount = Math.max(2, Math.floor(length / 3.1));
  const startX = -length / 2;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <RoundedBox args={[length, 0.08, 0.08]} radius={0.02} position={[0, 1.5, 0]} castShadow>
        <meshStandardMaterial color="#64748b" metalness={0.55} roughness={0.3} />
      </RoundedBox>
      <RoundedBox args={[length, 0.08, 0.08]} radius={0.02} position={[0, 0.75, 0]} castShadow>
        <meshStandardMaterial color="#64748b" metalness={0.55} roughness={0.3} />
      </RoundedBox>
      {Array.from({ length: postCount + 1 }).map((_, index) => {
        const x = startX + (length / postCount) * index;

        return (
          <mesh key={`fence-post-${length}-${index}`} position={[x, 0.8, 0]} castShadow>
            <boxGeometry args={[0.08, 1.62, 0.08]} />
            <meshStandardMaterial color="#475569" metalness={0.62} roughness={0.28} />
          </mesh>
        );
      })}
    </group>
  );
};

const StreetTree = ({
  position,
  crownScale = 1,
}: {
  position: [number, number, number];
  crownScale?: number;
}) => (
  <group position={position}>
    <RoundedBox args={[2.4, 0.34, 2.4]} radius={0.12} position={[0, 0.17, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#b6c1ce" roughness={0.94} />
    </RoundedBox>
    <mesh position={[0, 0.42, 0]} receiveShadow>
      <boxGeometry args={[1.8, 0.16, 1.8]} />
      <meshStandardMaterial color="#6b8f46" roughness={0.96} />
    </mesh>
    <mesh position={[0, 1.22, 0]} castShadow>
      <cylinderGeometry args={[0.12, 0.16, 1.5, 12]} />
      <meshStandardMaterial color="#6b4f34" roughness={0.96} />
    </mesh>
    <mesh position={[0, 2.58, 0]} scale={[crownScale, crownScale * 0.9, crownScale]}>
      <sphereGeometry args={[1.18, 20, 20]} />
      <meshStandardMaterial color="#2f6a2f" roughness={0.88} />
    </mesh>
  </group>
);

const ParkingKiosk = ({
  position,
  accentColor,
  label,
}: {
  position: [number, number, number];
  accentColor: string;
  label: string;
}) => (
  <group position={position}>
    <RoundedBox args={[1.3, 0.12, 1.3]} radius={0.08} position={[0, 0.06, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#cbd5e1" roughness={0.92} />
    </RoundedBox>
    <RoundedBox args={[0.86, 2.14, 0.7]} radius={0.08} position={[0, 1.1, 0]} castShadow>
      <meshPhysicalMaterial color="#111827" roughness={0.28} metalness={0.58} />
    </RoundedBox>
    <RoundedBox args={[0.56, 0.92, 0.05]} radius={0.04} position={[0, 1.28, 0.38]}>
      <meshBasicMaterial color={accentColor} />
    </RoundedBox>
    <Text position={[0, 2.32, 0]} fontSize={0.12} color="#0f172a" anchorX="center">
      {label}
    </Text>
  </group>
);

const EntrancePortal = ({
  position,
  width,
  label,
  accentColor,
}: {
  position: [number, number, number];
  width: number;
  label: string;
  accentColor: string;
}) => (
  <group position={position}>
    {[-width / 2, width / 2].map((x) => (
      <mesh key={`portal-post-${label}-${x}`} position={[x, 2.35, 0]} castShadow>
        <boxGeometry args={[0.38, 4.7, 0.38]} />
        <meshStandardMaterial color="#475569" metalness={0.32} roughness={0.42} />
      </mesh>
    ))}
    <RoundedBox args={[width + 0.85, 0.42, 0.46]} radius={0.1} position={[0, 4.68, 0]} castShadow>
      <meshStandardMaterial color={accentColor} metalness={0.12} roughness={0.32} />
    </RoundedBox>
    <Text position={[0, 4.72, 0.28]} fontSize={0.22} color="#ffffff" anchorX="center">
      {label}
    </Text>
  </group>
);

const UrbanShopRow = ({
  position,
  lotSeed,
  facing = "south",
}: {
  position: [number, number, number];
  lotSeed: number;
  facing?: "south" | "north";
}) => {
  const labels = ["CA PHE", "MINIMART", "RUA XE", "NHA XE", "SHOP", "PARKING"];
  const widths = [4.4, 4.9, 4.2, 4.8, 4.1, 4.6];
  const totalWidth = widths.reduce((sum, item) => sum + item, 0) + (widths.length - 1) * 0.4;
  let cursor = -totalWidth / 2;

  return (
    <group position={position}>
      {widths.map((width, index) => {
        const height = 5.8 + ((lotSeed + index) % 3) * 1.1;
        const x = cursor + width / 2;
        cursor += width + 0.4;
        const awningColor = ["#ef4444", "#2563eb", "#f97316", "#16a34a", "#0ea5e9", "#7c3aed"][(lotSeed + index) % 6];
        const label = labels[(lotSeed + index) % labels.length];

        return (
          <group key={`shop-${index}`} position={[x, 0, 0]}>
            <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[width, height, 5.2]} />
              <meshStandardMaterial color="#e5edf5" roughness={0.88} />
            </mesh>
            <mesh position={[0, 2.5, facing === "south" ? 2.62 : -2.62]} castShadow>
              <boxGeometry args={[width - 0.28, 0.42, 0.72]} />
              <meshStandardMaterial color={awningColor} roughness={0.42} />
            </mesh>
            <mesh position={[0, 1.35, facing === "south" ? 2.63 : -2.63]}>
              <planeGeometry args={[width - 0.68, 1.68]} />
              <meshBasicMaterial color="#bfdbfe" transparent opacity={0.78} side={THREE.DoubleSide} />
            </mesh>
            <Text position={[0, 2.48, facing === "south" ? 3.02 : -3.02]} rotation={[0, facing === "south" ? 0 : Math.PI, 0]} fontSize={0.16} color="#ffffff" anchorX="center">
              {label}
            </Text>
          </group>
        );
      })}
    </group>
  );
};

const UrbanParkingContext = ({
  width,
  depth,
  laneWidth,
  accentColor,
  nightMode,
  lotName,
  lotSeed,
}: {
  width: number;
  depth: number;
  laneWidth: number;
  accentColor: string;
  nightMode: boolean;
  lotName: string;
  lotSeed: number;
}) => {
  const entryX = -width / 2 + 13.4;
  const exitX = width / 2 - 13.4;
  const frontStreetZ = depth / 2 + 8.2;
  const frontSidewalkZ = depth / 2 + 2.2;
  const frontFenceZ = depth / 2 + 0.3;
  const backServiceZ = -depth / 2 - 4.4;
  const backFenceZ = -depth / 2 + 0.2;
  const bikeBayX = width / 2 - (lotSeed % 2 === 0 ? 14 : 18);
  const serviceX = -width / 2 + 12.2;
  const lobbyX = lotSeed % 3 === 0 ? 3.8 : 10.5;
  const fenceFrontLeft = entryX - (-width / 2 + 2);
  const fenceFrontCenter = exitX - entryX - 8.5;
  const fenceFrontRight = width / 2 - 2 - exitX;

  return (
    <group>
      <FenceRun position={[-width / 2 + 2 + fenceFrontLeft / 2, 0, frontFenceZ]} length={fenceFrontLeft} />
      <FenceRun position={[(entryX + exitX) / 2, 0, frontFenceZ]} length={Math.max(6, fenceFrontCenter)} />
      <FenceRun position={[exitX + fenceFrontRight / 2, 0, frontFenceZ]} length={fenceFrontRight} />
      <FenceRun position={[0, 0, backFenceZ]} length={width + 4} />
      <FenceRun position={[-width / 2 - 1.8, 0, 0]} length={depth - 5} rotationY={Math.PI / 2} />
      <FenceRun position={[width / 2 + 1.8, 0, 0]} length={depth - 5} rotationY={Math.PI / 2} />

      <EntrancePortal position={[entryX, 0, frontFenceZ]} width={6.4} label="ENTRY" accentColor={accentColor} />
      <EntrancePortal position={[exitX, 0, frontFenceZ]} width={6.4} label="EXIT" accentColor="#334155" />

      <SecurityBooth position={[entryX - 5.1, 0, frontSidewalkZ + 0.25]} label="GUARD POST" />
      <BarrierGate position={[entryX - 0.5, 0, frontFenceZ - 0.8]} label="ENTRY" open={false} />
      <BarrierGate position={[exitX + 0.5, 0, frontFenceZ - 0.8]} rotationY={Math.PI} label="EXIT" open />
      <WayfindingTotem position={[entryX - 8.8, 0, frontSidewalkZ - 1.5]} lotName={lotName} accentColor={accentColor} />
      <ParkingKiosk position={[entryX + 7.1, 0, frontSidewalkZ - 1]} accentColor={accentColor} label="PAY" />

      <ServiceRoomBlock position={[serviceX, 0, backFenceZ - 1.7]} width={10.4} label="CONTROL ROOM" />
      <BasementLobby position={[lobbyX, 0, backFenceZ - 1.55]} accentColor={accentColor} />
      <MotorbikeBay position={[bikeBayX, 0, backFenceZ - 0.4]} />

      <ParkingCanopy position={[serviceX + 9.2, 0, backFenceZ - 1.35]} width={10.6} depth={4.2} accentColor={accentColor} roofStyle="open" />

      <PickupShelter position={[-width / 2 + 8.4, 0, frontStreetZ - 0.35]} />
      <ConeCluster position={[entryX + 2.8, 0, frontFenceZ + 0.45]} />
      <ConeCluster position={[exitX - 2.8, 0, frontFenceZ + 0.45]} />

      {[entryX, exitX, 0].map((x) => (
        <LampPost key={`urban-lamp-${x}`} position={[x, 0, frontStreetZ + 1.6]} nightMode={nightMode} />
      ))}
      {[-width / 2 + 8.4, width / 2 - 8.4].map((x) => (
        <LampPost key={`rear-lamp-${x}`} position={[x, 0, backServiceZ - 0.6]} nightMode={nightMode} />
      ))}

      {[-width / 2 + 8, -width / 2 + 19.5, width / 2 - 20.5, width / 2 - 9].map((x, index) => (
        <StreetTree
          key={`street-tree-${x}`}
          position={[x, 0, frontSidewalkZ + 0.75]}
          crownScale={index % 2 === 0 ? 1.05 : 0.9}
        />
      ))}
      {[-width / 2 + 12.5, width / 2 - 14.5].map((x) => (
        <StreetTree key={`back-tree-${x}`} position={[x, 0, backServiceZ + 1.8]} crownScale={0.85} />
      ))}

      <CctvRig position={[entryX - 2.4, 4.8, frontFenceZ - 0.2]} />
      <CctvRig position={[exitX + 2.4, 4.8, frontFenceZ - 0.2]} />

      <MovingTrafficCar
        startX={-width / 2 - 18}
        endX={width / 2 + 18}
        z={frontStreetZ}
        speed={3.8}
        direction={1}
        variant={lotSeed % 2 === 0 ? "taxi" : "mpv"}
        color={lotSeed % 2 === 0 ? "#f8fafc" : "#dfe4ea"}
        accentColor={lotSeed % 2 === 0 ? "#facc15" : "#38bdf8"}
      />
      <MovingTrafficCar
        startX={-width / 2 - 18}
        endX={width / 2 + 18}
        z={backServiceZ}
        speed={2.9}
        direction={-1}
        variant={lotSeed % 3 === 0 ? "pickup" : "suv"}
        color={lotSeed % 3 === 0 ? "#475569" : "#1f2937"}
        accentColor="#22c55e"
      />

      <UrbanShopRow position={[0, 0, backServiceZ - 4.8]} lotSeed={lotSeed} facing="south" />

      <PerimeterBuilding position={[-width / 2 - 13, 0, backServiceZ - 0.8]} width={12} height={10} depth={9} />
      <PerimeterBuilding position={[width / 2 + 13, 0, backServiceZ - 0.8]} width={12} height={8} depth={9} />

      <mesh position={[0, 0.06, frontStreetZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width + 28, 0.24]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>
      {[-6, 0, 6].map((z) => (
        <mesh key={`crosswalk-${z}`} position={[entryX - 7.4, 0.08, frontStreetZ + z * 0.14]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.8, 0.32]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
      ))}

      <Text position={[entryX - 0.8, 0.12, frontFenceZ - 3.1]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.62} color="#f8fafc">
        ENTRY
      </Text>
      <Text position={[exitX + 0.8, 0.12, frontFenceZ - 3.1]} rotation={[-Math.PI / 2, 0, Math.PI]} fontSize={0.62} color="#f8fafc">
        EXIT
      </Text>
      <Text position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.95} color="#f8fafc">
        ZONE A
      </Text>
    </group>
  );
};

const IndoorParkingShell = ({ width, depth, height }: { width: number; depth: number; height: number }) => (
  <group>
    <mesh position={[0, height + 0.14, -depth * 0.24]} receiveShadow>
      <boxGeometry args={[width, 0.22, depth * 0.42]} />
      <meshStandardMaterial color="#d7dee7" roughness={0.88} />
    </mesh>

    {[
      [0, height - 1.25, -depth / 2 + 0.18, width, 3.15, 0.32],
      [-width / 2 + 0.18, height - 1.25, -depth * 0.14, 0.35, 3.15, depth * 0.56],
      [width / 2 - 0.18, height - 1.25, -depth * 0.14, 0.35, 3.15, depth * 0.56],
    ].map((wall, index) => (
      <mesh key={`indoor-wall-${index}`} position={[wall[0], wall[1], wall[2]]} receiveShadow>
        <boxGeometry args={[wall[3], wall[4], wall[5]]} />
        <meshStandardMaterial color="#a9b5c2" roughness={0.95} />
      </mesh>
    ))}

    {[-width / 3, 0, width / 3].map((x) => (
      <mesh key={`indoor-rib-${x}`} position={[x, height - 0.12, -depth * 0.18]} receiveShadow>
        <boxGeometry args={[0.18, 0.18, depth * 0.44]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.82} />
      </mesh>
    ))}

    <RoundedBox args={[2.1, 2.4, 0.14]} radius={0.06} position={[0, 1.22, -depth / 2 + 0.28]} receiveShadow>
      <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
    </RoundedBox>
    <RoundedBox args={[0.94, 2.02, 0.06]} radius={0.02} position={[0, 1.05, -depth / 2 + 0.38]}>
      <meshPhysicalMaterial color="#475569" roughness={0.28} metalness={0.18} />
    </RoundedBox>
    <mesh position={[width / 2 - 4.8, 2.4, -depth / 2 + 0.34]}>
      <boxGeometry args={[2.6, 0.42, 0.08]} />
      <meshStandardMaterial color="#2563eb" roughness={0.3} metalness={0.1} />
    </mesh>
  </group>
);

const IndoorParkingContext = ({
  width,
  depth,
  laneWidth,
  shellHeight,
  accentColor,
  nightMode,
  lotName,
}: {
  width: number;
  depth: number;
  laneWidth: number;
  shellHeight: number;
  accentColor: string;
  nightMode: boolean;
  lotName: string;
}) => {
  const frontEdgeZ = -laneWidth / 2 - 5.15;
  const rearEdgeZ = laneWidth / 2 + 5.8;
  const sideColumns = [-width / 2 + 4.8, -width / 2 + 14.2, -width / 2 + 23.6, width / 2 - 23.6, width / 2 - 14.2, width / 2 - 4.8];
  const serviceCoreX = -width / 2 + 8.8;
  const bikeBayX = width / 2 - 10.2;

  return (
    <group>
      {sideColumns.map((x) => (
        <group key={`indoor-column-${x}`} position={[x, 0, 0]}>
          {[frontEdgeZ, rearEdgeZ].map((z) => (
            <group key={`column-${x}-${z}`} position={[0, 0, z]}>
              <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.44, 3.6, 0.44]} />
                <meshStandardMaterial color="#9aa7b6" roughness={0.92} />
              </mesh>
              <mesh position={[0, 3.68, 0]} receiveShadow>
                <boxGeometry args={[0.96, 0.18, 0.96]} />
                <meshStandardMaterial color="#cbd5e1" roughness={0.94} />
              </mesh>
              <mesh position={[0, 0.1, 0]} receiveShadow>
                <boxGeometry args={[0.9, 0.18, 0.9]} />
                <meshStandardMaterial color="#d8e1ea" roughness={0.95} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {[-width / 3.4, 0, width / 3.4].map((x) => (
        <group key={`ceiling-strip-${x}`} position={[x, shellHeight - 0.82, 0]}>
          <mesh castShadow>
            <boxGeometry args={[3.4, 0.09, depth * 0.76]} />
            <meshStandardMaterial color="#7b8794" metalness={0.28} roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.06, 0]}>
            <boxGeometry args={[2.96, 0.03, depth * 0.7]} />
            <meshBasicMaterial color={nightMode ? "#dbeafe" : "#f8fafc"} />
          </mesh>
        </group>
      ))}

      {[-width / 4, width / 4].map((x) => (
        <mesh
          key={`sprinkler-pipe-${x}`}
          position={[x, shellHeight - 0.36, -depth * 0.08]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.08, 0.08, depth * 0.74, 14]} />
          <meshStandardMaterial color="#64748b" metalness={0.38} roughness={0.42} />
        </mesh>
      ))}

      <mesh position={[0, shellHeight - 0.42, rearEdgeZ - 0.65]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, width - 12, 16]} />
        <meshStandardMaterial color="#dc2626" metalness={0.22} roughness={0.42} />
      </mesh>

      <mesh position={[0, 2.14, rearEdgeZ + 1.28]} receiveShadow>
        <boxGeometry args={[width - 8.8, 1.7, 0.12]} />
        <meshStandardMaterial color="#cfd8e3" roughness={0.95} />
      </mesh>
      {/* legacy sign stub
        <boxGeometry args={[width - 9.8, 0.12, 0.08]} />
        <meshBasicMaterial color={accentColor} />
      P2 • A ZONE
      */}

    <RoundedBox args={[1.02, 1.78, 0.12]} radius={0.03} position={[-width / 2 + 3.4, 1.08, -depth / 2 + 0.34]} castShadow>
      <meshStandardMaterial color="#dc2626" roughness={0.42} />
    </RoundedBox>
    <Text position={[-width / 2 + 3.4, 1.08, -depth / 2 + 0.46]} fontSize={0.12} color="#ffffff" anchorX="center">
      FIRE
    </Text>

    <mesh position={[width / 2 - 4.8, 0.36, -depth / 2 + 2.3]} rotation={[0, 0, -0.2]} receiveShadow>
      <boxGeometry args={[4.2, 0.14, 2.6]} />
      <meshStandardMaterial color={nightMode ? "#475569" : "#cbd5e1"} roughness={0.9} />
    </mesh>
    <mesh position={[width / 2 - 3.2, 1.16, -depth / 2 + 1.3]} rotation={[0, -0.3, 0]}>
      <boxGeometry args={[1.1, 1.6, 0.1]} />
      <meshStandardMaterial color="#94a3b8" roughness={0.74} metalness={0.12} />
    </mesh>

      <RoundedBox args={[6.2, 1.12, 0.14]} radius={0.05} position={[0, 2.48, rearEdgeZ + 1.38]} castShadow>
        <meshStandardMaterial color="#f8fafc" roughness={0.52} />
      </RoundedBox>
      <Text position={[0, 2.6, rearEdgeZ + 1.5]} fontSize={0.22} color={accentColor} anchorX="center" maxWidth={5.2}>
        {`${getLotShortLabel(lotName)} • P2 A Zone`}
      </Text>

      <ServiceRoomBlock position={[serviceCoreX, 0, rearEdgeZ + 0.45]} label="CONTROL ROOM" />
      <BasementLobby position={[0.8, 0, rearEdgeZ + 0.18]} accentColor={accentColor} />

      <SecurityBooth position={[-width / 2 + 7.2, 0, frontEdgeZ + 1.65]} label="GUARD" />
      <BarrierGate position={[-width / 2 + 12.3, 0, -1.55]} label="ENTRY" open={false} />
      <BarrierGate position={[width / 2 - 11.2, 0, 1.55]} rotationY={Math.PI} label="EXIT" open />
      <WayfindingTotem position={[-width / 2 + 16.4, 0, frontEdgeZ + 1.9]} lotName={lotName} accentColor={accentColor} />

      <group position={[width / 2 - 5.7, 0, rearEdgeZ - 0.6]}>
        <mesh position={[0, 0.24, 0]} rotation={[0, 0, -0.18]} receiveShadow>
          <boxGeometry args={[6.6, 0.22, 4.3]} />
          <meshStandardMaterial color={nightMode ? "#475569" : "#cad5e1"} roughness={0.94} />
        </mesh>
        <mesh position={[1.2, 1.3, 1.32]} rotation={[0, -0.28, 0]}>
          <boxGeometry args={[1.28, 1.8, 0.12]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.76} metalness={0.12} />
        </mesh>
        <Text position={[1.16, 2.35, 1.36]} fontSize={0.14} color="#475569" anchorX="center">
          EXIT RAMP
        </Text>
      </group>

      <MotorbikeBay position={[bikeBayX, 0, rearEdgeZ - 1.15]} />

      <mesh position={[-width / 2 + 13.2, 0.06, -0.1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.4, 2.5]} />
        <meshBasicMaterial color="#fde68a" transparent opacity={0.32} />
      </mesh>
      {[-1.7, -0.85, 0, 0.85, 1.7].map((z) => (
        <mesh key={`entry-hatch-${z}`} position={[-width / 2 + 13.2, 0.07, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[5.5, 0.12]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
      ))}

      {[-width / 2 + 11.2, width / 2 - 12.8].map((x) => (
        <CctvRig key={`cctv-${x}`} position={[x, shellHeight - 0.66, frontEdgeZ + 0.55]} />
      ))}

      {[-width / 6, width / 6].map((x, index) => (
        <group key={`wall-sign-${x}`} position={[x, 1.46, rearEdgeZ + 1.23]}>
          <mesh>
            <boxGeometry args={[2.2, 0.48, 0.04]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.72} />
          </mesh>
          <Text position={[0, 0, 0.04]} fontSize={0.11} color={index === 0 ? "#16a34a" : accentColor} anchorX="center">
            {index === 0 ? "EXIT" : "MALL ACCESS"}
          </Text>
        </group>
      ))}
    </group>
  );
};

const PodiumParkingShell = ({
  width,
  depth,
  height,
  accentColor,
}: {
  width: number;
  depth: number;
  height: number;
  accentColor: string;
}) => (
  <group>
    <mesh position={[0, height, 0]} receiveShadow castShadow>
      <boxGeometry args={[width, 0.32, depth]} />
      <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.22} />
    </mesh>
    {[-depth / 2 + 0.32, depth / 2 - 0.32].map((z) => (
      <mesh key={`podium-guard-${z}`} position={[0, 1.42, z]} receiveShadow>
        <boxGeometry args={[width - 1.2, 0.95, 0.16]} />
        <meshStandardMaterial color="#475569" metalness={0.42} roughness={0.42} />
      </mesh>
    ))}
    {[-width / 2 + 0.5, width / 2 - 0.5].map((x) => (
      <mesh key={`podium-edge-${x}`} position={[x, 1.42, 0]} receiveShadow>
        <boxGeometry args={[0.16, 0.95, depth - 1.4]} />
        <meshStandardMaterial color="#475569" metalness={0.42} roughness={0.42} />
      </mesh>
    ))}
    {[-width / 3, 0, width / 3].map((x) => (
      <mesh key={`podium-light-${x}`} position={[x, height - 0.18, 0]}>
        <boxGeometry args={[2.1, 0.04, 0.18]} />
        <meshBasicMaterial color={accentColor} />
      </mesh>
    ))}
  </group>
);

const WayfindingTotem = ({ position, lotName, accentColor }: { position: [number, number, number]; lotName: string; accentColor: string }) => (
  <group position={position}>
    <mesh position={[0, 2.45, 0]} castShadow>
      <boxGeometry args={[0.36, 4.9, 0.36]} />
      <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.28} />
    </mesh>
    <RoundedBox args={[1.62, 2.28, 0.2]} radius={0.12} position={[0, 3.2, 0.18]} castShadow>
      <meshPhysicalMaterial color={PALETTE.white} roughness={0.22} metalness={0.08} />
    </RoundedBox>
    <Text position={[0, 4.02, 0.3]} fontSize={0.15} color="#0f172a" anchorX="center">
      SPOTACE
    </Text>
    <Text position={[0, 3.48, 0.3]} fontSize={0.22} color={accentColor} anchorX="center" maxWidth={1.2}>
      {getLotShortLabel(lotName)}
    </Text>
    <Text position={[0, 2.95, 0.3]} fontSize={0.11} color="#475569" anchorX="center" maxWidth={1.2}>
      SMART PARKING
    </Text>
  </group>
);

const PerimeterBuilding = ({ position, width, height, depth }: { position: [number, number, number]; width: number; height: number; depth: number }) => {
  const windowRows = Math.max(2, Math.floor(height / 2.6));
  const windowColumns = Math.max(3, Math.floor(width / 3.6));

  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={PALETTE.building} roughness={0.88} />
      </mesh>

      {Array.from({ length: windowRows }).flatMap((_, row) =>
        Array.from({ length: windowColumns }).map((__, column) => (
          <mesh
            key={`${width}-${row}-${column}`}
            position={[
              -width / 2 + 1.8 + column * ((width - 3.6) / Math.max(windowColumns - 1, 1)),
              1.4 + row * 2.1,
              depth / 2 + 0.02,
            ]}
          >
            <planeGeometry args={[1.24, 0.92]} />
            <meshBasicMaterial color={PALETTE.glass} transparent opacity={0.86} />
          </mesh>
        )),
      )}
    </group>
  );
};

const ParkingSceneLegacy = ({
  parkingLot,
  slots,
  selectedSlot,
  nightMode,
  profile,
  onSlotSelect,
}: {
  parkingLot: ParkingLot;
  slots: ParkingSlotModel[];
  selectedSlot: string | null;
  nightMode: boolean;
  profile: ParkingSceneProfile;
  onSlotSelect: (slotId: string) => void;
}) => {
  const columnCount = Math.max(1, Math.ceil(slots.length / 2));
  const lotSeed = getLotSeed(parkingLot.id);
  const isIndoor = profile.key === "mall_indoor";
  const slotSpacingX = isIndoor ? 4.85 : SLOT.spacingX;
  const bankOffset = isIndoor ? 9.1 : SLOT.bankOffsetZ;
  const laneWidth = isIndoor ? 7.2 : SLOT.laneWidth;
  const deckWidth = Math.max(isIndoor ? 54 : 30, columnCount * slotSpacingX + (isIndoor ? 18.5 : 7.2));
  const lotDepth = bankOffset * 2 + laneWidth + (isIndoor ? 10.2 : 12);
  const canopyWidth = columnCount * slotSpacingX + 2.2;
  const accentColor = parkingLot.available_spots > 0 ? profile.accentColor : PALETTE.occupied;
  const accessZoneX = -deckWidth / 2 + (isIndoor ? 10.4 : 7.4);
  const exitZoneX = deckWidth / 2 - (isIndoor ? 10.1 : 6.8);

  const slotOriginX = -((columnCount - 1) * slotSpacingX) / 2;
  const laneCenterZ = 0;
  const topBankZ = -bankOffset;
  const bottomBankZ = bankOffset;

  return (
    <>
      <color attach="background" args={[nightMode ? profile.backgroundNight : profile.backgroundDay]} />
      <fog attach="fog" args={[nightMode ? profile.fogNight : profile.fogDay, 35, 125]} />

      {profile.showSky && nightMode ? (
        <>
          <Stars radius={120} depth={55} count={2200} factor={4} saturation={0} />
          <ambientLight intensity={0.22} />
        </>
      ) : profile.showSky ? (
        <>
          <Sky sunPosition={[100, 35, 70]} turbidity={3.4} rayleigh={0.55} mieCoefficient={0.016} />
          <ambientLight intensity={0.62} />
        </>
      ) : (
        <>
          <ambientLight intensity={nightMode ? 0.34 : 0.58} />
          <pointLight position={[0, profile.shellHeight - 0.35, 0]} color="#f8fafc" intensity={nightMode ? 0.9 : 0.65} distance={32} />
        </>
      )}

      <Environment preset={nightMode ? profile.environmentNight : profile.environmentDay} />
      <hemisphereLight intensity={nightMode ? 0.25 : 0.48} color="#f8fafc" groundColor="#cbd5e1" />
      <directionalLight
        position={[26, 40, 22]}
        intensity={nightMode ? 0.45 : 1.45}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={120}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color={profile.showPlanters ? PALETTE.grass : "#d1d5db"} roughness={0.98} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[deckWidth + 13, lotDepth]} />
        {isIndoor ? (
          <meshStandardMaterial color={nightMode ? "#4b5563" : "#cfd8e3"} roughness={0.98} metalness={0.03} />
        ) : (
          <MeshReflectorMaterial
            blur={[250, 70]}
            resolution={512}
            mixBlur={0.9}
            mixStrength={nightMode ? 26 : 16}
            roughness={0.92}
            depthScale={0.2}
            minDepthThreshold={0.82}
            color={nightMode ? profile.deckNight : profile.deckDay}
            metalness={0.08}
            mirror={nightMode ? 0.18 : 0.06}
          />
        )}
      </mesh>

      <mesh position={[0, 0.15, -lotDepth / 2 + 2]} receiveShadow>
        <boxGeometry args={[deckWidth + 13, 0.2, 3.6]} />
        <meshStandardMaterial color={PALETTE.concrete} roughness={0.94} />
      </mesh>
      <mesh position={[0, 0.15, lotDepth / 2 - 2]} receiveShadow>
        <boxGeometry args={[deckWidth + 13, 0.2, 3.6]} />
        <meshStandardMaterial color={PALETTE.concrete} roughness={0.94} />
      </mesh>

      <mesh position={[0, 0.12, laneCenterZ]} receiveShadow>
        <boxGeometry args={[deckWidth + 2.8, 0.14, laneWidth]} />
        <meshStandardMaterial
          color={isIndoor ? (nightMode ? "#374151" : "#8b97a8") : nightMode ? profile.laneNight : profile.laneDay}
          roughness={0.96}
        />
      </mesh>

      {Array.from({ length: 6 }).map((_, index) => (
        <mesh key={`dash-${index}`} position={[-deckWidth / 2 + 4 + index * ((deckWidth - 8) / 5), 0.2, laneCenterZ]} receiveShadow>
          <boxGeometry args={[2.2, 0.02, 0.14]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      ))}

      {[-deckWidth / 4, deckWidth / 4].map((x) => (
        <Text key={`arrow-${x}`} position={[x, 0.24, laneCenterZ]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.95} color="#f8fafc">
          →
        </Text>
      ))}

      <mesh position={[-deckWidth / 2 + 5.2, 0.18, laneCenterZ]} receiveShadow>
        <boxGeometry args={[2.8, 0.03, laneWidth - 1.2]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      {[-1.9, -0.7, 0.5, 1.7].map((z) => (
        <mesh key={`cross-${z}`} position={[-deckWidth / 2 + 5.2, 0.2, z]} receiveShadow>
          <boxGeometry args={[2.1, 0.03, 0.26]} />
          <meshStandardMaterial color={nightMode ? profile.deckNight : profile.deckDay} />
        </mesh>
      ))}

      {!isIndoor && <ParkingCanopy position={[0, 0, topBankZ]} width={canopyWidth} depth={7.4} accentColor={accentColor} roofStyle={profile.roofStyle} />}
      {!isIndoor && <ParkingCanopy position={[0, 0, bottomBankZ]} width={canopyWidth} depth={7.4} accentColor={accentColor} roofStyle={profile.roofStyle} />}

      {profile.key === "mall_indoor" && <IndoorParkingShell width={deckWidth + 16} depth={lotDepth + 5.5} height={profile.shellHeight} />}
      {profile.key === "mall_indoor" && (
        <IndoorParkingContext
          width={deckWidth + 12}
          depth={lotDepth + 4}
          laneWidth={laneWidth}
          shellHeight={profile.shellHeight}
          accentColor={accentColor}
          nightMode={nightMode}
          lotName={parkingLot.name}
        />
      )}
      {profile.key === "tower_podium" && (
        <PodiumParkingShell width={deckWidth + 15} depth={lotDepth + 6.2} height={profile.shellHeight} accentColor={accentColor} />
      )}

      <group>
        {slots.map((slot, index) => {
          const z = slot.row === 0 ? topBankZ : bottomBankZ;
          const rotationY = slot.row === 0 ? 0 : Math.PI;
          const position: [number, number, number] = [slotOriginX + slot.column * slotSpacingX, 0, z];

          return (
            <ParkingSlot
              key={slot.id}
              slot={slot}
              index={index}
              lotSeed={lotSeed}
              position={position}
              rotationY={rotationY}
              selectedSlot={selectedSlot}
              onSelect={() => onSlotSelect(slot.id)}
            />
          );
        })}
      </group>

      <ParkingTwinAutomationBridge
        parkingLot={parkingLot}
        slots={slots}
        slotOriginX={slotOriginX}
        slotSpacingX={slotSpacingX}
        topBankZ={topBankZ}
        bottomBankZ={bottomBankZ}
        onSlotSelect={onSlotSelect}
      />

      {!isIndoor && (
        <>

      <SecurityBooth position={[-deckWidth / 2 - 3.8, 0, -2.2]} label="Giám sát 24/7" />
      <BarrierGate position={[-deckWidth / 2 - 0.9, 0, -1.55]} label="Lối vào" open={false} />
      <BarrierGate position={[deckWidth / 2 + 0.9, 0, 1.55]} rotationY={Math.PI} label="Lối ra" open />
      <WayfindingTotem position={[-deckWidth / 2 - 7.1, 0, 8.7]} lotName={parkingLot.name} accentColor={accentColor} />

        </>
      )}

      {profile.showPlanters && <PlanterIsland position={[0, 0, -lotDepth / 2 + 1.95]} width={deckWidth + 8.8} />}
      {profile.showPlanters && <PlanterIsland position={[0, 0, lotDepth / 2 - 1.95]} width={deckWidth + 8.8} />}

      {!isIndoor &&
        [-deckWidth / 2 + 4, 0, deckWidth / 2 - 4].map((x) => (
          <LampPost key={`lamp-top-${x}`} position={[x, 0, -lotDepth / 2 + 5.5]} nightMode={nightMode} />
        ))}
      {!isIndoor &&
        [-deckWidth / 2 + 4, 0, deckWidth / 2 - 4].map((x) => (
          <LampPost key={`lamp-bottom-${x}`} position={[x, 0, lotDepth / 2 - 5.5]} nightMode={nightMode} />
        ))}

      {profile.showPerimeterBuildings && (
        <>
          <PerimeterBuilding position={[-deckWidth / 2 - 18, 0, -lotDepth / 2 + 11]} width={14} height={13} depth={12} />
          <PerimeterBuilding position={[0, 0, -lotDepth / 2 + 9.5]} width={24} height={18} depth={10} />
          <PerimeterBuilding position={[deckWidth / 2 + 18, 0, -lotDepth / 2 + 12]} width={16} height={12} depth={11} />
        </>
      )}

      {[
        [-canopyWidth / 3, 0.04, -0.6, [1.15, 0.42, 0.7], 0.3],
        [0.12, 0.04, 0.55, [1.45, 0.55, 0.9], -0.45],
        [canopyWidth / 3 - 0.45, 0.04, 1.15, [1.05, 0.38, 0.68], 0.2],
      ].map((mark, index) => (
        <OilMark
          key={`oil-mark-${index}`}
          position={[mark[0] as number, mark[1] as number, mark[2] as number]}
          scale={mark[3] as [number, number, number]}
          rotation={mark[4] as number}
        />
      ))}

      {isIndoor && (
        <>
          <SecurityBooth position={[accessZoneX - 2.8, 0, -lotDepth / 2 + 5.4]} label="Giám sát 24/7" />
          <BarrierGate position={[accessZoneX + 0.8, 0, -1.4]} label="Lối vào" open={false} />
          <BarrierGate position={[exitZoneX - 0.6, 0, 1.4]} rotationY={Math.PI} label="Lối ra" open />
          <WayfindingTotem position={[accessZoneX - 5.2, 0, lotDepth / 2 - 5.4]} lotName={parkingLot.name} accentColor={accentColor} />
          {[-deckWidth / 2 + 6, 0, deckWidth / 2 - 6].map((x) => (
            <group key={`indoor-light-strip-${x}`} position={[x, profile.shellHeight - 0.54, -lotDepth * 0.1]}>
              <mesh>
                <boxGeometry args={[2.6, 0.05, 0.24]} />
                <meshBasicMaterial color="#f8fafc" />
              </mesh>
              <pointLight position={[0, -0.18, 0]} color="#f8fafc" intensity={nightMode ? 0.75 : 0.38} distance={10} />
            </group>
          ))}
        </>
      )}

      {!isIndoor && (
        <Float speed={1.15} rotationIntensity={0.04} floatIntensity={0.12}>
          <Html position={[0, 6.2, -lotDepth / 2 + 7]} center>
            <div className="rounded-full border border-white/70 bg-white/92 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.34em] text-slate-700 shadow-xl">
              {profile.label}
            </div>
          </Html>
        </Float>
      )}

      <Sparkles
        count={nightMode ? 70 : profile.showSky ? 18 : 10}
        scale={[deckWidth + 10, 10, lotDepth - 10]}
        position={[0, 3.6, 0]}
        size={nightMode ? 2.1 : 1.2}
        speed={0.12}
        color={nightMode ? "#93c5fd" : "#f8fafc"}
      />

      <ContactShadows position={[0, 0.02, 0]} opacity={0.3} scale={deckWidth + 16} blur={2.6} far={30} />
    </>
  );
};

const ParkingScene = ({
  parkingLot,
  slots,
  selectedSlot,
  nightMode,
  profile,
  onSlotSelect,
}: {
  parkingLot: ParkingLot;
  slots: ParkingSlotModel[];
  selectedSlot: string | null;
  nightMode: boolean;
  profile: ParkingSceneProfile;
  onSlotSelect: (slotId: string) => void;
}) => {
  const columnCount = Math.max(1, Math.ceil(slots.length / 2));
  const lotSeed = getLotSeed(parkingLot.id);
  const slotSpacingX = 4.25;
  const bankOffset = 10.4;
  const laneWidth = 8.8;
  const deckWidth = Math.max(64, columnCount * slotSpacingX + 20);
  const lotDepth = bankOffset * 2 + laneWidth + 22;
  const yardWidth = deckWidth + 18;
  const accentColor = parkingLot.available_spots > 0 ? profile.accentColor : PALETTE.occupied;
  const frontStreetZ = lotDepth / 2 + 8.2;
  const frontSidewalkZ = lotDepth / 2 + 2.2;
  const backServiceZ = -lotDepth / 2 - 4.4;

  const slotOriginX = -((columnCount - 1) * slotSpacingX) / 2;
  const laneCenterZ = 0;
  const topBankZ = -bankOffset;
  const bottomBankZ = bankOffset;
  const [asphaltMap, concreteMap] = useTexture([
    "/textures/parking-shared/asphalt.svg",
    "/textures/parking-shared/concrete.svg",
  ]);

  useEffect(() => {
    configureRepeatedTexture(asphaltMap, 18, 18);
    configureRepeatedTexture(concreteMap, 12, 12);
  }, [asphaltMap, concreteMap]);

  return (
    <>
      <color attach="background" args={[nightMode ? profile.backgroundNight : profile.backgroundDay]} />
      <fog attach="fog" args={[nightMode ? profile.fogNight : profile.fogDay, nightMode ? 90 : 220, nightMode ? 230 : 420]} />

      {nightMode ? (
        <>
          <Stars radius={120} depth={55} count={2200} factor={4} saturation={0} />
          <ambientLight intensity={0.24} />
        </>
      ) : (
        <>
          <Sky sunPosition={[100, 35, 70]} turbidity={1.15} rayleigh={0.28} mieCoefficient={0.0025} />
          <ambientLight intensity={0.74} />
        </>
      )}

      <Environment preset={nightMode ? "night" : "city"} />
      <hemisphereLight intensity={nightMode ? 0.28 : 0.52} color="#f8fafc" groundColor="#cbd5e1" />
      <directionalLight
        position={[26, 40, 22]}
        intensity={nightMode ? 0.45 : 1.45}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={120}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} receiveShadow>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial color="#bcd39b" roughness={0.98} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[yardWidth, lotDepth + 10]} />
        <MeshReflectorMaterial
          map={asphaltMap}
          blur={[250, 70]}
          resolution={512}
          mixBlur={0.62}
          mixStrength={nightMode ? 10 : 4}
          roughness={0.96}
          depthScale={0.14}
          minDepthThreshold={0.82}
          color={nightMode ? "#334155" : "#4b5563"}
          metalness={0.06}
          mirror={nightMode ? 0.03 : 0.006}
        />
      </mesh>

      <mesh position={[0, 0.14, frontStreetZ]} receiveShadow>
        <boxGeometry args={[yardWidth + 28, 0.16, 11]} />
        <meshStandardMaterial map={asphaltMap} color={nightMode ? "#243244" : "#3f4752"} roughness={0.96} />
      </mesh>

      <mesh position={[0, 0.16, frontSidewalkZ]} receiveShadow>
        <boxGeometry args={[yardWidth + 18, 0.22, 3.8]} />
        <meshStandardMaterial map={concreteMap} color="#dfe7ef" roughness={0.98} />
      </mesh>

      <mesh position={[0, 0.14, backServiceZ]} receiveShadow>
        <boxGeometry args={[yardWidth + 16, 0.16, 6.2]} />
        <meshStandardMaterial map={asphaltMap} color={nightMode ? "#2b3644" : "#525d68"} roughness={0.97} />
      </mesh>

      <mesh position={[0, 0.12, laneCenterZ]} receiveShadow>
        <boxGeometry args={[deckWidth + 7.8, 0.16, laneWidth]} />
        <meshStandardMaterial map={asphaltMap} color={nightMode ? "#243244" : "#55606c"} roughness={0.96} />
      </mesh>

      <mesh position={[0, 0.12, topBankZ]} receiveShadow>
        <boxGeometry args={[deckWidth + 7.8, 0.16, 6.8]} />
        <meshStandardMaterial map={asphaltMap} color={nightMode ? "#39424d" : "#707b88"} roughness={0.97} />
      </mesh>
      <mesh position={[0, 0.12, bottomBankZ]} receiveShadow>
        <boxGeometry args={[deckWidth + 7.8, 0.16, 6.8]} />
        <meshStandardMaterial map={asphaltMap} color={nightMode ? "#39424d" : "#707b88"} roughness={0.97} />
      </mesh>

      {[-deckWidth / 2 + 6.2, deckWidth / 2 - 6.2].map((x, index) => (
        <group key={`zone-mark-${x}`}>
          <mesh position={[x, 0.13, topBankZ]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.4, 5.2]} />
            <meshBasicMaterial color={index === 0 ? "#0f172a" : "#334155"} transparent opacity={0.08} />
          </mesh>
          <mesh position={[x, 0.13, bottomBankZ]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.4, 5.2]} />
            <meshBasicMaterial color={index === 0 ? "#0f172a" : "#334155"} transparent opacity={0.08} />
          </mesh>
        </group>
      ))}
      {[-2.1, 2.1].map((offset) => (
        <group key={`bank-seam-${offset}`}>
          <mesh position={[0, 0.14, topBankZ + offset]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[deckWidth + 6.4, 0.12]} />
            <meshBasicMaterial color="#0f172a" transparent opacity={0.09} />
          </mesh>
          <mesh position={[0, 0.14, bottomBankZ + offset]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[deckWidth + 6.4, 0.12]} />
            <meshBasicMaterial color="#0f172a" transparent opacity={0.09} />
          </mesh>
        </group>
      ))}
      <Text
        position={[-deckWidth / 2 + 5.6, 0.14, topBankZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.9}
        color="#f8fafc"
        anchorX="center"
        outlineWidth={0.02}
        outlineColor="#0f172a"
      >
        A ZONE
      </Text>
      <Text
        position={[-deckWidth / 2 + 5.6, 0.14, bottomBankZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.9}
        color="#f8fafc"
        anchorX="center"
        outlineWidth={0.02}
        outlineColor="#0f172a"
      >
        B ZONE
      </Text>

      {Array.from({ length: 6 }).map((_, index) => (
        <mesh key={`dash-${index}`} position={[-deckWidth / 2 + 6 + index * ((deckWidth - 12) / 5), 0.2, laneCenterZ]} receiveShadow>
          <boxGeometry args={[2.6, 0.02, 0.16]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      ))}

      {[-deckWidth / 4, deckWidth / 4].map((x) => (
        <Text key={`arrow-${x}`} position={[x, 0.24, laneCenterZ]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.95} color="#f8fafc">
          {"->"}
        </Text>
      ))}

      {[-3.2, -1.4, 0.4, 2.2].map((z) => (
        <mesh key={`entry-cross-${z}`} position={[-deckWidth / 2 + 10.2, 0.18, frontSidewalkZ + z * 0.18]} receiveShadow>
          <boxGeometry args={[2.8, 0.03, 0.32]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      ))}

      <group>
        {slots.map((slot, index) => {
          const z = slot.row === 0 ? topBankZ : bottomBankZ;
          const rotationY = slot.row === 0 ? 0 : Math.PI;
          const position: [number, number, number] = [slotOriginX + slot.column * slotSpacingX, 0, z];

          return (
            <ParkingSlot
              key={slot.id}
              slot={slot}
              index={index}
              lotSeed={lotSeed}
              position={position}
              rotationY={rotationY}
              selectedSlot={selectedSlot}
              onSelect={() => onSlotSelect(slot.id)}
            />
          );
        })}
      </group>

      <ParkingTwinAutomationBridge
        parkingLot={parkingLot}
        slots={slots}
        slotOriginX={slotOriginX}
        slotSpacingX={slotSpacingX}
        topBankZ={topBankZ}
        bottomBankZ={bottomBankZ}
        onSlotSelect={onSlotSelect}
      />

      <UrbanParkingContext
        width={deckWidth + 8}
        depth={lotDepth}
        laneWidth={laneWidth}
        accentColor={accentColor}
        nightMode={nightMode}
        lotName={parkingLot.name}
        lotSeed={lotSeed}
      />

      <PlanterIsland position={[0, 0, frontSidewalkZ + 1.9]} width={deckWidth + 8.8} />
      <PlanterIsland position={[0, 0, backServiceZ + 2.8]} width={deckWidth + 4.2} />

      {[
        [-deckWidth / 3, 0.04, -0.8, [1.2, 0.42, 0.74], 0.32],
        [0.4, 0.04, 0.7, [1.5, 0.56, 0.92], -0.42],
        [deckWidth / 3 - 0.8, 0.04, 1.35, [1.1, 0.42, 0.7], 0.18],
        [-deckWidth / 2 + 12, 0.04, frontStreetZ - 0.8, [1.4, 0.4, 0.82], 0.12],
      ].map((mark, index) => (
        <OilMark
          key={`oil-mark-${index}`}
          position={[mark[0] as number, mark[1] as number, mark[2] as number]}
          scale={mark[3] as [number, number, number]}
          rotation={mark[4] as number}
        />
      ))}

      <Float speed={1.1} rotationIntensity={0.03} floatIntensity={0.1}>
        <Html position={[0, 6.6, backServiceZ + 4.4]} center>
          <div className="rounded-full border border-white/70 bg-white/92 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-700 shadow-xl">
            {profile.label}
          </div>
        </Html>
      </Float>

      {nightMode && (
        <Sparkles
          count={40}
          scale={[deckWidth + 18, 10, lotDepth + 8]}
          position={[0, 4.2, 0]}
          size={1.5}
          speed={0.08}
          color="#93c5fd"
        />
      )}

      <ContactShadows position={[0, 0.02, 0]} opacity={0.32} scale={deckWidth + 24} blur={2.6} far={36} />
    </>
  );
};

const ParkingTwinAutomationBridge = ({
  parkingLot,
  slots,
  slotOriginX,
  slotSpacingX,
  topBankZ,
  bottomBankZ,
  onSlotSelect,
}: {
  parkingLot: ParkingLot;
  slots: ParkingSlotModel[];
  slotOriginX: number;
  slotSpacingX: number;
  topBankZ: number;
  bottomBankZ: number;
  onSlotSelect: (slotId: string) => void;
}) => {
  const { camera, size } = useThree();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const availableSlots = slots.filter((slot) => slot.status === "free");
    const screenPoints = availableSlots
      .map((slot) => {
        const world = new THREE.Vector3(
          slotOriginX + slot.column * slotSpacingX,
          0.22,
          slot.row === 0 ? topBankZ : bottomBankZ,
        );
        const projected = world.clone().project(camera);

        return {
          id: slot.id,
          x: (projected.x * 0.5 + 0.5) * size.width,
          y: (-projected.y * 0.5 + 0.5) * size.height,
        } satisfies ParkingTwinScreenPoint;
      })
      .filter(
        (point) =>
          Number.isFinite(point.x) &&
          Number.isFinite(point.y) &&
          point.x >= 0 &&
          point.x <= size.width &&
          point.y >= 0 &&
          point.y <= size.height,
      );

    const bookSlot = (slotId: string) => {
      const target = availableSlots.find((slot) => slot.id === slotId);
      if (!target) {
        return null;
      }

      onSlotSelect(target.id);
      return target.id;
    };

    window.__spotAceParkingTwin = {
      lotId: String(parkingLot.id),
      availableSlots: availableSlots.map((slot) => slot.id),
      screenPoints,
      bookSlot,
      bookFirstAvailable: () => {
        const first = availableSlots[0];
        if (!first) {
          return null;
        }

        onSlotSelect(first.id);
        return first.id;
      },
    };

    return () => {
      if (window.__spotAceParkingTwin?.lotId === String(parkingLot.id)) {
        delete window.__spotAceParkingTwin;
      }
    };
  }, [bottomBankZ, camera, onSlotSelect, parkingLot.id, size.height, size.width, slotOriginX, slotSpacingX, slots, topBankZ]);

  return null;
};

const ParkingCameraController = ({
  preset,
  controlsRef,
  resetToken,
}: {
  preset: {
    position: [number, number, number];
    target: [number, number, number];
    fov: number;
    minDistance: number;
    maxDistance: number;
    minPolarAngle: number;
    maxPolarAngle: number;
    maxAzimuthAngle: number;
  };
  controlsRef: React.RefObject<any>;
  resetToken: number;
}) => {
  const { camera } = useThree();
  useEffect(() => {
    camera.fov = preset.fov;
    camera.position.set(...preset.position);
    camera.up.set(0, 1, 0);
    camera.updateProjectionMatrix();
    if (controlsRef.current) {
      controlsRef.current.enableRotate = true;
      controlsRef.current.enablePan = true;
      controlsRef.current.enableZoom = true;
      controlsRef.current.target.set(...preset.target);
      controlsRef.current.minDistance = preset.minDistance;
      controlsRef.current.maxDistance = preset.maxDistance;
      controlsRef.current.minPolarAngle = preset.minPolarAngle;
      controlsRef.current.maxPolarAngle = preset.maxPolarAngle;
      controlsRef.current.minAzimuthAngle = -Infinity;
      controlsRef.current.maxAzimuthAngle = Infinity;
      controlsRef.current.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      };
      controlsRef.current.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      };
      controlsRef.current.update();
    }
  }, [camera, controlsRef, resetToken]);

  return null;
};

const Parking3DView = ({
  parkingLot,
  onBook,
  className,
}: {
  parkingLot: ParkingLot;
  onBook: (id: string) => void;
  className?: string;
}) => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isNightMode, setIsNightMode] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [cameraMode, setCameraMode] = useState<ParkingCameraMode>("arrival");
  const [cameraResetToken, setCameraResetToken] = useState(0);
  const controlsRef = useRef<any>(null);
  const sceneProfile = useMemo(() => deriveParkingSceneProfile(parkingLot), [parkingLot]);

  const slots = useMemo(() => {
    const actualTotal = Math.max(12, parkingLot.total_spots || 24);
    const total = getVisualSlotCount(parkingLot, sceneProfile.key);
    const actualAvailable = clamp(parkingLot.available_spots ?? Math.ceil(actualTotal * 0.35), 0, actualTotal);
    const availabilityRatio = actualTotal > 0 ? actualAvailable / actualTotal : 0.35;
    const availableCount = clamp(Math.round(total * availabilityRatio), actualAvailable > 0 ? 1 : 0, total);
    const seed = getLotSeed(parkingLot.id);
    const columnCount = Math.ceil(total / 2);

    const rankedIndexes = Array.from({ length: total }, (_, index) => ({
      index,
      score: seeded(seed, index + 1),
    })).sort((left, right) => right.score - left.score);

    const freeIndexes = new Set(rankedIndexes.slice(0, availableCount).map((item) => item.index));

    const evCount = Math.min(4, Math.max(2, Math.round(total * 0.12)));
    const vipCount = Math.min(4, Math.max(2, Math.round(total * 0.08)));
    const handicapIndex = clamp(Math.floor(columnCount / 2), 0, total - 1);

    return Array.from({ length: total }, (_, index) => {
      const row = Math.floor(index / columnCount);
      const column = index % columnCount;
      const code = getParkingSlotCode(row, column);
      let type: SlotType = "normal";

      if (index < evCount) {
        type = "ev";
      } else if (index >= columnCount && index < columnCount + vipCount) {
        type = "vip";
      } else if (index === handicapIndex) {
        type = "handicap";
      }

      return {
        id: code,
        code,
        status: freeIndexes.has(index) ? "free" : "occupied",
        type,
        row,
        column,
      } satisfies ParkingSlotModel;
    });
  }, [parkingLot, sceneProfile.key]);

  const stats = useMemo(
    () => ({
      total: Math.max(12, parkingLot.total_spots || slots.length),
      available: clamp(parkingLot.available_spots ?? slots.filter((slot) => slot.status === "free").length, 0, Math.max(12, parkingLot.total_spots || slots.length)),
      occupied: Math.max(0, Math.max(12, parkingLot.total_spots || slots.length) - clamp(parkingLot.available_spots ?? slots.filter((slot) => slot.status === "free").length, 0, Math.max(12, parkingLot.total_spots || slots.length))),
      ev: slots.filter((slot) => slot.type === "ev" && slot.status === "free").length,
    }),
    [parkingLot.available_spots, parkingLot.total_spots, slots],
  );

  const cameraPresets = useMemo(() => {
    const columnCount = Math.ceil(slots.length / 2);
    const arrivalPosition: [number, number, number] = [
      clamp(-15.5 - columnCount * 0.14, -20, -15.5),
      clamp(5.6 + columnCount * 0.03, 5.6, 7.6),
      clamp(13.8 + columnCount * 0.16, 13.8, 18.4),
    ];

    return {
      arrival: {
        position: arrivalPosition,
        fov: 48,
        minDistance: 6,
        maxDistance: 220,
        target: [0, 0.34, 0] as [number, number, number],
        minPolarAngle: 0.12,
        maxPolarAngle: 2.55,
        maxAzimuthAngle: Math.PI * 2,
      },
      booking: {
        position: arrivalPosition,
        fov: 48,
        minDistance: 6,
        maxDistance: 220,
        target: [0, 0.34, 0] as [number, number, number],
        minPolarAngle: 0.12,
        maxPolarAngle: 2.55,
        maxAzimuthAngle: Math.PI * 2,
      },
    };
  }, [slots.length]);

  const canvasCamera = useMemo(
    () => ({
      position: [...cameraPresets.arrival.position] as [number, number, number],
      fov: cameraPresets.arrival.fov,
    }),
    [cameraPresets],
  );

  useEffect(() => {
    setCameraMode("arrival");
    setCameraResetToken((value) => value + 1);
  }, [parkingLot.id, sceneProfile.key]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const availableSlots = slots.filter((slot) => slot.status === "free");
    const bookSlot = (slotId: string) => {
      const target = availableSlots.find((slot) => slot.id === slotId);
      if (!target) {
        return null;
      }

      setSelectedSlot(target.id);
      onBook(target.id);
      return target.id;
    };

    window.__spotAceParkingTwin = {
      ...(window.__spotAceParkingTwin || {}),
      lotId: String(parkingLot.id),
      availableSlots: availableSlots.map((slot) => slot.id),
      screenPoints: window.__spotAceParkingTwin?.screenPoints || [],
      bookSlot,
      bookFirstAvailable: () => {
        const first = availableSlots[0];
        if (!first) {
          return null;
        }

        setSelectedSlot(first.id);
        onBook(first.id);
        return first.id;
      },
    };

    return () => {
      if (window.__spotAceParkingTwin?.lotId === String(parkingLot.id)) {
        delete window.__spotAceParkingTwin;
      }
    };
  }, [onBook, parkingLot.id, slots]);

  return (
    <div
      className={cn("relative h-[750px] w-full overflow-hidden rounded-3xl bg-gradient-to-b from-sky-100 via-slate-100 to-slate-200", className)}
      onContextMenu={(event) => event.preventDefault()}
      style={{ touchAction: "none" }}
    >
      {sceneProfile.key === "mall_indoor" && (
        <motion.div
          initial={{ x: -16, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="absolute left-4 top-4 z-10 rounded-full border border-white/60 bg-white/88 px-4 py-2 shadow-xl backdrop-blur-xl"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <CarIcon className="h-4 w-4 text-blue-600" />
            <span>{parkingLot.name}</span>
            <span className="text-slate-400">•</span>
            <span>{stats.available}/{stats.total}</span>
          </div>
        </motion.div>
      )}
      {sceneProfile.key !== "mall_indoor" && (
      <motion.div
        initial={{ x: -24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute left-4 top-4 z-10 max-w-[220px] rounded-3xl border border-white/55 bg-white/88 p-3 shadow-2xl backdrop-blur-xl"
      >
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-slate-900 shadow-lg">
            <CarIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="max-w-[170px] text-base font-black leading-tight text-slate-900">{parkingLot.name}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-blue-500" />
                Secure Zone
              </span>
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-emerald-500" />
                {sceneProfile.surfaceLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-slate-200 bg-white text-[10px] text-slate-600">
            <Thermometer className="mr-1 h-3 w-3 text-rose-500" />
            28°C
          </Badge>
          <Badge variant="outline" className="border-slate-200 bg-white text-[10px] text-slate-600">
            <Wind className="mr-1 h-3 w-3 text-sky-500" />
            12km/h
          </Badge>
        </div>
      </motion.div>
      )}

      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ x: 28, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 28, opacity: 0 }}
            className="absolute right-4 top-4 z-10 rounded-3xl border border-white/55 bg-white/88 p-3 shadow-2xl backdrop-blur-xl"
          >
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-emerald-50 p-3 text-center">
                <div className="text-2xl font-black text-emerald-600">{stats.available}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-700">Trống</div>
              </div>
              <div className="rounded-2xl bg-slate-100 p-3 text-center">
                <div className="text-2xl font-black text-slate-900">{stats.total}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">Tổng</div>
              </div>
              <div className="rounded-2xl bg-rose-50 p-3 text-center">
                <div className="text-xl font-black text-rose-600">{stats.occupied}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-rose-600">Đã đỗ</div>
              </div>
              <div className="rounded-2xl bg-violet-50 p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-xl font-black text-violet-600">
                  <Zap className="h-4 w-4" />
                  {stats.ev}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-violet-600">EV Free</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-4 left-4 z-10 max-w-[320px] rounded-2xl border border-white/55 bg-white/88 px-3 py-2 shadow-xl backdrop-blur-xl">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] font-medium text-slate-700">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm" />
            Ô trống
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500 shadow-sm" />
            Có xe
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-violet-500 shadow-sm" />
            EV
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-500 shadow-sm" />
            VIP
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-cyan-500 shadow-sm" />
            Handicap
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-500 shadow-sm" />
            Đang chọn
          </span>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
        <div className="hidden rounded-2xl border border-white/60 bg-white/92 p-1 shadow-lg backdrop-blur-xl">
          <Button
            variant={cameraMode === "booking" ? "default" : "ghost"}
            size="sm"
            className={cn("h-9 rounded-xl", cameraMode === "booking" ? "bg-slate-900 text-white hover:bg-slate-900" : "text-slate-700")}
            onClick={() => setCameraMode("booking")}
          >
            Gần ô đỗ
          </Button>
          <Button
            variant={cameraMode === "arrival" ? "default" : "ghost"}
            size="sm"
            className={cn("h-9 rounded-xl", cameraMode === "arrival" ? "bg-slate-900 text-white hover:bg-slate-900" : "text-slate-700")}
            onClick={() => setCameraMode("arrival")}
          >
            Toàn cảnh
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-white/60 bg-white/92 shadow-lg backdrop-blur-xl hover:bg-white"
          onClick={() => setShowStats((value) => !value)}
        >
          <Eye className="mr-1 h-4 w-4" />
          {showStats ? "Ẩn" : "Hiện"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-white/60 bg-white/92 shadow-lg backdrop-blur-xl hover:bg-white"
          onClick={() => setIsNightMode((value) => !value)}
        >
          {isNightMode ? <Sun className="mr-1 h-4 w-4" /> : <Moon className="mr-1 h-4 w-4" />}
          {isNightMode ? "Ngày" : "Đêm"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-white/60 bg-white/92 shadow-lg backdrop-blur-xl hover:bg-white"
          onClick={() => {
            setSelectedSlot(null);
            setCameraMode("arrival");
            setCameraResetToken((value) => value + 1);
          }}
        >
          <RotateCcw className="mr-1 h-4 w-4" />
          Reset
        </Button>
      </div>

      <Canvas shadows dpr={[1, 1.8]} camera={canvasCamera}>
        <ParkingCameraController preset={cameraPresets[cameraMode]} controlsRef={controlsRef} resetToken={cameraResetToken} />
        <ParkingScene
          parkingLot={parkingLot}
          slots={slots}
          selectedSlot={selectedSlot}
          nightMode={isNightMode}
          profile={sceneProfile}
          onSlotSelect={(slotId) => {
            setSelectedSlot(slotId);
            onBook(slotId);
          }}
        />
        <OrbitControls
          ref={controlsRef}
          enablePan
          enableZoom
          enableRotate
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={1.18}
          zoomSpeed={0.95}
          panSpeed={1}
          screenSpacePanning={false}
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
          }}
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN,
          }}
          makeDefault
        />
      </Canvas>
    </div>
  );
};

export default Parking3DView;
