import { safeGetPointAt } from "./ParkingPathfinder";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
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
      <primitive object={scene} scale={1.0} dispose={null} />

      {/* Floating Holographic Marker above head */}
      <mesh position={[0, 2.3, 0]}>
        <coneGeometry args={[0.18, 0.38, 16]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#00f0ff"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Ground Position Indicator Ring */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.25, 0.75, 32]} />
        <meshBasicMaterial
          color="#00f0ff"
          transparent
          opacity={0.65}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

useGLTF.preload("/models/ren.glb");
