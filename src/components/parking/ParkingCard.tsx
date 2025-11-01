import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Car } from "lucide-react";
import { ParkingLot } from "@/pages/Parking";

interface ParkingCardProps {
  parkingLot: ParkingLot;
}

const ParkingCard = ({ parkingLot }: ParkingCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{parkingLot.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4" />
              {parkingLot.address}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            {parkingLot.rating.toFixed(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {parkingLot.description && (
          <p className="text-sm text-muted-foreground">{parkingLot.description}</p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm">
              {parkingLot.available_spots}/{parkingLot.total_spots} chỗ trống
            </span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              {parkingLot.current_price.toLocaleString()}đ
            </p>
            <p className="text-xs text-muted-foreground">/ giờ</p>
          </div>
        </div>

        {parkingLot.amenities && parkingLot.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {parkingLot.amenities.map((amenity, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
          </div>
        )}

        <Button 
          className="w-full" 
          onClick={() => navigate(`/parking/${parkingLot.id}`)}
        >
          Đặt chỗ ngay
        </Button>
      </CardContent>
    </Card>
  );
};

export default ParkingCard;