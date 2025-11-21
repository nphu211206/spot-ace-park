import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Search, Mic, MicOff, Zap, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useVoiceRecognition } from "@/hooks/use-voice-recognition"; // Import cái Hook thần thánh vừa tạo

interface ParkingFiltersProps {
  onFilter: (filters: {
    search: string;
    minPrice: number;
    maxPrice: number;
    minRating: number;
  }) => void;
}

const ParkingFilters = ({ onFilter }: ParkingFiltersProps) => {
  // --- Local State Management ---
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [minRating, setMinRating] = useState([0]);

  // --- Master Voice AI Hook Integration ---
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    resetTranscript 
  } = useVoiceRecognition({
    onResult: (result) => {
      setSearch(result);
      toast.success(`Đã nhận lệnh: "${result}"`);
      triggerFilter(result, priceRange, minRating[0]);
    },
    onError: (err) => toast.error(err)
  });

  // --- Sync Voice Transcript Real-time ---
  useEffect(() => {
    if (isListening && transcript) {
      setSearch(transcript); // Hiển thị text ngay khi đang nói
    }
  }, [transcript, isListening]);

  // --- Centralized Filter Trigger (Single Source of Truth) ---
  const triggerFilter = (searchTerm: string, price: number[], rating: number) => {
    onFilter({
      search: searchTerm,
      minPrice: price[0],
      maxPrice: price[1],
      minRating: rating,
    });
  };

  // --- Handlers ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    triggerFilter(e.target.value, priceRange, minRating[0]);
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    triggerFilter(search, value, minRating[0]);
  };

  const handleRatingChange = (value: number[]) => {
    setMinRating(value);
    triggerFilter(search, priceRange, value[0]);
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
      toast.info("AI đang lắng nghe...", {
        description: "Hãy nói tên bãi xe hoặc khu vực (ví dụ: 'Quận 1')",
      });
    }
  };

  return (
    <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-xl sticky top-24 overflow-hidden transition-all duration-300 hover:shadow-primary/10">
      {/* --- Active Overlay Effect when Listening --- */}
      {isListening && (
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-blue-500/5 animate-pulse z-0 pointer-events-none" />
      )}

      <CardHeader className="pb-2 z-10 relative">
        <CardTitle className="flex items-center justify-between text-xl">
          <span className="flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent font-bold">
            <Filter className="w-5 h-5 text-primary" />
            Bộ Lọc AI
          </span>
          {isListening && (
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-8 z-10 relative">
        {/* --- SEARCH SECTION --- */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Tìm kiếm thông minh
          </Label>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
            <Input
              placeholder={isListening ? "Đang nghe..." : "Nhập hoặc bấm Mic..."}
              value={search}
              onChange={handleSearchChange}
              className={cn(
                "pl-10 pr-12 h-12 transition-all duration-300",
                "border-muted bg-white/50 focus:bg-white",
                "focus:ring-2 focus:ring-primary/20 focus:border-primary",
                isListening && "border-primary/50 ring-2 ring-primary/10 placeholder:text-primary/70"
              )}
            />
            
            {/* --- THE MASTER VOICE BUTTON --- */}
            <Button 
              variant="ghost"
              size="icon"
              onClick={handleVoiceToggle}
              className={cn(
                "absolute right-1 top-1 h-10 w-10 rounded-md transition-all duration-300",
                isListening 
                  ? "text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-600" 
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              )}
              title="Kích hoạt tìm kiếm giọng nói"
            >
              {isListening ? (
                <MicOff className="h-5 w-5 animate-pulse" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* --- PRICE SLIDER SECTION --- */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Khoảng giá
            </Label>
            <div className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
              <Zap className="w-3 h-3" />
              {priceRange[0]/1000}k - {priceRange[1]/1000}k
            </div>
          </div>
          <Slider
            min={0}
            max={100000}
            step={5000}
            value={priceRange}
            onValueChange={handlePriceChange}
            className="py-2"
          />
        </div>

        {/* --- RATING SLIDER SECTION --- */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Chất lượng
            </Label>
            <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-md">
              {minRating[0]} ⭐ trở lên
            </span>
          </div>
          <Slider
            min={0}
            max={5}
            step={0.5}
            value={minRating}
            onValueChange={handleRatingChange}
            className="py-2"
          />
        </div>
        
        {/* --- DECORATIVE ELEMENTS (PRO FEEL) --- */}
        <div className="pt-4 text-center">
             <p className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.2em] font-light">
                Powered by Spot Ace AI
             </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParkingFilters;