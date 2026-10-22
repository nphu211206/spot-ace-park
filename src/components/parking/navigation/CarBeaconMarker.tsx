import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";

interface CarBeaconMarkerProps {
  position: [number, number, number];
  slotCode: string;
  plateNumber?: string;
  isFlashing?: boolean;
}

/**
 * Procedural Web Audio API Car Horn Synthesizer.
 * Synthesizes a realistic dual-tone car horn (410Hz + 460Hz) with zero external assets.
 */
export function playCarHornSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const playBeep = (startTime: number, duration: number) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(410, startTime);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(465, startTime);

      // Lowpass filter to muffle harsh harmonics like real metal horn
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1400, startTime);

      // Envelope
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.35, startTime + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + duration);
      osc2.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    // Dual beep: "Bíp... bíp!"
    playBeep(now, 0.22);
    playBeep(now + 0.32, 0.28);
  } catch (err) {
    console.warn("Could not play procedural car horn:", err);
  }
}

export function CarBeaconMarker({
  position,
  slotCode,
  plateNumber = "30F-888.88",
  isFlashing = false,
}: CarBeaconMarkerProps) {
  const pinRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ringScale = useRef(1);

  useFrame((state, delta) => {
    // Gentle floating motion
    if (pinRef.current) {
      pinRef.current.position.y = position[1] + 3.2 + Math.sin(state.clock.elapsedTime * 2.5) * 0.15;
    }

    // Expanding pulsing radar ring
    if (ringRef.current) {
      ringScale.current += delta * 1.5;
      if (ringScale.current > 3.2) {
        ringScale.current = 0.8;
      }
      ringRef.current.scale.set(ringScale.current, ringScale.current, 1);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = Math.max(0, 1 - (ringScale.current - 0.8) / 2.4);
      }
    }
  });

  return (
    <group position={position}>
      {/* Ground radar pulsing ring */}
      <mesh
        ref={ringRef}
        position={[0, 0.09, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.8, 1.05, 32]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>

      {/* Vertical light beam pointing down to the car */}
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.04, 0.12, 3.2, 16]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.4} />
      </mesh>

      {/* Headlight flash simulation on car front */}
      {isFlashing && (
        <group position={[0, 0.65, 2.2]}>
          <pointLight color="#fef08a" intensity={8} distance={8} />
          <mesh position={[-0.6, 0, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.6, 0, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      )}

      {/* Floating 3D Billboard Pin */}
      <group ref={pinRef} position={[0, 3.2, 0]}>
        <Billboard follow lockX={false} lockY={false} lockZ={false}>
          {/* Main Pin Card Background */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[2.8, 1.25]} />
            <meshStandardMaterial
              color="#0f172a"
              roughness={0.2}
              metalness={0.8}
              transparent
              opacity={0.92}
            />
          </mesh>

          {/* Glowing Green Border */}
          <lineSegments position={[0, 0, 0.01]}>
            <edgesGeometry args={[new THREE.PlaneGeometry(2.82, 1.27)]} />
            <lineBasicMaterial color="#22c55e" linewidth={2} />
          </lineSegments>

          {/* Text Title */}
          <Text
            position={[0, 0.32, 0.02]}
            fontSize={0.26}
            color="#22c55e"
            anchorX="center"
            anchorY="middle"
          >
            {`XE CỦA BẠN • Ô ${slotCode}`}
          </Text>

          {/* License Plate Text */}
          <Text
            position={[0, -0.15, 0.02]}
            fontSize={0.34}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {plateNumber}
          </Text>
        </Billboard>
      </group>
    </group>
  );
}
