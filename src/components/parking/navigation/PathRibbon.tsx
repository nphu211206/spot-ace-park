import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface PathRibbonProps {
  curve: THREE.CatmullRomCurve3;
  color?: string;
  width?: number;
  speed?: number;
  progress?: number; // 0 to 1
  isWalking?: boolean;
}

/**
 * Creates an animated canvas texture with glowing neon directional arrows
 * (Ported & adapted from smartPark-3D PathLine).
 */
function createArrowTexture(baseColor = "#06b6d4"): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Clear transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Subtle translucent neon track line
    ctx.fillStyle = "rgba(6, 182, 212, 0.25)";
    ctx.fillRect(0, 20, canvas.width, 24);

    // Glowing Chevrons (>>>)
    ctx.strokeStyle = baseColor;
    ctx.fillStyle = "#ffffff";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = baseColor;
    ctx.shadowBlur = 12;

    const numArrows = 8;
    const step = canvas.width / numArrows;

    for (let i = 0; i < numArrows; i++) {
      const cx = i * step + step * 0.5;
      ctx.beginPath();
      ctx.moveTo(cx - 14, 14);
      ctx.lineTo(cx + 8, 32);
      ctx.lineTo(cx - 14, 50);
      ctx.stroke();

      // Small bright center dot
      ctx.beginPath();
      ctx.arc(cx + 12, 32, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(6, 1);
  return texture;
}

export function PathRibbon({
  curve,
  color = "#00f0ff",
  width = 0.55,
  speed = 1.4,
  progress = 0,
  isWalking = false,
}: PathRibbonProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const avatarRef = useRef<THREE.Group>(null);

  // Generate arrow texture
  const texture = useMemo(() => createArrowTexture(color), [color]);

  // Generate flat ribbon geometry along the 3D curve
  const geometry = useMemo(() => {
    const pointsCount = 120;
    const points = curve.getPoints(pointsCount);

    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const halfW = width / 2;
    const up = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      let tangent = new THREE.Vector3();

      if (i < points.length - 1) {
        tangent.subVectors(points[i + 1], p).normalize();
      } else {
        tangent.subVectors(p, points[i - 1]).normalize();
      }

      const side = new THREE.Vector3().crossVectors(tangent, up).normalize();

      // Left and right vertices on the floor plane
      const left = p.clone().add(side.clone().multiplyScalar(-halfW));
      const right = p.clone().add(side.clone().multiplyScalar(halfW));

      // Lift slightly above floor to prevent z-fighting
      left.y = 0.085;
      right.y = 0.085;

      vertices.push(left.x, left.y, left.z);
      vertices.push(right.x, right.y, right.z);

      const u = i / (points.length - 1);
      uvs.push(u, 0);
      uvs.push(u, 1);

      if (i < points.length - 1) {
        const base = i * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [curve, width]);

  // Animate the arrow flow along the ribbon
  useFrame((_, delta) => {
    if (texture) {
      texture.offset.x -= delta * speed;
    }

    // If walking animation is active, update avatar position along curve
    if (avatarRef.current && isWalking) {
      const currentPoint = curve.getPointAt(progress);
      avatarRef.current.position.set(currentPoint.x, 0.45, currentPoint.z);

      // Rotate avatar towards tangent
      if (progress < 0.99) {
        const nextPoint = curve.getPointAt(Math.min(1, progress + 0.02));
        avatarRef.current.lookAt(nextPoint.x, 0.45, nextPoint.z);
      }
    }
  });

  return (
    <group>
      {/* 3D Ribbon Mesh */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0.92}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Start Point Pulsing Disc (Elevator Core Landmark) */}
      <mesh position={[curve.points[0].x, 0.09, curve.points[0].z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.75, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>

      {/* Walking Avatar Indicator (If active) */}
      {isWalking && (
        <group ref={avatarRef}>
          {/* Avatar Body Sphere with Glow */}
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.28, 16, 16]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.6} />
          </mesh>
          {/* Floor Shadow / Ring */}
          <mesh position={[0, -0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.1, 0.45, 16]} />
            <meshBasicMaterial color="#0284c7" transparent opacity={0.5} />
          </mesh>
        </group>
      )}
    </group>
  );
}
