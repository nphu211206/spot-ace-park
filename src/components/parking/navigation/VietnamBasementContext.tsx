import { useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";

interface VietnamBasementProps {
  width: number;
  depth: number;
  height?: number;
  laneWidth?: number;
  lotName?: string;
  columnCount?: number;
  slotSpacingX?: number;
  topBankZ?: number;
  bottomBankZ?: number;
}

export function VietnamBasementContext({
  width,
  depth,
  height = 4.8,
  laneWidth = 8.8,
  lotName = "Vincom Center Đồng Khởi",
  columnCount = 12,
  slotSpacingX = 4.25,
  topBankZ = -10.4,
  bottomBankZ = 10.4,
}: VietnamBasementProps) {
  const halfW = width / 2;
  const halfD = depth / 2;

  // Generate column X positions (placed every 2 slots along each parking bank)
  const columnPositions = useMemo(() => {
    const list: number[] = [];
    const step = slotSpacingX * 2;
    const startX = -((columnCount - 1) * slotSpacingX) / 2 + slotSpacingX;
    for (let x = startX; x <= halfW - 4; x += step) {
      list.push(x);
    }
    return list;
  }, [columnCount, slotSpacingX, halfW]);

  // Overhead beam X positions
  const beamXList = useMemo(() => {
    const list: number[] = [];
    for (let x = -halfW + 6; x <= halfW - 6; x += 8.5) {
      list.push(x);
    }
    return list;
  }, [halfW]);

  return (
    <group>
      {/* ============================================================== */}
      {/* 1. ENCLOSED BASEMENT CEILING & STRUCTURAL BEAMS               */}
      {/* ============================================================== */}
      {/* Main Concrete Ceiling Slab with DoubleSide rendering */}
      <mesh position={[0, height + 0.15, 0]} receiveShadow>
        <boxGeometry args={[width + 16, 0.3, depth + 16]} />
        <meshStandardMaterial color="#334155" roughness={0.82} side={THREE.DoubleSide} />
      </mesh>

      {/* Heavy Structural Concrete Beams running across ceiling */}
      {beamXList.map((x, idx) => (
        <mesh key={`beam-${idx}`} position={[x, height - 0.22, 0]} receiveShadow>
          <boxGeometry args={[0.7, 0.45, depth + 10]} />
          <meshStandardMaterial color="#526071" roughness={0.78} />
        </mesh>
      ))}

      {/* Longitudinal Beam across the central lane boundary */}
      <mesh position={[0, height - 0.22, topBankZ + 3.2]} receiveShadow>
        <boxGeometry args={[width + 10, 0.45, 0.7]} />
        <meshStandardMaterial color="#526071" roughness={0.78} />
      </mesh>
      <mesh position={[0, height - 0.22, bottomBankZ - 3.2]} receiveShadow>
        <boxGeometry args={[width + 10, 0.45, 0.7]} />
        <meshStandardMaterial color="#526071" roughness={0.78} />
      </mesh>

      {/* ============================================================== */}
      {/* 2. HVAC VENTILATION DUCTS (MẠ KẼM BẠC)                         */}
      {/* ============================================================== */}
      {/* Central Big Supply Air Duct */}
      <mesh position={[0, height - 0.55, -1.8]}>
        <boxGeometry args={[width + 8, 0.42, 1.3]} />
        <meshStandardMaterial
          color="#e2e8f0"
          metalness={0.82}
          roughness={0.22}
        />
      </mesh>
      {/* Return Air Duct */}
      <mesh position={[0, height - 0.55, 1.8]}>
        <boxGeometry args={[width + 8, 0.38, 1.0]} />
        <meshStandardMaterial
          color="#e2e8f0"
          metalness={0.82}
          roughness={0.22}
        />
      </mesh>

      {/* ============================================================== */}
      {/* 3. FIRE PROTECTION SPRINKLER PIPES (HỆ THỐNG ỐNG PCCC ĐỎ RỰC) */}
      {/* ============================================================== */}
      {/* Main Red Fire Pipe running along driveway */}
      <mesh position={[0, height - 0.82, -3.2]}>
        <cylinderGeometry args={[0.075, 0.075, width + 8, 16]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#ef4444" metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[0, height - 0.82, 3.2]}>
        <cylinderGeometry args={[0.075, 0.075, width + 8, 16]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#ef4444" metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Branch Sprinkler Pipes & Drops */}
      {beamXList.map((x, idx) => (
        <group key={`sprinkler-branch-${idx}`} position={[x, height - 0.9, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.035, depth * 0.7, 12]} />
            <meshStandardMaterial color="#ef4444" metalness={0.4} roughness={0.3} />
          </mesh>
          {/* Sprinkler heads dropping down */}
          {[-4.5, 0, 4.5].map((z, sIdx) => (
            <mesh key={`sprink-${sIdx}`} position={[0, -0.12, z]}>
              <cylinderGeometry args={[0.015, 0.03, 0.08, 8]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ============================================================== */}
      {/* 4. INDUSTRIAL CABLE TRAYS (MÁNG CÁP ĐIỆN VÀNG/XÁM)             */}
      {/* ============================================================== */}
      <mesh position={[0, height - 0.45, -4.2]}>
        <boxGeometry args={[width + 8, 0.08, 0.55]} />
        <meshStandardMaterial color="#ca8a04" metalness={0.45} roughness={0.4} />
      </mesh>
      <mesh position={[0, height - 0.45, 4.2]}>
        <boxGeometry args={[width + 8, 0.08, 0.55]} />
        <meshStandardMaterial color="#475569" metalness={0.45} roughness={0.4} />
      </mesh>

      {/* ============================================================== */}
      {/* 5. CEILING FLUORESCENT LED LIGHT BARS                          */}
      {/* ============================================================== */}
      {/* High-output Industrial Linear LED Fixtures across the basement */}
      {beamXList.map((x, idx) => (
        <group key={`led-strip-${idx}`}>
          {/* Center Driveway Double LED Tube */}
          <group position={[x, height - 0.32, 0]}>
            <mesh>
              <boxGeometry args={[0.32, 0.06, 3.8]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={4.2} />
            </mesh>
            {/* Wide fill lighting from every 2nd beam */}
            {idx % 2 === 0 && (
              <pointLight color="#ffffff" intensity={2.8} distance={38} decay={0.8} />
            )}
          </group>
          {/* North Parking Bank LED Tube */}
          <group position={[x, height - 0.32, topBankZ + 2.8]}>
            <mesh>
              <boxGeometry args={[0.28, 0.06, 3.2]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={3.6} />
            </mesh>
            {idx % 2 === 1 && (
              <pointLight color="#f8fafc" intensity={2.2} distance={32} decay={0.8} />
            )}
          </group>
          {/* South Parking Bank LED Tube */}
          <group position={[x, height - 0.32, bottomBankZ - 2.8]}>
            <mesh>
              <boxGeometry args={[0.28, 0.06, 3.2]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={3.6} />
            </mesh>
            {idx % 2 === 1 && (
              <pointLight color="#f8fafc" intensity={2.2} distance={32} decay={0.8} />
            )}
          </group>
        </group>
      ))}

      {/* ============================================================== */}
      {/* 6. PERIMETER BASEMENT WALLS WITH REFLECTIVE BANDS & SIGNAGE    */}
      {/* ============================================================== */}
      {/* North Wall (Back) */}
      <group position={[0, height / 2, -halfD - 4.5]}>
        <mesh receiveShadow>
          <boxGeometry args={[width + 10, height, 0.6]} />
          <meshStandardMaterial color="#64748b" roughness={0.75} />
        </mesh>
        {/* Yellow-Black reflective warning band at 1m height */}
        <mesh position={[0, -height / 2 + 1.1, 0.32]}>
          <boxGeometry args={[width + 10, 0.28, 0.04]} />
          <meshStandardMaterial color="#eab308" emissive="#ca8a04" emissiveIntensity={0.2} />
        </mesh>
        {/* Wall Text: TẦNG HẦM B2 - VINCOM CENTER ĐỒNG KHỞI */}
        <Text
          position={[0, 0.6, 0.33]}
          fontSize={0.9}
          color="#f8fafc"
          anchorX="center"
          anchorY="middle"
        >
          {`TẦNG HẦM B2 • ${lotName.toUpperCase()} • TỐC ĐỘ TỐI ĐA 5 KM/H`}
        </Text>
      </group>

      {/* South Wall (Front) */}
      <group position={[0, height / 2, halfD + 4.5]}>
        <mesh receiveShadow>
          <boxGeometry args={[width + 10, height, 0.6]} />
          <meshStandardMaterial color="#64748b" roughness={0.75} />
        </mesh>
        <mesh position={[0, -height / 2 + 1.1, -0.32]}>
          <boxGeometry args={[width + 10, 0.28, 0.04]} />
          <meshStandardMaterial color="#eab308" emissive="#ca8a04" emissiveIntensity={0.2} />
        </mesh>
      </group>

      {/* East Wall (Right) */}
      <group position={[halfW + 4.5, height / 2, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[0.6, height, depth + 10]} />
          <meshStandardMaterial color="#64748b" roughness={0.75} />
        </mesh>
        <mesh position={[-0.32, -height / 2 + 1.1, 0]}>
          <boxGeometry args={[0.04, 0.28, depth + 10]} />
          <meshStandardMaterial color="#eab308" emissive="#ca8a04" emissiveIntensity={0.2} />
        </mesh>
      </group>

      {/* West Wall (Left) */}
      <group position={[-halfW - 4.5, height / 2, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[0.6, height, depth + 10]} />
          <meshStandardMaterial color="#64748b" roughness={0.75} />
        </mesh>
        <mesh position={[0.32, -height / 2 + 1.1, 0]}>
          <boxGeometry args={[0.04, 0.28, depth + 10]} />
          <meshStandardMaterial color="#eab308" emissive="#ca8a04" emissiveIntensity={0.2} />
        </mesh>
      </group>

      {/* ============================================================== */}
      {/* 7. VIETNAMESE CONCRETE COLUMNS (CỘT BÊ TÔNG CHUẨN HẦM VN)       */}
      {/* ============================================================== */}
      {columnPositions.map((colX, idx) => {
        const colCodeA = `B2 - A${String(idx + 1).padStart(2, "0")}`;
        const colCodeB = `B2 - B${String(idx + 1).padStart(2, "0")}`;

        return (
          <group key={`col-pair-${idx}`}>
            {/* North Row Column (Khu A - Vincom Blue) */}
            <group position={[colX, 0, topBankZ + 3.8]}>
              {/* Column Concrete Shaft */}
              <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.82, height, 0.82]} />
                <meshStandardMaterial color="#f1f5f9" roughness={0.7} />
              </mesh>
              {/* Yellow-Black Warning Stripes Base (0m to 1.1m) */}
              <mesh position={[0, 0.55, 0]}>
                <boxGeometry args={[0.86, 1.1, 0.86]} />
                <meshStandardMaterial color="#facc15" roughness={0.4} />
              </mesh>
              {/* Blue Zone Identification Band (1.6m to 2.5m) */}
              <mesh position={[0, 2.05, 0]}>
                <boxGeometry args={[0.85, 0.9, 0.85]} />
                <meshStandardMaterial color="#2563eb" roughness={0.5} />
              </mesh>
              {/* Column Code Badge on Front and Back */}
              <Text
                position={[0, 2.05, 0.44]}
                fontSize={0.28}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                {colCodeA}
              </Text>
              <Text
                position={[0, 2.05, -0.44]}
                rotation={[0, Math.PI, 0]}
                fontSize={0.28}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                {colCodeA}
              </Text>
              {/* Red Fire Extinguisher (Mounted on alternating columns) */}
              {idx % 2 === 0 && (
                <group position={[0.44, 1.35, 0]}>
                  <mesh>
                    <cylinderGeometry args={[0.09, 0.09, 0.52, 16]} />
                    <meshStandardMaterial color="#ef4444" metalness={0.4} roughness={0.3} />
                  </mesh>
                  <mesh position={[0, 0.28, 0]}>
                    <cylinderGeometry args={[0.03, 0.03, 0.1, 8]} />
                    <meshStandardMaterial color="#1f2937" />
                  </mesh>
                </group>
              )}
            </group>

            {/* South Row Column (Khu B - Golden Orange) */}
            <group position={[colX, 0, bottomBankZ - 3.8]}>
              <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.82, height, 0.82]} />
                <meshStandardMaterial color="#f1f5f9" roughness={0.7} />
              </mesh>
              <mesh position={[0, 0.55, 0]}>
                <boxGeometry args={[0.86, 1.1, 0.86]} />
                <meshStandardMaterial color="#facc15" roughness={0.4} />
              </mesh>
              <mesh position={[0, 2.05, 0]}>
                <boxGeometry args={[0.85, 0.9, 0.85]} />
                <meshStandardMaterial color="#f59e0b" roughness={0.5} />
              </mesh>
              <Text
                position={[0, 2.05, -0.44]}
                rotation={[0, Math.PI, 0]}
                fontSize={0.28}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                {colCodeB}
              </Text>
              <Text
                position={[0, 2.05, 0.44]}
                fontSize={0.28}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                {colCodeB}
              </Text>
            </group>
          </group>
        );
      })}

      {/* ============================================================== */}
      {/* 8. ELEVATOR LOBBY & ESCALATOR ENTRANCE (SẢNH THANG MÁY TTTM)   */}
      {/* ============================================================== */}
      {/* Elevator Lobby Structure at West End (Sảnh A) */}
      <group position={[-halfW + 1.2, 0, 0]}>
        {/* Granite Wall Façade */}
        <mesh position={[0, height / 2, 0]} receiveShadow>
          <boxGeometry args={[1.4, height, 9.2]} />
          <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.35} />
        </mesh>
        {/* Stainless Steel Elevator Doors (Double Door) */}
        <group position={[0.72, 1.2, -1.8]}>
          <mesh>
            <boxGeometry args={[0.06, 2.4, 1.6]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.96} roughness={0.08} />
          </mesh>
          {/* LED Floor Indicator (B2) */}
          <mesh position={[0.04, 1.45, 0]}>
            <boxGeometry args={[0.02, 0.28, 0.6]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          <Text position={[0.06, 1.45, 0]} rotation={[0, Math.PI / 2, 0]} fontSize={0.22} color="#ef4444">
            B2 ▲
          </Text>
        </group>
        {/* Second Elevator Door */}
        <group position={[0.72, 1.2, 1.8]}>
          <mesh>
            <boxGeometry args={[0.06, 2.4, 1.6]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.96} roughness={0.08} />
          </mesh>
          <mesh position={[0.04, 1.45, 0]}>
            <boxGeometry args={[0.02, 0.28, 0.6]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          <Text position={[0.06, 1.45, 0]} rotation={[0, Math.PI / 2, 0]} fontSize={0.22} color="#22c55e">
            B2 ▼
          </Text>
        </group>
        {/* Hanging Glassmorphic Overhead Signage */}
        <group position={[1.8, height - 1.1, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh>
            <boxGeometry args={[4.2, 0.75, 0.1]} />
            <meshStandardMaterial color="#1e293b" roughness={0.2} emissive="#0f172a" emissiveIntensity={0.3} />
          </mesh>
          <Text position={[0, 0.08, 0.06]} fontSize={0.26} color="#38bdf8" anchorX="center" anchorY="middle">
            THANG MÁY TTTM • SẢNH A (KHU TÂY)
          </Text>
          <Text position={[0, -0.2, 0.06]} fontSize={0.18} color="#94a3b8" anchorX="center" anchorY="middle">
            LỐI LÊN SIÊU THỊ & RẠP CHIẾU PHIM ⬆
          </Text>
        </group>
      </group>

      {/* ============================================================== */}
      {/* 9. OVERHEAD SUSPENDED TRAFFIC & EXIT SIGNS                     */}
      {/* ============================================================== */}
      {/* Exit Sign hanging near East end */}
      <group position={[halfW - 5.5, height - 1.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[3.2, 0.65, 0.08]} />
          <meshStandardMaterial color="#1e293b" roughness={0.2} emissive="#0f172a" emissiveIntensity={0.3} />
        </mesh>
        <Text position={[0, 0.06, 0.05]} fontSize={0.26} color="#22c55e" anchorX="center" anchorY="middle">
          LỐI RA XE HƠI / EXIT ↗
        </Text>
        <Text position={[0, -0.18, 0.05]} fontSize={0.16} color="#cbd5e1" anchorX="center" anchorY="middle">
          ĐƯỜNG LÊ THÁNH TÔN • CHIỀU CAO 2.2M
        </Text>
      </group>

      {/* Elevator Lobby Structure at East End (Sảnh B - Tháp Lê Thánh Tôn) */}
      <group position={[halfW - 1.2, 0, 0]}>
        <mesh position={[0, height / 2, 0]} receiveShadow>
          <boxGeometry args={[1.4, height, 9.2]} />
          <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.35} />
        </mesh>
        <group position={[-0.72, 1.2, -1.8]}>
          <mesh>
            <boxGeometry args={[0.06, 2.4, 1.6]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.96} roughness={0.08} />
          </mesh>
          <mesh position={[-0.04, 1.45, 0]}>
            <boxGeometry args={[0.02, 0.28, 0.6]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          <Text position={[-0.06, 1.45, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.22} color="#22c55e">
            B2 ▲
          </Text>
        </group>
        <group position={[-0.72, 1.2, 1.8]}>
          <mesh>
            <boxGeometry args={[0.06, 2.4, 1.6]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.96} roughness={0.08} />
          </mesh>
          <mesh position={[-0.04, 1.45, 0]}>
            <boxGeometry args={[0.02, 0.28, 0.6]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          <Text position={[-0.06, 1.45, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.22} color="#3b82f6">
            B2 ▼
          </Text>
        </group>
        <group position={[-1.8, height - 1.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh>
            <boxGeometry args={[4.2, 0.75, 0.1]} />
            <meshStandardMaterial color="#1e293b" roughness={0.2} emissive="#0f172a" emissiveIntensity={0.3} />
          </mesh>
          <Text position={[0, 0.08, 0.06]} fontSize={0.26} color="#38bdf8" anchorX="center" anchorY="middle">
            THANG MÁY TTTM • SẢNH B (KHU ĐÔNG)
          </Text>
          <Text position={[0, -0.2, 0.06]} fontSize={0.18} color="#94a3b8" anchorX="center" anchorY="middle">
            LỐI LÊN KHU ẨM THỰC & RẠP CHIẾU PHIM ⬆
          </Text>
        </group>
      </group>

      {/* Overhead Directional Lightboxes along the 145m driveway */}
      {[-halfW * 0.45, 0, halfW * 0.45].map((boxX, bIdx) => (
        <group key={`dir-lightbox-${bIdx}`} position={[boxX, height - 1.1, 0]}>
          <mesh>
            <boxGeometry args={[3.8, 0.65, 0.12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.25} emissive="#1e293b" emissiveIntensity={0.4} />
          </mesh>
          <Text position={[0, 0.08, 0.07]} fontSize={0.22} color="#38bdf8" anchorX="center" anchorY="middle">
            {bIdx === 0
              ? "← SẢNH A (THÁP ĐỒNG KHỞI) | KHU B (Ô 15 - 28) →"
              : bIdx === 1
              ? `TẦNG HẦM B2 • ${lotName.toUpperCase()} • 5 KM/H`
              : "← KHU SẠC XE ĐIỆN EV | SẢNH B (RẠP PHIM CGV) →"}
          </Text>
          <Text position={[0, -0.16, 0.07]} fontSize={0.16} color="#cbd5e1" anchorX="center" anchorY="middle">
            HỆ THỐNG ĐỖ XE THÔNG MINH SPOT-ACE AI 3D
          </Text>
        </group>
      ))}

      {/* Speed Bump / Gờ giảm tốc across central drive lane */}
      {[-halfW + 12, 0, halfW - 12].map((bumpX, bIdx) => (
        <group key={`speed-bump-${bIdx}`} position={[bumpX, 0.04, 0]}>
          <mesh rotation={[0, 0, 0]}>
            <boxGeometry args={[0.55, 0.06, laneWidth - 0.4]} />
            <meshStandardMaterial color="#eab308" roughness={0.5} />
          </mesh>
          {/* Black stripes on speed bump */}
          {[-3, -1.5, 0, 1.5, 3].map((bz, sz) => (
            <mesh key={`sb-stripe-${sz}`} position={[0, 0.032, bz]}>
              <boxGeometry args={[0.56, 0.005, 0.35]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
