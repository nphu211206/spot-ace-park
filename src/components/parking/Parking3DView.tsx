import React, { useState, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Html, useCursor, Text, Float, MeshReflectorMaterial, Sparkles, Sky, Cloud, Billboard, Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { ParkingLot } from "@/pages/Parking";
import { toast } from "sonner";
import { CheckCircle2, Car as CarIcon, Zap, RotateCcw, Sun, Moon, Users, TreePine, Battery, Wifi, Shield, Timer, Thermometer, Wind, Eye, AlertTriangle, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

// ==========================================
// 🎨 ULTIMATE CONFIG - VIP MASTER PRO
// ==========================================
const CONFIG = {
  slotWidth: 2.8, slotDepth: 5.5, slotGap: 0.3,
  colors: {
    available: '#22c55e', occupied: '#ef4444', selected: '#3b82f6', reserved: '#f59e0b',
    ev: '#8b5cf6', vip: '#fbbf24', handicap: '#06b6d4',
    concrete: '#d4d4d4', asphalt: '#4a4a4a', grass: '#22c55e', tree: '#15803d'
  }
};

// ==========================================
// ⚡ EV CHARGING STATION - NEW!
// ==========================================
const EVChargingStation = ({ position }: { position: [number, number, number] }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  const [charging, setCharging] = useState(true);

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 3) * 1;
    }
  });

  return (
    <group position={position}>
      {/* Main pillar */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[0.4, 2, 0.3]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 1.5, 0.16]}>
        <planeGeometry args={[0.3, 0.25]} />
        <meshBasicMaterial color={charging ? "#22c55e" : "#3b82f6"} />
      </mesh>
      {/* LED Strip */}
      <mesh position={[0, 0.5, 0.16]}>
        <boxGeometry args={[0.35, 0.8, 0.02]} />
        <meshBasicMaterial color={charging ? "#22c55e" : "#6366f1"} />
      </mesh>
      {/* Cable */}
      <mesh position={[0.3, 0.8, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      {/* Glow effect */}
      <pointLight ref={lightRef} position={[0, 1, 0.5]} color={charging ? "#22c55e" : "#6366f1"} intensity={2} distance={3} />
      {/* Label */}
      <Billboard position={[0, 2.3, 0]}>
        <Text fontSize={0.15} color="#22c55e" anchorX="center" fontWeight="bold">⚡ EV CHARGE</Text>
      </Billboard>
    </group>
  );
};

// ==========================================
// 🎥 CCTV CAMERA - NEW!
// ==========================================
const CCTVCamera = ({ position, rotation = [0, 0, 0] }: { position: [number, number, number], rotation?: [number, number, number] }) => {
  const camRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (camRef.current) {
      camRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
    }
  });
  return (
    <group position={position} rotation={rotation}>
      {/* Pole */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 4, 8]} />
        <meshStandardMaterial color="#374151" metalness={0.7} />
      </mesh>
      {/* Camera body */}
      <group ref={camRef} position={[0, 4, 0]}>
        <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.1, 0.4, 8]} />
          <meshStandardMaterial color="#1f2937" metalness={0.9} />
        </mesh>
        {/* Lens */}
        <mesh position={[0.55, 0, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={1} roughness={0} />
        </mesh>
        {/* Recording LED */}
        <mesh position={[0.2, 0.12, 0]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>
    </group>
  );
};

// ==========================================
// 🏧 PAYMENT KIOSK - NEW!
// ==========================================
const PaymentKiosk = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh position={[0, 1, 0]} castShadow>
      <boxGeometry args={[0.8, 2, 0.5]} />
      <meshStandardMaterial color="#1e40af" metalness={0.6} roughness={0.3} />
    </mesh>
    {/* Screen */}
    <mesh position={[0, 1.3, 0.26]}>
      <planeGeometry args={[0.6, 0.5]} />
      <meshBasicMaterial color="#3b82f6" />
    </mesh>
    {/* Card slot */}
    <mesh position={[0, 0.7, 0.26]}>
      <boxGeometry args={[0.3, 0.05, 0.02]} />
      <meshStandardMaterial color="#0f172a" />
    </mesh>
    <Text position={[0, 2.2, 0]} fontSize={0.15} color="#fbbf24" anchorX="center" fontWeight="bold">💳 PAY HERE</Text>
  </group>
);

