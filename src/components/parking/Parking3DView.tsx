import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  ContactShadows, 
  Html, 
  useCursor,
  Text
} from "@react-three/drei";
import * as THREE from "three";
import { ParkingLot } from "@/pages/Parking";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// --- TYPES & CONFIG ---
interface Parking3DViewProps {
  parkingLot: ParkingLot;
  onBook: (spotId: string) => void;
}

// --- 3D ASSETS & GEOMETRY (Vẽ xe và chỗ đỗ) ---

// Component vẽ một chiếc xe ô tô Low-poly
const CarModel = ({ position, color = "#ef4444" }: { position: [number, number, number], color?: string }) => {
  return (
    <group position={position}>
      {/* Thân xe */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.5, 3.8]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Nóc xe */}
      <mesh position={[0, 1.0, -0.2]} castShadow>
        <boxGeometry args={[1.6, 0.5, 2]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Bánh xe */}
      <mesh position={[-0.9, 0.25, 1.2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[0.9, 0.25, 1.2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[-0.9, 0.25, -1.2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[0.9, 0.25, -1.2]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </group>
  );
};

// Component vẽ một vị trí đỗ xe (Slot)
const ParkingSlot = ({ 
  index, 
  position, 
  isOccupied, 
  onSelect 
}: { 
  index: number; 
  position: [number, number, number]; 
  isOccupied: boolean; 
  onSelect: () => void;
}) => {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered); // Đổi con trỏ chuột khi hover

  // Màu sắc trạng thái: Đỏ = Có xe, Xanh = Trống, Vàng = Đang hover
  const slotColor = isOccupied ? "#374151" : (hovered ? "#fbbf24" : "#22c55e");
  const statusText = isOccupied ? "Đã Đặt" : "Trống";

  return (
    <group position={position}>
      {/* Mặt sàn chỗ đỗ */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.01, 0]} 
        receiveShadow
        onPointerOver={() => !isOccupied && setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          if (!isOccupied) onSelect();
          else toast.warning("Vị trí này đã có người đặt!");
        }}
      >
        <planeGeometry args={[2.2, 4.8]} />
        <meshStandardMaterial 
          color={slotColor} 
          transparent 
          opacity={0.8} 
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>

      {/* Vạch kẻ đường (Line marking) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.15, 0.02, 0]}>
        <planeGeometry args={[0.1, 4.8]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.15, 0.02, 0]}>
        <planeGeometry args={[0.1, 4.8]} />
        <meshBasicMaterial color="white" />
      </mesh>

      {/* Số thứ tự slot */}
      <Text
        position={[0, 0.1, 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {`A-${index + 1}`}
      </Text>

      {/* Nếu có xe thì vẽ xe, không thì hiện Popup thông tin */}
      {isOccupied ? (
        <CarModel position={[0, 0, 0]} color={`hsl(${Math.random() * 360}, 70%, 50%)`} />
      ) : (
        hovered && (
          <Html position={[0, 2, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
            <div className="bg-black/80 text-white p-2 rounded-lg text-xs font-bold whitespace-nowrap border border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)] backdrop-blur-md">
              BẤM ĐỂ ĐẶT CHỖ A-{index + 1}
            </div>
          </Html>
        )
      )}
    </group>
  );
};

// --- MAIN SCENE COMPONENT ---
const Parking3DView = ({ parkingLot, onBook }: Parking3DViewProps) => {
  // Giả lập trạng thái các slot dựa trên available_spots của bãi xe
  // Logic: Tạo mảng slot, đánh dấu ngẫu nhiên một số slot là "Đã có xe" để demo
  const slots = useMemo(() => {
    const total = parkingLot.total_spots || 20;
    const occupiedCount = total - parkingLot.available_spots;
    
    // Tạo mảng trạng thái ngẫu nhiên (nhưng cố định với seed giả lập)
    return Array.from({ length: total }).map((_, i) => ({
      id: `slot-${i}`,
      isOccupied: i < occupiedCount // Đơn giản hóa: Xếp xe vào các slot đầu
    }));
  }, [parkingLot]);

  // Sắp xếp slot thành 2 hàng đối diện nhau
  const rows = 2;
  const slotsPerRow = Math.ceil(slots.length / rows);

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden border border-border shadow-2xl relative group">
      <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md p-3 rounded-lg border border-white/10">
        <h3 className="text-white font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          3D LIVE VIEW
        </h3>
        <p className="text-xs text-gray-300 mt-1">Dùng chuột để xoay và zoom</p>
      </div>

      <Canvas shadows dpr={[1, 2]}>
        {/* --- CAMERA & CONTROLS --- */}
        <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={50} />
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          maxPolarAngle={Math.PI / 2.2} // Không cho nhìn xuyên xuống đất
          autoRotate={true}
          autoRotateSpeed={0.5}
        />

        {/* --- LIGHTING (Ánh sáng môi trường) --- */}
        <ambientLight intensity={0.5} />
        <spotLight 
          position={[10, 20, 10]} 
          angle={0.3} 
          penumbra={1} 
          intensity={2} 
          castShadow 
          shadow-mapSize={[2048, 2048]} 
        />
        <Environment preset="city" />

        {/* --- SCENE CONTENT --- */}
        <group position={[-(slotsPerRow * 1.5) / 2, 0, 0]}>
          {slots.map((slot, index) => {
            const row = Math.floor(index / slotsPerRow);
            const col = index % slotsPerRow;
            // Tính toán vị trí x, z cho từng slot
            // Hàng 0: z = -4, Hàng 1: z = 4
            const z = row === 0 ? -4 : 4;
            const x = col * 2.5; // Khoảng cách giữa các xe
            
            // Quay xe hàng đối diện lại
            const rotationY = row === 0 ? 0 : Math.PI;

            return (
              <group key={slot.id} rotation={[0, rotationY, 0]}>
                <ParkingSlot 
                  index={index} 
                  position={[x, 0, z]} 
                  isOccupied={slot.isOccupied} 
                  onSelect={() => onBook(slot.id)}
                />
              </group>
            );
          })}

          {/* Đường đi ở giữa */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(slotsPerRow * 2.5) / 2 - 1.25, 0.005, 0]}>
            <planeGeometry args={[slotsPerRow * 3, 6]} />
            <meshStandardMaterial color="#333" roughness={0.8} />
          </mesh>
        </group>

        {/* --- GROUND (Mặt đất) --- */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#111" roughness={1} />
        </mesh>
        
        <ContactShadows resolution={1024} scale={50} blur={2} opacity={0.5} far={10} color="#000000" />
      </Canvas>
    </div>
  );
};

export default Parking3DView;