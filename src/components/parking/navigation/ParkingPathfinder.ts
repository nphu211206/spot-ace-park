import * as THREE from "three";

export type IndoorLandmark = {
  id: string;
  name: string;
  description: string;
  zone: string;
  position: [number, number, number];
};

export type PathNavigationResult = {
  waypoints: THREE.Vector3[];
  curve: THREE.CatmullRomCurve3;
  totalDistanceMeters: number;
  estimatedWalkSeconds: number;
  instructions: string[];
};

export function getIndoorLandmarks(deckWidth: number, lotDepth: number): IndoorLandmark[] {
  const halfW = deckWidth / 2;
  void lotDepth;

  return [
    {
      id: "elevator_a",
      name: "Thang Máy Sảnh A (Khu Tây)",
      description: "Cửa Thang Máy TTTM Vincom • Lối Lên Siêu Thị & Rạp Phim",
      zone: "Khu Tây - Sảnh B2 Tháp A",
      position: [-halfW + 6.0, 0, 0],
    },
    {
      id: "elevator_b",
      name: "Thang Máy Sảnh B (Khu Đông)",
      description: "Cửa Thang Máy TTTM Vincom • Lối Lên Khu Ẩm Thực & Thời Trang",
      zone: "Khu Đông - Sảnh B2 Tháp B",
      position: [halfW - 6.0, 0, 0],
    },
    {
      id: "main_entrance",
      name: "Lối Đi Bộ Cổng Hầm",
      description: "Cạnh bốt kiểm soát vé barrier vào hầm đường Lê Thánh Tôn",
      zone: "Cổng Chính Hầm B2",
      position: [-halfW + 8.5, 0, 0],
    },
  ];
}

/**
 * Calculates a clean, realistic indoor path aligned with central basement aisles.
 */
export function calculateIndoorPath(
  startPos: [number, number, number],
  targetSlotPos: [number, number, number],
  slotRow: number,
  slotCode: string,
  landmarkName: string,
  aisleZ: number = 0
): PathNavigationResult {
  const points: THREE.Vector3[] = [];

  const startV = new THREE.Vector3(startPos[0], 0.12, startPos[2]);
  const targetV = new THREE.Vector3(targetSlotPos[0], 0.12, targetSlotPos[2]);

  points.push(startV.clone());

  // Step 1: Step out from elevator foyer onto the central driving aisle
  if (Math.abs(startPos[2] - aisleZ) > 0.3) {
    points.push(new THREE.Vector3(startPos[0] + 1.2, 0.12, startPos[2]));
    points.push(new THREE.Vector3(startPos[0] + 2.2, 0.12, aisleZ));
  }

  // Step 2: Traverse along central driving aisle towards target slot X
  // Add intermediate point if distance is significant
  const midX = (startPos[0] + targetSlotPos[0]) / 2;
  if (Math.abs(startPos[0] - targetSlotPos[0]) > 8) {
    points.push(new THREE.Vector3(midX, 0.12, aisleZ));
  }

  // Point right opposite to slot on the aisle centerline
  points.push(new THREE.Vector3(targetSlotPos[0], 0.12, aisleZ));

  // Step 3: Turn 90 degrees into the parking slot aisle
  const approachOffsetZ = slotRow === 0 ? -3.5 : 3.5;
  points.push(new THREE.Vector3(targetSlotPos[0], 0.12, targetSlotPos[2] - approachOffsetZ));

  // Final destination right at the front bumper of the car
  points.push(targetV.clone());

  // Calculate total path distance
  let totalDistance = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalDistance += points[i].distanceTo(points[i + 1]);
  }

  // Create smooth Catmull-Rom spline with rounded 90-degree corners
    // Create smooth Catmull-Rom spline with standard uniform catmullrom to prevent centripetal boundary indexing bugs
  const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);

  // Estimated walking time (average mall walking speed = 1.2 m/s)
  const walkingSeconds = Math.max(8, Math.round(totalDistance / 1.2));

  // Human-readable turn-by-turn guidance
  const instructions: string[] = [];
  instructions.push(`Khởi hành từ ${landmarkName}`);
  instructions.push(`Đi thẳng theo làn đường trung tâm tầng hầm B2 (${Math.round(totalDistance * 0.7)}m)`);
  if (slotRow === 0) {
    instructions.push(`Rẽ trái vào dãy ô đỗ Khu A (Cột biển B2-A)`);
  } else {
    instructions.push(`Rẽ phải vào dãy ô đỗ Khu B (Cột biển B2-B)`);
  }
  instructions.push(`Tới vị trí xe của bạn tại ô ${slotCode}`);

  return {
    waypoints: points,
    curve,
    totalDistanceMeters: Math.round(totalDistance * 10) / 10,
    estimatedWalkSeconds: walkingSeconds,
    instructions,
  };
}

/**
 * Safely evaluates a CatmullRomCurve3 point at progress t (0 to 1) with boundary clamping.
 */
export function safeGetPointAt(curve: THREE.CatmullRomCurve3 | null | undefined, t: number): THREE.Vector3 {
  if (!curve || !curve.points || curve.points.length === 0) {
    return new THREE.Vector3(0, 0, 0);
  }
  const clamped = Math.max(0, Math.min(0.9999, isNaN(t) ? 0 : t));
  try {
    return curve.getPointAt(clamped);
  } catch {
    const idx = Math.min(curve.points.length - 1, Math.floor(clamped * curve.points.length));
    return curve.points[idx] || new THREE.Vector3(0, 0, 0);
  }
}
