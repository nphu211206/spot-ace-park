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
  return [
    {
      id: "elevator_a",
      name: "Thang Máy Sảnh A (Khu Tây)",
      description: "Cạnh cửa thoát hiểm số 1 & Khu Trung Tâm Thương Mại",
      zone: "Khu Tây - Sảnh R1/R2",
      position: [-halfW + 2.5, 0, -lotDepth * 0.28],
    },
    {
      id: "elevator_b",
      name: "Thang Máy Sảnh B (Khu Đông)",
      description: "Lối lên Rạp Chiếu Phim & Siêu Thị",
      zone: "Khu Đông - Sảnh R5/R6",
      position: [halfW - 2.5, 0, -lotDepth * 0.28],
    },
    {
      id: "main_entrance",
      name: "Lối Vào Xe Hơi & Đi Bộ",
      description: "Cạnh bốt bảo vệ barrier kiểm soát vé",
      zone: "Cổng Chính Hầm",
      position: [-halfW - 0.8, 0, 0],
    },
  ];
}

/**
 * Calculates a clean, non-colliding indoor waypoint path from a landmark to a parking slot.
 * Follows central driving aisles and makes proper 90-degree turns (adapted from findmycar).
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

  const startV = new THREE.Vector3(startPos[0], 0.08, startPos[2]);
  const targetV = new THREE.Vector3(targetSlotPos[0], 0.08, targetSlotPos[2]);

  points.push(startV.clone());

  // If start is not on the central aisle, step out onto the aisle centerline first
  if (Math.abs(startPos[2] - aisleZ) > 0.5) {
    points.push(new THREE.Vector3(startPos[0], 0.08, aisleZ));
  }

  // Intermediate point on aisle opposite to slot X
  const oppositeSlotAisle = new THREE.Vector3(targetSlotPos[0], 0.08, aisleZ);
  points.push(oppositeSlotAisle);

  // Turn into the slot: approach point slightly in front of the slot center
  const approachOffsetZ = slotRow === 0 ? -1.8 : 1.8;
  const approachPoint = new THREE.Vector3(
    targetSlotPos[0],
    0.08,
    targetSlotPos[2] + approachOffsetZ
  );
  points.push(approachPoint);

  // Final destination at slot nose
  points.push(targetV.clone());

  // Calculate total distance along polyline
  let totalDistance = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalDistance += points[i].distanceTo(points[i + 1]);
  }

  // Build a smooth Catmull-Rom spline with rounded corners
  const curve = new THREE.CatmullRomCurve3(points, false, "centripetal", 0.2);

  // Estimate walking time (average walking speed = 1.3 m/s)
  const walkingSeconds = Math.max(10, Math.round(totalDistance / 1.3));

  // Build human-friendly turn-by-turn guidance instructions
  const instructions: string[] = [];
  instructions.push(`Khởi hành từ ${landmarkName}`);
  if (Math.abs(startPos[2] - aisleZ) > 0.5) {
    instructions.push(`Đi thẳng khoảng ${Math.round(Math.abs(startPos[2] - aisleZ))}m ra hành lang chính`);
  }
  const aisleDist = Math.round(Math.abs(targetSlotPos[0] - startPos[0]));
  if (aisleDist > 2) {
    const dir = targetSlotPos[0] > startPos[0] ? "phải" : "trái";
    instructions.push(`Đi dọc theo hành lang trung tâm khoảng ${aisleDist}m`);
  }
  const turnDirection = slotRow === 0 ? "rẽ trái" : "rẽ phải";
  instructions.push(`${turnDirection.toUpperCase()} tiến thẳng vào ô đỗ ${slotCode}`);
  instructions.push(`Đã tới xe của bạn!`);

  return {
    waypoints: points,
    curve,
    totalDistanceMeters: Math.round(totalDistance),
    estimatedWalkSeconds: walkingSeconds,
    instructions,
  };
}
