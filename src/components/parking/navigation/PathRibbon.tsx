import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HumanWalker } from "./HumanWalker";

interface PathRibbonProps {
  curve: THREE.CatmullRomCurve3;
  color?: string;
  width?: number;
  speed?: number;
  progress?: number; // 0 to 1
  isWalking?: boolean;
}

/**
 * Creates an animated canvas texture with bold, glowing directional neon chevrons (>>>)
 * (Ported & adapted from smartPark-3D PathLine).
 */
function createArrowTexture(baseColor = "#00f0ff"): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Glowing translucent background ribbon lane
    ctx.fillStyle = "rgba(0, 240, 255, 0.22)";
    ctx.fillRect(0, 8, canvas.width, 48);

    // Outer neon border rails
    ctx.strokeStyle = "rgba(0, 240, 255, 0.65)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.lineTo(canvas.width, 8);
    ctx.moveTo(0, 56);
    ctx.lineTo(canvas.width, 56);
    ctx.stroke();

    // Bold glowing directional chevrons (>>>)
    ctx.strokeStyle = baseColor;
    ctx.fillStyle = "#ffffff";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = baseColor;
    ctx.shadowBlur = 16;

    const numArrows = 6;
    const step = canvas.width / numArrows;

    for (let i = 0; i < numArrows; i++) {
      const cx = i * step + step * 0.5;
      ctx.beginPath();
      ctx.moveTo(cx - 18, 14);
      ctx.lineTo(cx + 12, 32);
      ctx.lineTo(cx - 18, 50);
      ctx.stroke();

      // Sharp central accent dot
      ctx.beginPath();
      ctx.arc(cx + 18, 32, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(8, 1);
  return texture;
}

export function PathRibbon({
  curve,
  color = "#00f0ff",
  width = 0.82,
  speed = 1.8,
  progress = 0,
  isWalking = false,
}: PathRibbonProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => createArrowTexture(color), [color]);

  // Generate flat ribbon geometry along the 3D curve
  const geometry = useMemo(() => {
    const pointsCount = 150;
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

      // Lift above floor to ensure crystal-clear visibility above epoxy floor
      left.y = 0.12;
      right.y = 0.12;

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

  // Animate the arrow flow continuously along the ribbon
  useFrame((_, delta) => {
    if (texture) {
      texture.offset.x -= delta * speed;
    }
  });

  return (
    <group>
      {/* 3D Directional Arrow Ribbon Mesh */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0.94}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Starting Point (Elevator Foyer) Pulsing Radar Disc */}
      <mesh
        position={[curve.points[0].x, 0.122, curve.points[0].z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.35, 0.95, 32]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Real 3D Humanoid Walker Character (ren.glb with walk & idle animations) */}
      <HumanWalker
        curve={curve}
        progress={progress}
        isWalking={isWalking}
      />
    </group>
  );
}
