import { safeGetPointAt } from "./ParkingPathfinder";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";

interface HumanWalkerProps {
  curve: THREE.CatmullRomCurve3;
  progress: number; // 0 to 1
  isWalking: boolean;
  onPositionUpdate?: (pos: THREE.Vector3, lookAtTarget: THREE.Vector3) => void;
}

export function HumanWalker({
  curve,
  progress = 0,
  isWalking = false,
  onPositionUpdate,
}: HumanWalkerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/ren.glb");
  const { actions } = useAnimations(animations, groupRef);

  // Override dull terracotta clay materials into sleek, bright modern athletic attire
  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          const mat = mesh.material as any;
          if (mesh.name === "Mesh" || mat.name?.includes("Joints")) {
            // Sleek sporty blue accent trim
            mesh.material = new THREE.MeshStandardMaterial({
              color: "#0284c7",
              roughness: 0.25,
              metalness: 0.45,
              emissive: "#0369a1",
              emissiveIntensity: 0.35,
            });
          } else {
            // Clean, crisp white & light silver athletic track jacket & joggers
            mesh.material = new THREE.MeshStandardMaterial({
              color: "#1e3a8a",
              roughness: 0.32,
              metalness: 0.12,
            });
          }
        }
      }
    });
  }, [scene]);

  // Switch animation between 'idle' and 'walk'
  useEffect(() => {
    const walkAction = actions["walk"];
    const idleAction = actions["idle"];

    if (isWalking) {
      idleAction?.fadeOut(0.2);
      if (walkAction) {
        walkAction.reset().fadeIn(0.2).play();
        walkAction.timeScale = 1.15; // Natural walking cadence
      }
    } else {
      walkAction?.fadeOut(0.2);
      if (idleAction) {
        idleAction.reset().fadeIn(0.2).play();
      }
    }

    return () => {
      walkAction?.fadeOut(0.15);
      idleAction?.fadeOut(0.15);
    };
  }, [isWalking, actions]);

  // Update position and rotation along Catmull-Rom curve every frame
  useFrame(() => {
    if (!groupRef.current || !curve) return;

    const clampedProg = Math.max(0, Math.min(0.9999, progress || 0));
    const currentPoint = safeGetPointAt(curve, clampedProg);

    // Look slightly ahead on curve for smooth facing direction
    const nextProg = Math.min(0.9999, clampedProg + 0.02);
    const targetPoint = safeGetPointAt(curve, nextProg);

    groupRef.current.position.set(currentPoint.x, 0.08, currentPoint.z);

    if (currentPoint.distanceTo(targetPoint) > 0.01) {
      groupRef.current.lookAt(targetPoint.x, 0.08, targetPoint.z);
    }

    if (onPositionUpdate) {
      onPositionUpdate(currentPoint, targetPoint);
    }
  });

  return (
    <group ref={groupRef}>
      {/* 3D Human Model */}
      <primitive object={scene} scale={1.05} dispose={null} />

      {/* Dedicated Follow Key Light: ensures character is always vividly illuminated */}
      <pointLight position={[0, 2.4, 1.2]} intensity={1.2} color="#ffffff" distance={8} decay={0.8} />
      <pointLight position={[0, 1.2, -1.0]} intensity={0.8} color="#f8fafc" distance={6} decay={0.8} />

      {/* Floating Holographic Marker & HTML Name Badge above head */}
      <mesh position={[0, 2.25, 0]}>
        <coneGeometry args={[0.14, 0.3, 16]} />
        <meshStandardMaterial
          color="#00f0ff"
          emissive="#00f0ff"
          emissiveIntensity={1.2}
        />
      </mesh>

      <Html position={[0, 2.48, 0]} center distanceFactor={14} style={{ pointerEvents: "none" }}>
        <div className="flex items-center gap-1.5 rounded-full border border-cyan-400/90 bg-slate-900/95 px-3 py-1 shadow-2xl backdrop-blur-md whitespace-nowrap">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
          <span className="text-[11px] font-black tracking-wider text-cyan-300">VỊ TRÍ CỦA BẠN</span>
        </div>
      </Html>

      {/* Bright Ground Radar Indicator Ring */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.85, 32]} />
        <meshBasicMaterial
          color="#00f0ff"
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

useGLTF.preload("/models/ren.glb");
