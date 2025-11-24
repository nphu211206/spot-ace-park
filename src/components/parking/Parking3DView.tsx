import React, { useState, useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  OrbitControls, 
  Environment, 
  ContactShadows, 
  Html, 
  useCursor,
  Text,
  SoftShadows,
  Float,
  MeshReflectorMaterial,
  SpotLight,
  Instances,
  Instance,
  Sky,
  Cloud,
  Stars
} from "@react-three/drei";
import * as THREE from "three";
import { ParkingLot } from "@/pages/Parking";
import { toast } from "sonner";
import { CheckCircle2, Car as CarIcon, Zap, Info } from "lucide-react";

// ==========================================
// 1. HỆ THỐNG CẤU HÌNH & CONSTANTS (THE CORE)
// ==========================================
const CONFIG = {
    floorSize: 200,
    slotWidth: 3.5,
    slotDepth: 6,
    roadWidth: 8,
    carColors: ['#020617', '#f8fafc', '#b91c1c', '#1d4ed8', '#14532d', '#374151', '#d97706', '#7c3aed'],
    animationSpeed: 0.05,
    shadowResolution: 1024,
};

// --- Hàm tiện ích: Random có hạt giống (Deterministic Random) ---
// Giúp bãi xe luôn hiển thị giống nhau với cùng 1 ID, nhưng khác nhau giữa các ID
const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

// ==========================================
// 2. CÁC ASSETS 3D CAO CẤP (THE ASSETS)
// ==========================================

/**
 * Cây cối (Low-poly nhưng phong cách Art)
 * Sử dụng nhiều lớp hình học để tạo tán cây
 */
const MasterTree = ({ position, scale = 1 }: { position: [number, number, number], scale?: number }) => {
  return (
    <group position={position} scale={scale}>
      {/* Thân cây */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.3, 1.5, 8]} />
        <meshStandardMaterial color="#3e2723" roughness={1} />
      </mesh>
      {/* Tán lá 1 */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <dodecahedronGeometry args={[1]} />
        <meshStandardMaterial color="#15803d" roughness={0.8} />
      </mesh>
      {/* Tán lá 2 */}
      <mesh position={[0, 2.6, 0]} castShadow>
        <dodecahedronGeometry args={[0.7]} />
        <meshStandardMaterial color="#22c55e" roughness={0.8} />
      </mesh>
      {/* Tán lá 3 (Đỉnh) */}
      <mesh position={[0, 3.2, 0]} castShadow>
        <dodecahedronGeometry args={[0.4]} />
        <meshStandardMaterial color="#4ade80" roughness={0.8} />
      </mesh>
    </group>
  );
};

/**
 * Đèn đường cao áp (Volumetric Lighting)
 * Có hiệu ứng phát sáng và đèn SpotLight thực tế
 */
const StreetLamp = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      {/* Cột đèn */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 5, 8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Tay vươn */}
      <mesh position={[0.6, 4.8, 0]} rotation={[0, 0, -Math.PI/4]}>
        <cylinderGeometry args={[0.06, 0.06, 1.5, 8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Chao đèn */}
      <mesh position={[1.1, 5.2, 0]}>
        <boxGeometry args={[0.8, 0.15, 0.4]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* Bóng đèn phát sáng (Emissive) */}
      <mesh position={[1.1, 5.1, 0]}>
        <boxGeometry args={[0.6, 0.05, 0.3]} />
        <meshBasicMaterial color="#fef08a" toneMapped={false} />
      </mesh>
      {/* Ánh sáng thực tế (SpotLight) */}
      <SpotLight
        position={[1.1, 5, 0]}
        angle={0.6}
        penumbra={0.5}
        intensity={20} // Tăng cường độ sáng
        color="#fef08a"
        castShadow
        shadow-mapSize={[1024, 1024]}
        distance={15}
        attenuation={5}
        anglePower={4}
      />
      {/* Hiệu ứng quầng sáng giả lập (Fake Glow) */}
      <mesh position={[1.1, 4, 0]} rotation={[0,0,0]}>
         <sphereGeometry args={[0.3, 16, 16]} />
         <meshBasicMaterial color="#fef08a" transparent opacity={0.1} />
      </mesh>
    </group>
  );
};

/**
 * Xe Hơi Siêu Sang (Luxury Car)
 * Sử dụng vật liệu MeshPhysicalMaterial để tạo hiệu ứng sơn bóng loáng
 */
const LuxuryCar = ({ position, color, rotation = [0, 0, 0] }: any) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Bóng giả (Fake Shadow) để tối ưu hiệu năng */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]}>
         <planeGeometry args={[2.4, 4.6]} />
         <meshBasicMaterial color="#000" opacity={0.6} transparent />
      </mesh>

      {/* Thân xe (Sơn bóng clearcoat) */}
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.65, 4.4]} />
        <meshPhysicalMaterial 
            color={color} 
            metalness={0.6} 
            roughness={0.2} 
            clearcoat={1} // Lớp phủ bóng như xe thật
            clearcoatRoughness={0.1} 
            envMapIntensity={1.5} 
        />
      </mesh>

      {/* Cabin kính đen */}
      <mesh position={[0, 1.35, -0.2]} castShadow>
        <boxGeometry args={[1.65, 0.7, 2.4]} />
        <meshPhysicalMaterial 
            color="#111" 
            metalness={0.9} 
            roughness={0} 
            transmission={0} // Kính đen đặc
            clearcoat={1}
        />
      </mesh>

      {/* Bánh xe chi tiết hơn */}
      {[[-0.95, 1.2], [0.95, 1.2], [-0.95, -1.4], [0.95, -1.4]].map((pos, i) => (
        <group key={i} position={[pos[0], 0.38, pos[1]]} rotation={[Math.PI/2, 0, Math.PI/2]}>
            <mesh castShadow>
                <cylinderGeometry args={[0.38, 0.38, 0.4, 32]} />
                <meshStandardMaterial color="#171717" roughness={0.9} />
            </mesh>
            {/* Mâm xe (Rims) */}
            <mesh position={[0, 0.21, 0]}>
                <cylinderGeometry args={[0.25, 0.25, 0.05, 16]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
            </mesh>
        </group>
      ))}

      {/* Đèn pha LED Neon */}
      <mesh position={[0, 0.75, 2.21]}>
         <planeGeometry args={[1.7, 0.12]} />
         <meshBasicMaterial color="#ccfbf1" toneMapped={false} />
      </mesh>

      {/* Đèn hậu Neon đỏ */}
      <mesh position={[0, 0.75, -2.21]} rotation={[0, Math.PI, 0]}>
         <planeGeometry args={[1.8, 0.18]} />
         <meshBasicMaterial color="#ef4444" toneMapped={false} />
      </mesh>
    </group>
  );
};

// ==========================================
// 3. COMPONENT LOGIC (THE BRAIN)
// ==========================================

/**
 * Slot đỗ xe thông minh
 * Xử lý logic Hover, Click, và hiển thị trạng thái
 */
const ParkingSlot = ({ index, position, status, onSelect }: any) => {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered && status === 'free');

  // Màu sắc chỉ thị trạng thái
  const statusColor = useMemo(() => {
      if (status === 'occupied') return "#ef4444"; // Đỏ: Có người
      if (status === 'selected') return "#f59e0b"; // Vàng: Đang chọn
      return hovered ? "#3b82f6" : "#e2e8f0";      // Xanh/Trắng: Trống
  }, [status, hovered]);

  return (
    <group position={position}>
      {/* Sàn Slot (Trigger Zone) */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.02, 0]} 
        receiveShadow
        onPointerOver={() => status !== 'occupied' && setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          if (status === 'occupied') {
              toast.error("Vị trí này đã có người đặt!", { icon: <Zap className="text-red-500"/> });
          } else {
              onSelect();
          }
        }}
      >
        <planeGeometry args={[2.5, 5.5]} />
        <meshStandardMaterial 
            color={statusColor} 
            opacity={status === 'free' && !hovered ? 0.1 : 0.8} 
            transparent 
            roughness={1}
        />
      </mesh>

      {/* Vạch kẻ line phát sáng */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.3, 0.03, 0]}>
        <planeGeometry args={[0.15, 5.5]} />
        <meshBasicMaterial color={status === 'free' && hovered ? "#3b82f6" : "white"} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.3, 0.03, 0]}>
        <planeGeometry args={[0.15, 5.5]} />
        <meshBasicMaterial color={status === 'free' && hovered ? "#3b82f6" : "white"} toneMapped={false} />
      </mesh>

      {/* Gờ chặn bánh xe */}
      <mesh position={[0, 0.1, -2.4]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.15, 0.2]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>

      {/* Số Slot nổi 3D */}
      <Text
        position={[0, 0.05, 2.4]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.5}
        color={status === 'occupied' ? "#64748b" : (hovered ? "#2563eb" : "#94a3b8")}
        anchorX="center"
        anchorY="middle"
        fontWeight="900"
      >
        {`P-${index + 1}`}
      </Text>

      {/* Render Xe nếu có */}
      {status === 'occupied' && (
        <LuxuryCar 
            position={[0, 0, 0]} 
            color={CONFIG.carColors[index % CONFIG.carColors.length]} 
        />
      )}

      {/* Floating UI khi Hover (HTML Overlay) */}
      {status !== 'occupied' && hovered && (
        <Html position={[0, 3, 0]} center zIndexRange={[100, 0]}>
            <div className="transform transition-all duration-300 hover:scale-110 pointer-events-none">
                <div className="bg-blue-600/90 backdrop-blur-md text-white px-4 py-2 rounded-xl shadow-[0_10px_25px_-5px_rgba(37,99,235,0.5)] border-2 border-white/20 font-bold text-sm flex items-center gap-2 whitespace-nowrap animate-in fade-in zoom-in duration-200">
                    <CheckCircle2 className="w-4 h-4 text-white animate-pulse"/> 
                    <span>ĐẶT CHỖ P-{index+1}</span>
                </div>
                <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-blue-600 mx-auto opacity-90"></div>
            </div>
        </Html>
      )}
    </group>
  );
};

// ==========================================
// 4. MAIN SCENE (THE WORLD)
// ==========================================

