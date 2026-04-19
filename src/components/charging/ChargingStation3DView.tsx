import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  Html,
  MeshReflectorMaterial,
  OrbitControls,
  RoundedBox,
  Sparkles,
  Text,
} from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { ChargingConnector, ChargingStation } from "@/features/charging/types";

const CONNECTORS_PER_ROW = 4;
const BAY_SPACING_X = 2.6;
const BAY_SPACING_Z = 3.3;

const STATUS_COLOR = {
  available: "#22c55e",
  charging: "#0ea5e9",
  maintenance: "#f59e0b",
} satisfies Record<ChargingConnector["status"], string>;

const VEHICLE_PALETTE = ["#0f172a", "#1d4ed8", "#475569", "#7c3aed", "#0f766e", "#111827"];

const getAmenityLabel = (station: ChargingStation) => {
  if (station.amenities.some((amenity) => amenity.toLowerCase().includes("coffee"))) {
    return "COFFEE";
  }

  if (station.amenities.some((amenity) => amenity.toLowerCase().includes("lounge"))) {
    return "LOUNGE";
  }

  if (station.amenities.some((amenity) => amenity.toLowerCase().includes("rest"))) {
    return "REST";
  }

  if (station.amenities.some((amenity) => amenity.toLowerCase().includes("solar"))) {
    return "SOLAR";
  }

  return "EV HUB";
};

const getShortStationLabel = (station: ChargingStation) =>
  station.name
    .replace("SpotAce", "")
    .replace("Station", "")
    .replace("Charge Point", "")
    .trim()
    .split(" ")
    .slice(0, 2)
    .join(" ")
    .toUpperCase();

const ConnectorCable = ({
  start,
  end,
  color,
}: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
}) => {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...start),
      new THREE.Vector3(start[0], start[1] + 0.3, start[2] + 0.2),
      new THREE.Vector3(end[0], end[1] + 0.15, end[2] - 0.25),
      new THREE.Vector3(...end),
    ]);

    return new THREE.TubeGeometry(curve, 28, 0.035, 12, false);
  }, [end, start]);

  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial color="#111827" roughness={0.85} metalness={0.2} emissive={color} emissiveIntensity={0.25} />
    </mesh>
  );
};

const SafetyCone = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh castShadow position={[0, 0.15, 0]}>
      <cylinderGeometry args={[0.18, 0.05, 0.3, 16]} />
      <meshStandardMaterial color="#f97316" roughness={0.65} />
    </mesh>
    <mesh position={[0, 0.05, 0]} receiveShadow>
      <cylinderGeometry args={[0.22, 0.22, 0.06, 16]} />
      <meshStandardMaterial color="#111827" roughness={0.95} />
    </mesh>
  </group>
);

const ChargerPedestal = ({
  connector,
  accentColor,
}: {
  connector: ChargingConnector;
  accentColor: string;
}) => {
  const pulseLightRef = useRef<THREE.PointLight | null>(null);
  const glowColor = connector.status === "charging" ? accentColor : STATUS_COLOR[connector.status];

  useFrame((state) => {
    if (pulseLightRef.current) {
      pulseLightRef.current.intensity = connector.status === "charging" ? 1.3 + Math.sin(state.clock.elapsedTime * 3) * 0.35 : 0.55;
    }
  });

  return (
    <group position={[0, 0, -1.12]}>
      <RoundedBox args={[0.84, 0.12, 1.4]} radius={0.08} position={[0, 0.06, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#dbe4ef" roughness={0.95} />
      </RoundedBox>

      <RoundedBox args={[0.56, 2.45, 0.48]} radius={0.08} position={[0, 1.26, 0]} castShadow>
        <meshPhysicalMaterial color="#0f172a" metalness={0.85} roughness={0.18} clearcoat={1} clearcoatRoughness={0.12} />
      </RoundedBox>

      <RoundedBox args={[0.34, 0.34, 0.05]} radius={0.02} position={[0, 1.92, 0.245]}>
        <meshBasicMaterial color={glowColor} />
      </RoundedBox>

      <RoundedBox args={[0.42, 0.88, 0.05]} radius={0.025} position={[0, 1.08, 0.25]}>
        <meshPhysicalMaterial color="#0b1220" emissive={glowColor} emissiveIntensity={0.42} />
      </RoundedBox>

      <mesh position={[0, 0.62, 0.26]}>
        <boxGeometry args={[0.28, 0.1, 0.03]} />
        <meshStandardMaterial color="#111827" />
      </mesh>

      <mesh position={[0.29, 1.1, 0.03]} rotation={[0, 0, Math.PI / 8]}>
        <cylinderGeometry args={[0.03, 0.03, 0.92, 12]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>

      <mesh position={[0.37, 0.7, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.08, 0.018, 12, 24, Math.PI * 1.4]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.4} roughness={0.5} />
      </mesh>

      <mesh position={[-0.28, 0.42, 0.19]}>
        <boxGeometry args={[0.08, 0.46, 0.08]} />
        <meshStandardMaterial color={glowColor} emissive={glowColor} emissiveIntensity={0.25} />
      </mesh>

      <Text position={[0, 2.75, 0.02]} fontSize={0.14} color="#0f172a" anchorX="center" maxWidth={1.2}>
        {connector.type}
      </Text>
      <Text position={[0, 0.6, 0.29]} fontSize={0.1} color="#f8fafc" anchorX="center" maxWidth={1.1}>
        {`${connector.powerKw}kW`}
      </Text>

      <pointLight ref={pulseLightRef} position={[0, 1.4, 0.55]} color={glowColor} distance={3.5} intensity={1} />
      {connector.status === "charging" && (
        <Sparkles position={[0, 1.28, 0.4]} color={glowColor} count={16} size={2.8} scale={0.7} speed={0.35} />
      )}
    </group>
  );
};

const ChargingVehicle = ({
  index,
  accentColor,
}: {
  index: number;
  accentColor: string;
}) => {
  const bodyColor = VEHICLE_PALETTE[index % VEHICLE_PALETTE.length];

  return (
    <group position={[0, 0.08, 0.82]} rotation={[0, Math.PI, 0]}>
      <RoundedBox args={[1.62, 0.46, 3.08]} radius={0.16} position={[0, 0.38, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={bodyColor} metalness={0.85} roughness={0.18} clearcoat={1} clearcoatRoughness={0.1} />
      </RoundedBox>

      <RoundedBox args={[1.18, 0.48, 1.62]} radius={0.18} position={[0, 0.83, -0.18]} castShadow>
        <meshPhysicalMaterial color="#111827" metalness={0.5} roughness={0.08} transmission={0.18} />
      </RoundedBox>

      <mesh position={[0, 0.72, 0.58]}>
        <boxGeometry args={[0.88, 0.12, 0.95]} />
        <meshPhysicalMaterial color="#bfdbfe" transmission={0.45} roughness={0.03} metalness={0.05} transparent opacity={0.7} />
      </mesh>

      {[
        [-0.56, 0.18, 1.02],
        [0.56, 0.18, 1.02],
        [-0.56, 0.18, -1.02],
        [0.56, 0.18, -1.02],
      ].map((wheel, wheelIndex) => (
        <group key={`${index}-${wheelIndex}`} position={wheel as [number, number, number]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.24, 0.24, 0.18, 20]} />
            <meshStandardMaterial color="#0f172a" roughness={0.95} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.14, 0.14, 0.19, 14]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.25} />
          </mesh>
        </group>
      ))}

      <mesh position={[0.46, 0.38, 1.55]}>
        <boxGeometry args={[0.16, 0.12, 0.02]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
      <mesh position={[-0.46, 0.38, 1.55]}>
        <boxGeometry args={[0.16, 0.12, 0.02]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
      <mesh position={[0.46, 0.38, -1.55]}>
        <boxGeometry args={[0.14, 0.12, 0.02]} />
        <meshBasicMaterial color={accentColor} />
      </mesh>
      <mesh position={[-0.46, 0.38, -1.55]}>
        <boxGeometry args={[0.14, 0.12, 0.02]} />
        <meshBasicMaterial color={accentColor} />
      </mesh>
    </group>
  );
};

const ChargingBay = ({
  connector,
  index,
  position,
  accentColor,
}: {
  connector: ChargingConnector;
  index: number;
  position: [number, number, number];
  accentColor: string;
}) => {
  const glowColor = connector.status === "charging" ? accentColor : STATUS_COLOR[connector.status];

  return (
    <group position={position}>
      <RoundedBox args={[1.95, 0.05, 3.2]} radius={0.08} position={[0, 0.03, 0.62]} receiveShadow>
        <meshStandardMaterial color="#e5ecf4" />
      </RoundedBox>

      {[-0.86, 0.86].map((stripeX) => (
        <mesh key={`${connector.id}-stripe-${stripeX}`} position={[stripeX, 0.055, 0.62]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[0.08, 2.78]} />
          <meshBasicMaterial color={glowColor} transparent opacity={0.92} />
        </mesh>
      ))}

      <mesh position={[0, 0.055, -0.72]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.5, 0.1]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.8} />
      </mesh>

      <RoundedBox args={[1.12, 0.15, 0.28]} radius={0.06} position={[0, 0.11, 1.86]} castShadow receiveShadow>
        <meshStandardMaterial color="#9ca3af" roughness={0.95} />
      </RoundedBox>

      <ChargerPedestal connector={connector} accentColor={accentColor} />

      {connector.status === "charging" && (
        <>
          <ChargingVehicle index={index} accentColor={accentColor} />
          <ConnectorCable start={[0.34, 0.95, -0.96]} end={[0.52, 0.64, -0.16]} color={accentColor} />
        </>
      )}

      {connector.status === "available" && (
        <Sparkles position={[0, 0.28, 0.82]} count={10} scale={0.85} size={1.8} speed={0.18} color="#22c55e" />
      )}

      {connector.status === "maintenance" && (
        <>
          <SafetyCone position={[0.36, 0, 0.6]} />
          <SafetyCone position={[-0.36, 0, 0.95]} />
        </>
      )}
    </group>
  );
};

const StationPylon = ({
  station,
  position,
}: {
  station: ChargingStation;
  position: [number, number, number];
}) => {
  const label = getShortStationLabel(station);
  const amenityLabel = getAmenityLabel(station);

  return (
    <group position={position}>
      <mesh position={[0, 2.35, 0]} castShadow>
        <boxGeometry args={[0.38, 4.7, 0.38]} />
        <meshStandardMaterial color="#0f172a" metalness={0.65} roughness={0.3} />
      </mesh>

      <RoundedBox args={[1.5, 2.4, 0.22]} radius={0.12} position={[0, 3.2, 0.18]} castShadow>
        <meshPhysicalMaterial color="#f8fafc" roughness={0.22} metalness={0.08} />
      </RoundedBox>

      <Text position={[0, 4.15, 0.31]} fontSize={0.16} color="#0f172a" anchorX="center" maxWidth={1.2}>
        SPOTACE
      </Text>
      <Text position={[0, 3.65, 0.31]} fontSize={0.2} color={station.sceneConfig.accentColor} anchorX="center" maxWidth={1.25}>
        {label}
      </Text>
      <Text position={[0, 3.15, 0.31]} fontSize={0.12} color="#334155" anchorX="center" maxWidth={1.25}>
        {`${station.maxPowerKw}kW FAST`}
      </Text>
      <Text position={[0, 2.7, 0.31]} fontSize={0.11} color="#0f172a" anchorX="center" maxWidth={1.2}>
        {amenityLabel}
      </Text>

      <mesh position={[0, 0.14, 0]} receiveShadow>
        <cylinderGeometry args={[0.9, 1.15, 0.28, 24]} />
        <meshStandardMaterial color="#d7e3ef" roughness={0.9} />
      </mesh>
    </group>
  );
};

const ServicePod = ({
  station,
  position,
}: {
  station: ChargingStation;
  position: [number, number, number];
}) => {
  const label = getAmenityLabel(station);
  const hasSolarRoof = station.amenities.some((amenity) => amenity.toLowerCase().includes("solar"));

  return (
    <group position={position}>
      <RoundedBox args={[2.15, 1.7, 1.9]} radius={0.12} position={[0, 0.92, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color="#f8fafc" roughness={0.22} metalness={0.08} />
      </RoundedBox>

      <RoundedBox args={[2.4, 0.18, 2.15]} radius={0.08} position={[0, 1.92, 0]} castShadow>
        <meshStandardMaterial color={station.sceneConfig.canopyColor} metalness={0.45} roughness={0.3} />
      </RoundedBox>

      <RoundedBox args={[1.1, 0.9, 0.08]} radius={0.02} position={[0, 1.08, 0.97]}>
        <meshPhysicalMaterial color="#bfdbfe" transparent opacity={0.65} transmission={0.28} roughness={0.02} />
      </RoundedBox>

      <mesh position={[0, 0.28, 0]} receiveShadow>
        <boxGeometry args={[2.5, 0.12, 2.2]} />
        <meshStandardMaterial color="#dbe4ef" />
      </mesh>

      <Text position={[0, 1.52, 0.99]} fontSize={0.16} color={station.sceneConfig.accentColor} anchorX="center" maxWidth={1.4}>
        {label}
      </Text>

      {hasSolarRoof &&
        [-0.55, 0, 0.55].map((panelX) => (
          <mesh key={`solar-${panelX}`} position={[panelX, 2.04, -0.15]} rotation={[0.18, 0, 0]} castShadow>
            <boxGeometry args={[0.48, 0.04, 1.3]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.15} />
          </mesh>
        ))}
    </group>
  );
};

const LandscapeStrip = ({ width }: { width: number }) => (
  <group position={[0, 0, -4.45]}>
    <mesh receiveShadow>
      <boxGeometry args={[width, 0.18, 1.2]} />
      <meshStandardMaterial color="#d7e3ef" roughness={0.95} />
    </mesh>
    {[-width / 2 + 1.6, 0, width / 2 - 1.6].map((x, index) => (
      <group key={`planter-${index}`} position={[x, 0.24, 0]}>
        <RoundedBox args={[1.35, 0.46, 0.68]} radius={0.08} castShadow receiveShadow>
          <meshStandardMaterial color="#334155" metalness={0.25} roughness={0.7} />
        </RoundedBox>
        <mesh position={[0, 0.36, 0]} castShadow>
          <sphereGeometry args={[0.34, 18, 18]} />
          <meshStandardMaterial color="#16a34a" roughness={0.85} />
        </mesh>
      </group>
    ))}
  </group>
);

const ChargingScene = ({ station }: { station: ChargingStation }) => {
  const bayLayout = useMemo(() => {
    const connectorCount = Math.min(station.connectors.length, 8);
    const columnCount = Math.min(CONNECTORS_PER_ROW, connectorCount);
    const rowCount = Math.ceil(connectorCount / CONNECTORS_PER_ROW);
    const width = columnCount * BAY_SPACING_X + 2.8;
    const depth = rowCount * BAY_SPACING_Z + 3.8;

    return {
      columnCount,
      rowCount,
      width,
      depth,
      bays: station.connectors.slice(0, connectorCount).map((connector, index) => {
        const row = Math.floor(index / CONNECTORS_PER_ROW);
        const column = index % CONNECTORS_PER_ROW;
        const offsetX = -((columnCount - 1) * BAY_SPACING_X) / 2;
        const offsetZ = rowCount === 1 ? 0.65 : -((rowCount - 1) * BAY_SPACING_Z) / 2 + 0.65;

        return {
          connector,
          index,
          position: [offsetX + column * BAY_SPACING_X, 0, offsetZ + row * BAY_SPACING_Z] as [number, number, number],
        };
      }),
    };
  }, [station]);

  const roadDepth = 4.2;
  const canopyWidth = bayLayout.width;
  const canopyDepth = bayLayout.depth;
  const supportColumnPositions = useMemo(
    () =>
      bayLayout.columnCount <= 2
        ? [-canopyWidth / 2 + 1.3, canopyWidth / 2 - 1.3]
        : [-canopyWidth / 2 + 1.15, 0, canopyWidth / 2 - 1.15],
    [bayLayout.columnCount, canopyWidth],
  );

  return (
    <>
      <color attach="background" args={["#eef4fb"]} />
      <fog attach="fog" args={["#eef4fb", 15, 30]} />

      <ambientLight intensity={0.5} />
      <hemisphereLight intensity={0.55} color="#f8fafc" groundColor="#cbd5e1" />
      <directionalLight
        position={[9, 11, 7]}
        intensity={1.6}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
      />
      <spotLight position={[-5, 7, 4]} angle={0.45} penumbra={0.45} intensity={0.8} color="#f8fafc" />
      <Environment preset="city" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.18, 0]} receiveShadow>
        <planeGeometry args={[22, 20]} />
        <meshStandardMaterial color="#edf3fa" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0.7]} receiveShadow>
        <planeGeometry args={[canopyWidth + 3.6, canopyDepth + roadDepth + 1.2]} />
        <MeshReflectorMaterial
          blur={[250, 60]}
          resolution={512}
          mixBlur={0.75}
          mixStrength={18}
          roughness={0.92}
          depthScale={0.3}
          minDepthThreshold={0.85}
          color={station.sceneConfig.surfaceColor}
          metalness={0.05}
          mirror={0.08}
        />
      </mesh>

      <mesh position={[0, 0.11, canopyDepth / 2 + 2.35]} receiveShadow>
        <boxGeometry args={[canopyWidth + 4.2, 0.22, roadDepth]} />
        <meshStandardMaterial color="#4b5563" roughness={0.92} />
      </mesh>

      {[-1.8, 0, 1.8].map((laneX) => (
        <mesh key={`lane-${laneX}`} position={[laneX, 0.23, canopyDepth / 2 + 2.35]} receiveShadow>
          <boxGeometry args={[0.16, 0.01, roadDepth - 1.1]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      ))}

      <RoundedBox args={[canopyWidth, 0.24, canopyDepth]} radius={0.12} position={[0, 3.55, -0.1]} castShadow>
        <meshPhysicalMaterial color={station.sceneConfig.canopyColor} metalness={0.45} roughness={0.24} clearcoat={0.85} />
      </RoundedBox>

      <RoundedBox args={[canopyWidth - 0.55, 0.06, canopyDepth - 0.55]} radius={0.08} position={[0, 3.68, -0.1]} castShadow>
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.16} />
      </RoundedBox>

      {supportColumnPositions.map((x) => (
        <mesh key={`column-front-${x}`} position={[x, 1.72, canopyDepth / 2 - 0.85]} castShadow>
          <cylinderGeometry args={[0.13, 0.15, 3.4, 14]} />
          <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.32} />
        </mesh>
      ))}
      {supportColumnPositions.map((x) => (
        <mesh key={`column-back-${x}`} position={[x, 1.72, -canopyDepth / 2 + 0.85]} castShadow>
          <cylinderGeometry args={[0.13, 0.15, 3.4, 14]} />
          <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.32} />
        </mesh>
      ))}

      {bayLayout.bays.map(({ connector, index, position }) => (
        <ChargingBay
          key={connector.id}
          connector={connector}
          index={index}
          position={position}
          accentColor={station.sceneConfig.accentColor}
        />
      ))}

      <StationPylon station={station} position={[-canopyWidth / 2 - 1.8, 0, -0.35]} />
      <ServicePod station={station} position={[canopyWidth / 2 + 1.8, 0, 0.18]} />
      <LandscapeStrip width={canopyWidth + 5.4} />

      <Float speed={1.3} rotationIntensity={0.05} floatIntensity={0.12}>
        <Html position={[0, 5.1, -canopyDepth / 2 + 0.6]} center>
          <div className="rounded-full border border-white/70 bg-white/92 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.35em] text-slate-700 shadow-lg">
            Live EV Forecourt Twin
          </div>
        </Html>
      </Float>

      <ContactShadows position={[0, 0.03, 0.4]} opacity={0.28} scale={18} blur={2.2} far={9} />
    </>
  );
};

const ChargingStation3DView = ({ station }: { station: ChargingStation }) => {
  return (
    <div className="h-[460px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-xl">
      <Canvas camera={{ position: [0, 6.9, 12.8], fov: 38 }} shadows dpr={[1, 1.6]}>
        <ChargingScene station={station} />
        <OrbitControls
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.4}
          target={[0, 1.2, 0.35]}
          minPolarAngle={Math.PI / 4.8}
          maxPolarAngle={Math.PI / 2.08}
          minDistance={8.6}
          maxDistance={16}
        />
      </Canvas>
    </div>
  );
};

export default ChargingStation3DView;