// ==========================================
// 🚨 EMERGENCY POLE - NEW!
// ==========================================
const EmergencyPole = ({ position }: { position: [number, number, number] }) => {
  const lightRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.5;
    }
  });
  return (
    <group position={position}>
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 3, 8]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      <mesh ref={lightRef} position={[0, 3.2, 0]}>
        <boxGeometry args={[0.25, 0.4, 0.25]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} />
      </mesh>
      <Text position={[0, 3.8, 0]} fontSize={0.12} color="#fff" anchorX="center">SOS</Text>
    </group>
  );
};

// ==========================================
// 🌳 ULTRA REALISTIC TREE
// ==========================================
const RealisticTree = ({ position, scale = 1 }: { position: [number, number, number], scale?: number }) => {
  const treeRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (treeRef.current) treeRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3 + position[0]) * 0.02;
  });
  return (
    <group ref={treeRef} position={position} scale={scale}>
      <mesh position={[0, 1.2, 0]} castShadow><cylinderGeometry args={[0.15, 0.25, 2.4, 8]} /><meshStandardMaterial color="#5d4037" roughness={0.9} /></mesh>
      <mesh position={[0, 3, 0]} castShadow><sphereGeometry args={[1.2, 16, 16]} /><meshStandardMaterial color="#2d5016" roughness={0.8} /></mesh>
      <mesh position={[0.5, 3.5, 0.3]} castShadow><sphereGeometry args={[0.8, 12, 12]} /><meshStandardMaterial color="#3d6b1f" roughness={0.8} /></mesh>
      <mesh position={[-0.4, 3.3, -0.2]} castShadow><sphereGeometry args={[0.9, 12, 12]} /><meshStandardMaterial color="#4a7c23" roughness={0.8} /></mesh>
    </group>
  );
};

// ==========================================
// 🚶 ANIMATED PERSON WITH PHONE
// ==========================================
const Person = ({ position, color = "#3b82f6", walking = false }: any) => {
  const personRef = useRef<THREE.Group>(null);
  const [startPos] = useState(position);
  useFrame((state) => {
    if (personRef.current && walking) {
      personRef.current.position.x = startPos[0] + Math.sin(state.clock.elapsedTime * 0.5) * 3;
      personRef.current.children.forEach((child, i) => {
        if (i > 1) child.rotation.x = Math.sin(state.clock.elapsedTime * 4 + i) * 0.3;
      });
    }
  });
  return (
    <group ref={personRef} position={position}>
      <mesh position={[0, 1.5, 0]} castShadow><sphereGeometry args={[0.15, 16, 16]} /><meshStandardMaterial color="#ffdbac" /></mesh>
      <mesh position={[0, 1.1, 0]} castShadow><capsuleGeometry args={[0.12, 0.5, 8, 16]} /><meshStandardMaterial color={color} /></mesh>
      <mesh position={[-0.15, 0.5, 0]} castShadow><capsuleGeometry args={[0.05, 0.4, 4, 8]} /><meshStandardMaterial color="#1e3a5f" /></mesh>
      <mesh position={[0.15, 0.5, 0]} castShadow><capsuleGeometry args={[0.05, 0.4, 4, 8]} /><meshStandardMaterial color="#1e3a5f" /></mesh>
    </group>
  );
};

