import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Search } from "lucide-react";

interface ParkingFiltersProps {
  onFilter: (filters: {
    search: string;
    minPrice: number;
    maxPrice: number;
    minRating: number;
  }) => void;
}

const ParkingFilters = ({ onFilter }: ParkingFiltersProps) => {
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [minRating, setMinRating] = useState([0]);

  const handleFilterChange = () => {
    onFilter({
      search,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      minRating: minRating[0],
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bộ lọc</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Tìm kiếm</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tên bãi, địa chỉ..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                handleFilterChange();
              }}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Giá (đ/giờ)</Label>
          <Slider
            min={0}
            max={100000}
            step={5000}
            value={priceRange}
            onValueChange={(value) => {
              setPriceRange(value);
              handleFilterChange();
            }}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{priceRange[0].toLocaleString()}đ</span>
            <span>{priceRange[1].toLocaleString()}đ</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Đánh giá tối thiểu</Label>
          <Slider
            min={0}
            max={5}
            step={0.5}
            value={minRating}
            onValueChange={(value) => {
              setMinRating(value);
              handleFilterChange();
            }}
          />
          <div className="text-sm text-muted-foreground">
            {minRating[0]} sao trở lên
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParkingFilters;