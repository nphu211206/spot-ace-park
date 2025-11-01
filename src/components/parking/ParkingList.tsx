import { ParkingLot } from "@/pages/Parking";
import ParkingCard from "./ParkingCard";

interface ParkingListProps {
  parkingLots: ParkingLot[];
}

const ParkingList = ({ parkingLots }: ParkingListProps) => {
  if (parkingLots.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Không tìm thấy bãi đỗ xe phù hợp</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {parkingLots.map((lot) => (
        <ParkingCard key={lot.id} parkingLot={lot} />
      ))}
    </div>
  );
};

export default ParkingList;