// ==========================================
// 🚗 ULTRA REALISTIC CAR with LIGHTS
// ==========================================
const RealisticCar = ({ position, color, rotation = [0, 0, 0], isMoving = false }: any) => {
  const carRef = useRef<THREE.Group>(null);
  const [lights] = useState(Math.random() > 0.5);

  useFrame((state) => {
    if (carRef.current && isMoving) {
      carRef.current.position.z += 0.05;
    }
  });

  return (
    <group ref={carRef} position={position} rotation={rotation}>
      {/* Body */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.5, 4.2]} />
        <meshPhysicalMaterial color={color} metalness={0.9} roughness={0.1} clearcoat={1} clearcoatRoughness={0.1} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.75, -0.3]} castShadow>
        <boxGeometry args={[1.7, 0.5, 2.2]} />
        <meshPhysicalMaterial color="#1a1a2e" metalness={0.9} roughness={0} transmission={0.3} />
      </mesh>
      {/* Wheels */}
      {[[-0.8, 0.2, 1.4], [0.8, 0.2, 1.4], [-0.8, 0.2, -1.4], [0.8, 0.2, -1.4]].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.28, 0.28, 0.18, 24]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 0.19, 12]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.9} />
          </mesh>
        </group>
      ))}
      {/* Headlights */}
      <mesh position={[0.6, 0.35, 2.11]}><circleGeometry args={[0.12, 16]} /><meshBasicMaterial color={lights ? "#fef9c3" : "#e5e7eb"} /></mesh>
      <mesh position={[-0.6, 0.35, 2.11]}><circleGeometry args={[0.12, 16]} /><meshBasicMaterial color={lights ? "#fef9c3" : "#e5e7eb"} /></mesh>
      {/* Taillights */}
      <mesh position={[0.6, 0.35, -2.11]}><circleGeometry args={[0.1, 16]} /><meshBasicMaterial color="#ef4444" /></mesh>
      <mesh position={[-0.6, 0.35, -2.11]}><circleGeometry args={[0.1, 16]} /><meshBasicMaterial color="#ef4444" /></mesh>
      {/* License plate */}
      <mesh position={[0, 0.25, 2.12]}><planeGeometry args={[0.6, 0.15]} /><meshBasicMaterial color="#fff" /></mesh>
    </group>
  );
};

// ==========================================
// 🏗️ MODERN GLASS CANOPY
// ==========================================
const ParkingCanopy = ({ position, width, depth }: { position: [number, number, number], width: number, depth: number }) => {
  const pillarPositions: number[][] = [];
  for (let x = -width / 2 + 3; x <= width / 2 - 3; x += 6) {
    pillarPositions.push([x, 0, depth / 2 - 1], [x, 0, -depth / 2 + 1]);
  }
  return (
    <group position={position}>
      {/* Glass roof */}
      <mesh position={[0, 4.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.08, depth]} />
        <meshPhysicalMaterial color="#e0f2fe" metalness={0.1} roughness={0.1} transmission={0.6} transparent opacity={0.7} />
      </mesh>
      {/* Steel frame */}
      <mesh position={[0, 4, 0]}><boxGeometry args={[width + 0.5, 0.15, 0.15]} /><meshStandardMaterial color="#374151" metalness={0.8} /></mesh>
      <mesh position={[0, 4, depth / 2 - 0.5]}><boxGeometry args={[width + 0.5, 0.15, 0.15]} /><meshStandardMaterial color="#374151" metalness={0.8} /></mesh>
      <mesh position={[0, 4, -depth / 2 + 0.5]}><boxGeometry args={[width + 0.5, 0.15, 0.15]} /><meshStandardMaterial color="#374151" metalness={0.8} /></mesh>
      {/* Pillars */}
      {pillarPositions.map((pos, i) => (
        <mesh key={i} position={[pos[0], 2, pos[2]]} castShadow>
          <cylinderGeometry args={[0.12, 0.15, 4, 12]} />
          <meshStandardMaterial color="#6b7280" metalness={0.7} />
        </mesh>
      ))}
      {/* LED lights */}
      {[-width / 4, 0, width / 4].map((x, i) => (
        <group key={`light-${i}`}>
          <mesh position={[x, 3.9, 0]}><boxGeometry args={[2, 0.08, 0.3]} /><meshBasicMaterial color="#fef9c3" /></mesh>
          <pointLight position={[x, 3.5, 0]} color="#fef9c3" intensity={0.5} distance={8} />
        </group>
      ))}
    </group>
  );
};