const Parking3DView = ({ parkingLot, onBook }: { parkingLot: ParkingLot; onBook: (id: string) => void }) => {
  
  // Logic sinh dữ liệu giả lập dựa trên ID bãi xe (Deterministic)
  // Đảm bảo mỗi bãi xe có một sơ đồ đỗ xe riêng biệt nhưng cố định
  const slots = useMemo(() => {
    const total = parkingLot.total_spots || 24;
    // Ép kiểu string để tránh lỗi split() (Fix lỗi cũ)
    const lotIdStr = String(parkingLot.id); 
    const seedBase = lotIdStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    return Array.from({ length: total }).map((_, i) => {
        // Thuật toán random giả lập dựa trên seed để giữ map cố định khi re-render
        const rand = Math.abs(Math.sin(seedBase + i * 12.34) * 10000) % 1;
        // Luôn đảm bảo 45% chỗ trống, ưu tiên các slot cuối
        const isFree = rand > 0.55 || i > total - 5; 
        return { 
            id: `P-${i + 1}`, 
            status: isFree ? 'free' : 'occupied' 
        };
    });
  }, [parkingLot.id]);

  // Chia làm 2 hàng đối diện nhau
  const slotsPerRow = Math.ceil(slots.length / 2);

  return (
    <div className="w-full h-[650px] rounded-xl overflow-hidden border border-slate-200 shadow-2xl relative bg-slate-50 group">
      
      {/* --- UI OVERLAY (HUD) --- */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-lg flex items-center gap-4 animate-in slide-in-from-top-4 duration-700">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shadow-inner">
            <CarIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-slate-900 font-black text-xl tracking-tight">{parkingLot.name}</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live Digital Twin
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-10 pointer-events-none">
        <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-mono border border-white/10 flex items-center gap-2">
            <Info className="w-3 h-3"/> ROTATION: AUTO | ZOOM: ENABLED
        </div>
      </div>

      {/* --- 3D CANVAS --- */}
      <Canvas 
        shadows 
        dpr={[1, 2]} 
        camera={{ position: [-15, 20, 20], fov: 42 }} 
        gl={{ preserveDrawingBuffer: true, antialias: true }}
      >
        
        {/* --- MÔI TRƯỜNG & ÁNH SÁNG (High Quality Lighting) --- */}
        <color attach="background" args={['#f1f5f9']} />
        {/* Sương mù nhẹ để tạo chiều sâu điện ảnh */}
        <fog attach="fog" args={['#f1f5f9', 20, 90]} /> 
        <Environment preset="city" blur={1} />

        <ambientLight intensity={0.4} />
        <directionalLight 
            position={[50, 50, 25]} 
            intensity={1.2} 
            castShadow 
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
            shadow-camera-left={-30}
            shadow-camera-right={30}
            shadow-camera-top={30}
            shadow-camera-bottom={-30}
        />
        <SoftShadows size={15} samples={10} focus={0} />

        {/* Bầu trời & Mây */}
        <Sky sunPosition={[100, 20, 100]} turbidity={0.5} rayleigh={0.5} />
        <Cloud position={[-20, 10, -20]} opacity={0.3} speed={0.2} segments={20} />
        <Cloud position={[20, 15, -10]} opacity={0.3} speed={0.2} segments={20} />

        <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 2.2} // Không cho nhìn xuyên đất
            minDistance={5} 
            maxDistance={60}
            autoRotate
            autoRotateSpeed={0.8} // Quay chậm rãi sang trọng
            target={[0, 0, 0]}
        />

        {/* --- MẶT ĐẤT (REFLECTIVE FLOOR - SÀN EPOXY CAO CẤP) --- */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <MeshReflectorMaterial
            blur={[400, 100]}
            resolution={1024}
            mixBlur={1}
            mixStrength={40}
            roughness={1}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#e2e8f0"
            metalness={0.4}
            mirror={0} // Bắt buộc cho TS
          />
        </mesh>

        {/* --- CẢNH QUAN (TREES & LAMPS) --- */}
        {/* Hàng cây bên trái */}
        <MasterTree position={[-18, 0, -12]} scale={1.2} />
        <MasterTree position={[-18, 0, 0]} scale={1.5} />
        <MasterTree position={[-18, 0, 12]} scale={1.2} />
        {/* Hàng cây bên phải */}
        <MasterTree position={[18, 0, -12]} scale={1.3} />
        <MasterTree position={[18, 0, 0]} scale={1.1} />
        <MasterTree position={[18, 0, 12]} scale={1.4} />

        {/* Đèn đường chiếu sáng ban đêm (nếu cần) */}
        <StreetLamp position={[0, 0, -14]} />
        <StreetLamp position={[0, 0, 14]} />

        {/* --- KHU VỰC ĐỖ XE (CORE LOGIC) --- */}
        <group position={[-(slotsPerRow * 3.5) / 2 + 1.75, 0, 0]}>
          
          {/* Đường nhựa ở giữa */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(slotsPerRow * 3.5)/2 - 1.75, 0.005, 0]} receiveShadow>
             <planeGeometry args={[slotsPerRow * 3.6 + 4, CONFIG.roadWidth]} />
             <meshStandardMaterial color="#334155" roughness={0.9} />
          </mesh>
          {/* Vạch kẻ đường đứt đoạn */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(slotsPerRow * 3.5)/2 - 1.75, 0.01, 0]}>
             <planeGeometry args={[slotsPerRow * 3.6, 0.2]} />
             <meshBasicMaterial color="#facc15" />
          </mesh>

          {/* Render Các Slot */}
          {slots.map((slot, index) => {
            const row = Math.floor(index / slotsPerRow); // 0: Hàng trên, 1: Hàng dưới
            const col = index % slotsPerRow;
            
            // Tính toán vị trí z: Hàng trên z âm, Hàng dưới z dương
            const z = row === 0 ? -(CONFIG.roadWidth/2 + 3) : (CONFIG.roadWidth/2 + 3);
            const x = col * 3.5;
            // Quay xe: Hàng trên quay mặt xuống (PI), hàng dưới quay lên (0)
            const rotationY = row === 0 ? Math.PI : 0; 

            return (
              <group key={`${parkingLot.id}-${index}`} rotation={[0, rotationY, 0]}>
                  <ParkingSlot index={index} position={[x, 0, z]} status={slot.status} onSelect={() => onBook(slot.id)} />
              </group>
            );
          })}
        </group>
        
        <ContactShadows resolution={1024} scale={80} blur={2} opacity={0.4} far={10} color="#000000" />
      </Canvas>
    </div>
  );
};

export default Parking3DView;