// ==========================================
// 🅿️ SMART PARKING SLOT
// ==========================================
const ParkingSlot = ({ index, position, status, slotType, onSelect, selectedSlot }: any) => {
  const [hovered, setHovered] = useState(false);
  const slotId = `P-${String(index + 1).padStart(2, '0')}`;
  const isSelected = selectedSlot === slotId;
  useCursor(hovered && status === 'free');

  const getSlotColor = () => {
    if (status === 'occupied') return '#fecaca';
    if (isSelected) return '#bfdbfe';
    if (slotType === 'ev') return '#ddd6fe';
    if (slotType === 'vip') return '#fef3c7';
    if (slotType === 'handicap') return '#a5f3fc';
    if (hovered) return '#dbeafe';
    return '#f3f4f6';
  };

  const getBorderColor = () => {
    if (status === 'occupied') return CONFIG.colors.occupied;
    if (isSelected) return CONFIG.colors.selected;
    if (slotType === 'ev') return CONFIG.colors.ev;
    if (slotType === 'vip') return CONFIG.colors.vip;
    if (slotType === 'handicap') return CONFIG.colors.handicap;
    if (hovered) return '#60a5fa';
    return '#fff';
  };

  const carColors = ['#1e3a8a', '#dc2626', '#f8fafc', '#18181b', '#166534', '#7c3aed', '#ea580c', '#0891b2', '#be185d', '#ca8a04'];

  return (
    <group position={position}>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow
        onPointerOver={() => status !== 'occupied' && setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); status === 'occupied' ? toast.error("Vị trí đã có xe!") : onSelect(); }}>
        <planeGeometry args={[CONFIG.slotWidth, CONFIG.slotDepth]} />
        <meshStandardMaterial color={getSlotColor()} />
      </mesh>
      {/* Border lines */}
      {[[-CONFIG.slotWidth / 2, 0.02, 0], [CONFIG.slotWidth / 2, 0.02, 0]].map((pos, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={pos as [number, number, number]}>
          <planeGeometry args={[0.1, CONFIG.slotDepth]} />
          <meshBasicMaterial color={getBorderColor()} />
        </mesh>
      ))}
      {/* Wheel stopper */}
      <mesh position={[0, 0.08, -CONFIG.slotDepth / 2 + 0.3]} castShadow>
        <boxGeometry args={[2, 0.12, 0.2]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      {/* Slot number */}
      <Text position={[0, 0.05, CONFIG.slotDepth / 2 - 0.5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.4} color="#374151" anchorX="center">{slotId}</Text>
      {/* Type indicator */}
      {slotType === 'ev' && <Text position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.35} color="#8b5cf6" anchorX="center">⚡</Text>}
      {slotType === 'vip' && <Text position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.35} color="#fbbf24" anchorX="center">★</Text>}
      {slotType === 'handicap' && <Text position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.35} color="#06b6d4" anchorX="center">♿</Text>}
      {/* Car */}
      {status === 'occupied' && <RealisticCar position={[0, 0, 0]} color={carColors[index % carColors.length]} />}
      {/* Hover tooltip */}
      {(hovered || isSelected) && status !== 'occupied' && (
        <Html position={[0, 2.5, 0]} center>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-2xl flex items-center gap-2 border border-white/20">
            <CheckCircle2 className="w-4 h-4" /> CHỌN VỊ TRÍ NÀY
            {slotType && <span className="text-xs opacity-80">({slotType.toUpperCase()})</span>}
          </motion.div>
        </Html>
      )}
      {/* Sensor indicator */}
      <mesh position={[0, 0.02, -CONFIG.slotDepth / 2 + 0.8]}>
        <circleGeometry args={[0.08, 16]} />
        <meshBasicMaterial color={status === 'occupied' ? '#ef4444' : '#22c55e'} />
      </mesh>
    </group>
  );
};

// ==========================================
// 🚧 SMART BARRIER GATE
// ==========================================
const BarrierGate = ({ position, isOpen = false, label }: { position: [number, number, number], isOpen?: boolean, label: string }) => {
  const armRef = useRef<THREE.Mesh>(null);
  useFrame(() => { if (armRef.current) armRef.current.rotation.z += ((isOpen ? -Math.PI / 2 : 0) - armRef.current.rotation.z) * 0.05; });
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.1, 0]} castShadow><boxGeometry args={[1, 0.2, 0.8]} /><meshStandardMaterial color="#374151" /></mesh>
      {/* Pillar */}
      <mesh position={[0, 0.8, 0]} castShadow><boxGeometry args={[0.5, 1.4, 0.5]} /><meshStandardMaterial color="#f59e0b" /></mesh>
      {/* Status light */}
      <mesh position={[0, 1.6, 0]}><sphereGeometry args={[0.1, 16, 16]} /><meshBasicMaterial color={isOpen ? "#22c55e" : "#ef4444"} /></mesh>
      <pointLight position={[0, 1.6, 0.3]} color={isOpen ? "#22c55e" : "#ef4444"} intensity={1} distance={2} />
      {/* Arm */}
      <group position={[0, 1.3, 0]}>
        <mesh ref={armRef} position={[1.8, 0, 0]} castShadow>
          <boxGeometry args={[3.6, 0.12, 0.1]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
      </group>
      {/* LED display */}
      <Billboard position={[0, 2.2, 0]}>
        <Text fontSize={0.25} color={label.includes('VÀO') ? '#22c55e' : '#ef4444'} anchorX="center" fontWeight="bold">{label}</Text>
      </Billboard>
    </group>
  );
};

// ==========================================
// 🪑 BENCH
// ==========================================
const Bench = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh position={[0, 0.35, 0]} castShadow><boxGeometry args={[1.5, 0.08, 0.4]} /><meshStandardMaterial color="#92400e" /></mesh>
    <mesh position={[0, 0.55, -0.15]} castShadow><boxGeometry args={[1.5, 0.4, 0.05]} /><meshStandardMaterial color="#92400e" /></mesh>
    {[[-0.6, 0.17, 0], [0.6, 0.17, 0]].map((pos, i) => (<mesh key={i} position={pos as [number, number, number]} castShadow><boxGeometry args={[0.08, 0.35, 0.35]} /><meshStandardMaterial color="#1f2937" /></mesh>))}
  </group>
);

// ==========================================
// 🗑️ TRASH BIN
// ==========================================
const TrashBin = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh position={[0, 0.4, 0]} castShadow><cylinderGeometry args={[0.25, 0.2, 0.8, 16]} /><meshStandardMaterial color="#374151" /></mesh>
    <mesh position={[0, 0.85, 0]}><cylinderGeometry args={[0.28, 0.28, 0.1, 16]} /><meshStandardMaterial color="#1f2937" /></mesh>
  </group>
);

// ==========================================
// 🚦 TRAFFIC SIGN
// ==========================================
const TrafficSign = ({ position, text, bgColor }: { position: [number, number, number], text: string, bgColor: string }) => (
  <group position={position}>
    <mesh position={[0, 1.5, 0]} castShadow><cylinderGeometry args={[0.05, 0.05, 3, 8]} /><meshStandardMaterial color="#6b7280" metalness={0.7} /></mesh>
    <mesh position={[0, 2.8, 0]} castShadow><circleGeometry args={[0.4, 32]} /><meshStandardMaterial color={bgColor} /></mesh>
    <Text position={[0, 2.8, 0.05]} fontSize={0.25} color="#fff" anchorX="center" anchorY="middle" fontWeight="bold">{text}</Text>
  </group>
);

// ==========================================
// 💡 SMART LAMP POST
// ==========================================
const LampPost = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh position={[0, 2.5, 0]} castShadow><cylinderGeometry args={[0.06, 0.1, 5, 8]} /><meshStandardMaterial color="#4b5563" metalness={0.7} /></mesh>
    <mesh position={[0.5, 4.8, 0]} rotation={[0, 0, -0.5]}><cylinderGeometry args={[0.04, 0.04, 1, 6]} /><meshStandardMaterial color="#4b5563" metalness={0.7} /></mesh>
    <mesh position={[0.9, 5, 0]}><boxGeometry args={[0.5, 0.15, 0.3]} /><meshStandardMaterial color="#374151" /></mesh>
    <mesh position={[0.9, 4.9, 0]}><boxGeometry args={[0.4, 0.05, 0.2]} /><meshBasicMaterial color="#fef9c3" /></mesh>
    <pointLight position={[0.9, 4.5, 0]} color="#fef9c3" intensity={0.8} distance={12} />
  </group>
);

// ==========================================
// 🏢 BUILDING
// ==========================================
const Building = ({ position, width, height, depth, color }: any) => (
  <group position={position}>
    <mesh position={[0, height / 2, 0]} castShadow receiveShadow><boxGeometry args={[width, height, depth]} /><meshStandardMaterial color={color} /></mesh>
    {Array.from({ length: Math.floor(height / 2) }).map((_, y) => (
      Array.from({ length: Math.floor(width / 3) }).map((_, x) => (
        <mesh key={`${y}-${x}`} position={[-width / 2 + 1.5 + x * 3, 1 + y * 2, depth / 2 + 0.01]}><planeGeometry args={[1.5, 1]} /><meshBasicMaterial color="#7dd3fc" /></mesh>
      ))
    ))}
  </group>
);

// ==========================================
// 🎯 MAIN COMPONENT - ULTIMATE VERSION
// ==========================================
const Parking3DView = ({ parkingLot, onBook }: { parkingLot: ParkingLot; onBook: (id: string) => void }) => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isNightMode, setIsNightMode] = useState(false);
  const [showStats, setShowStats] = useState(true);

  const slots = useMemo(() => {
    const total = parkingLot.total_spots || 24;
    const seedBase = String(parkingLot.id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return Array.from({ length: total }).map((_, i) => {
      const rand = Math.abs(Math.sin(seedBase + i * 12.34) * 10000) % 1;
      return {
        id: `P-${String(i + 1).padStart(2, '0')}`,
        status: rand > 0.5 || i > total - 4 ? 'free' : 'occupied',
        type: i < 2 ? 'ev' : i < 4 ? 'vip' : i === 4 ? 'handicap' : 'normal'
      };
    });
  }, [parkingLot.id, parkingLot.total_spots]);

  const slotsPerRow = Math.ceil(slots.length / 2);
  const spacing = CONFIG.slotWidth + CONFIG.slotGap;
  const stats = {
    total: slots.length,
    available: slots.filter(s => s.status === 'free').length,
    ev: slots.filter(s => s.type === 'ev' && s.status === 'free').length,
    vip: slots.filter(s => s.type === 'vip' && s.status === 'free').length
  };

  return (
    <div className="w-full h-[750px] rounded-2xl overflow-hidden relative bg-gradient-to-b from-sky-200 via-sky-100 to-sky-50">
      {/* ENHANCED HUD - TOP LEFT */}
      <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        className="absolute top-4 left-4 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <CarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-black text-gray-800 dark:text-white text-lg">{parkingLot.name}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Wifi className="w-3 h-3 text-green-500" /> IoT Online</span>
              <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-blue-500" /> Secured</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs"><Thermometer className="w-3 h-3 mr-1" /> 28°C</Badge>
          <Badge variant="outline" className="text-xs"><Wind className="w-3 h-3 mr-1" /> 12km/h</Badge>
        </div>
      </motion.div>

      {/* STATS PANEL - TOP RIGHT */}
      <AnimatePresence>
        {showStats && (
          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 50, opacity: 0 }}
            className="absolute top-4 right-4 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/50">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="text-3xl font-black text-green-600">{stats.available}</div>
                <div className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Trống</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="text-3xl font-black text-gray-800 dark:text-white">{stats.total}</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Tổng</div>
              </div>
              <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-lg font-bold text-purple-600 flex items-center justify-center gap-1"><Zap className="w-4 h-4" />{stats.ev}</div>
                <div className="text-[8px] text-purple-600 uppercase">EV</div>
              </div>
              <div className="text-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div className="text-lg font-bold text-amber-600">{stats.vip}</div>
                <div className="text-[8px] text-amber-600 uppercase">VIP</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEGEND - BOTTOM LEFT */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 py-3 rounded-xl border border-white/50 shadow-lg">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500 shadow-sm" /> Trống</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 shadow-sm" /> Đã đỗ</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-500 shadow-sm" /> EV ⚡</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" /> VIP ★</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-cyan-500 shadow-sm" /> Khuyết tật ♿</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" /> Đang chọn</span>
        </div>
      </div>

      {/* CONTROLS - BOTTOM RIGHT */}
      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
        <Button variant="outline" size="sm" className="bg-white/95 backdrop-blur-xl shadow-lg hover:scale-105 transition-transform"
          onClick={() => setShowStats(!showStats)}>
          <Eye className="w-4 h-4 mr-1" /> {showStats ? 'Ẩn' : 'Hiện'}
        </Button>
        <Button variant="outline" size="sm" className="bg-white/95 backdrop-blur-xl shadow-lg hover:scale-105 transition-transform"
          onClick={() => setIsNightMode(!isNightMode)}>
          {isNightMode ? <Sun className="w-4 h-4 mr-1" /> : <Moon className="w-4 h-4 mr-1" />}
          {isNightMode ? 'Ngày' : 'Đêm'}
        </Button>
        <Button variant="outline" size="sm" className="bg-white/95 backdrop-blur-xl shadow-lg hover:scale-105 transition-transform"
          onClick={() => setSelectedSlot(null)}>
          <RotateCcw className="w-4 h-4 mr-1" /> Reset
        </Button>
      </div>

      {/* 3D CANVAS */}
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 30, 45], fov: 50 }}>
        <color attach="background" args={[isNightMode ? '#0f172a' : '#87ceeb']} />
        <fog attach="fog" args={[isNightMode ? '#0f172a' : '#87ceeb', 60, 150]} />

        {isNightMode ? (
          <>
            <Stars radius={100} depth={50} count={2000} factor={4} />
            <ambientLight intensity={0.15} />
          </>
        ) : (
          <>
            <Sky sunPosition={[100, 50, 100]} turbidity={0.3} rayleigh={0.5} />
            <Cloud position={[-30, 20, -40]} opacity={0.6} speed={0.2} />
            <Cloud position={[40, 25, -30]} opacity={0.4} speed={0.15} />
            <ambientLight intensity={0.6} />
          </>
        )}

        <Environment preset={isNightMode ? "night" : "city"} />
        <directionalLight position={[30, 50, 30]} intensity={isNightMode ? 0.3 : 1.5} castShadow
          shadow-mapSize={[2048, 2048]} shadow-camera-left={-50} shadow-camera-right={50} shadow-camera-top={50} shadow-camera-bottom={-50} />
        <OrbitControls enablePan enableZoom minPolarAngle={0.2} maxPolarAngle={Math.PI / 2.3} minDistance={15} maxDistance={80} target={[0, 0, 0]} />

        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color={isNightMode ? "#1e3a1e" : "#7cb342"} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[80, 60]} />
          <MeshReflectorMaterial blur={[300, 100]} resolution={512} mixBlur={1} mixStrength={isNightMode ? 60 : 30} color={isNightMode ? "#1e293b" : "#6b7280"} metalness={0.1} roughness={0.9} mirror={isNightMode ? 0.2 : 0.1} />
        </mesh>

        {/* Canopies */}
        <ParkingCanopy position={[0, 0, -10]} width={slotsPerRow * spacing + 4} depth={12} />
        <ParkingCanopy position={[0, 0, 10]} width={slotsPerRow * spacing + 4} depth={12} />

        {/* Road */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}><planeGeometry args={[slotsPerRow * spacing + 8, 6]} /><meshStandardMaterial color="#4b5563" /></mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}><planeGeometry args={[slotsPerRow * spacing, 0.15]} /><meshBasicMaterial color="#fbbf24" /></mesh>
        {[-15, 0, 15].map((x, i) => <Text key={i} position={[x, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={1} color="#fff">→</Text>)}

        {/* Parking slots */}
        <group position={[-(slotsPerRow * spacing) / 2 + spacing / 2, 0, 0]}>
          {slots.map((slot, i) => {
            const row = Math.floor(i / slotsPerRow), col = i % slotsPerRow;
            return (
              <group key={slot.id} rotation={[0, row === 0 ? 0 : Math.PI, 0]}>
                <ParkingSlot index={i} position={[col * spacing, 0, row === 0 ? -10 : 10]}
                  status={slot.status} slotType={slot.type} selectedSlot={selectedSlot}
                  onSelect={() => { setSelectedSlot(slot.id); onBook(slot.id); }} />
              </group>
            );
          })}
        </group>

        {/* Gates */}
        <BarrierGate position={[-slotsPerRow * spacing / 2 - 5, 0, 0]} isOpen={false} label="🚗 LỐI VÀO" />
        <BarrierGate position={[slotsPerRow * spacing / 2 + 5, 0, 0]} isOpen={true} label="LỐI RA 🚗" />

        {/* EV Charging Stations */}
        <EVChargingStation position={[-slotsPerRow * spacing / 2 + 3, 0, -16]} />
        <EVChargingStation position={[-slotsPerRow * spacing / 2 + 6, 0, -16]} />

        {/* CCTV Cameras */}
        <CCTVCamera position={[-slotsPerRow * spacing / 2 - 3, 0, -18]} />
        <CCTVCamera position={[slotsPerRow * spacing / 2 + 3, 0, -18]} />
        <CCTVCamera position={[0, 0, 18]} rotation={[0, Math.PI, 0]} />

        {/* Payment Kiosks */}
        <PaymentKiosk position={[-slotsPerRow * spacing / 2 - 6, 0, -5]} />
        <PaymentKiosk position={[slotsPerRow * spacing / 2 + 6, 0, 5]} />

        {/* Emergency Poles */}
        <EmergencyPole position={[-20, 0, 0]} />
        <EmergencyPole position={[20, 0, 0]} />

        {/* Trees */}
        {[-35, -25, -15, 15, 25, 35].map((x, i) => <RealisticTree key={`tree-${i}`} position={[x, 0, -25]} scale={1 + Math.random() * 0.3} />)}
        {[-35, -25, -15, 15, 25, 35].map((x, i) => <RealisticTree key={`tree2-${i}`} position={[x, 0, 25]} scale={1 + Math.random() * 0.3} />)}

        {/* People */}
        <Person position={[-20, 0, 5]} color="#3b82f6" walking />
        <Person position={[15, 0, -8]} color="#ec4899" />
        <Person position={[25, 0, 12]} color="#10b981" walking />
        <Person position={[-10, 0, 18]} color="#f59e0b" />

        {/* Street furniture */}
        <Bench position={[-30, 0, 0]} />
        <Bench position={[30, 0, 0]} />
        <TrashBin position={[-28, 0, 3]} />
        <TrashBin position={[28, 0, 3]} />

        {/* Lamp posts */}
        {[-20, 0, 20].map((x, i) => <LampPost key={i} position={[x, 0, -22]} />)}
        {[-20, 0, 20].map((x, i) => <LampPost key={`l2-${i}`} position={[x, 0, 22]} />)}

        {/* Signs */}
        <TrafficSign position={[-slotsPerRow * spacing / 2 - 8, 0, -3]} text="P" bgColor="#3b82f6" />
        <TrafficSign position={[slotsPerRow * spacing / 2 + 8, 0, -3]} text="20" bgColor="#ef4444" />

        {/* Buildings */}
        <Building position={[-50, 0, -50]} width={20} height={15} depth={15} color="#94a3b8" />
        <Building position={[0, 0, -55]} width={30} height={20} depth={12} color="#cbd5e1" />
        <Building position={[50, 0, -50]} width={18} height={12} depth={15} color="#a1a1aa" />

        <Sparkles count={isNightMode ? 100 : 30} scale={60} size={isNightMode ? 2 : 1} speed={0.1} color={isNightMode ? "#60a5fa" : "#fef9c3"} opacity={isNightMode ? 0.8 : 0.3} />
      </Canvas>
    </div>
  );
};

export default Parking3DView;