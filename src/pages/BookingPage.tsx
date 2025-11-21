import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, CreditCard, MapPin, Car, ShieldCheck, ArrowRight, Loader2, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const BookingPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const spotId = searchParams.get("spot") || "A-01"; // Lấy vị trí từ 3D map
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [parkingLot, setParkingLot] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [vehicleNumber, setVehicleNumber] = useState("");
  
  // Dữ liệu giả lập AI phân tích (Pro Feature)
  const aiInsights = {
    weather: "Trời nắng gắt (UV 9.0)",
    advice: "Vị trí này có mái che, bảo vệ sơn xe tốt hơn 40%.",
    demand: "Cao điểm",
    priceModifier: "+10%"
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Lấy thông tin bãi xe
      const { data: lot, error } = await supabase
        .from("parking_lots")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setParkingLot(lot);
      
      // Tự động điền biển số xe từ profile (nếu có)
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name") // Giả sử có trường vehicle_number thì lấy luôn
          .eq("id", user.id)
          .single();
      }
    } catch (error) {
      toast.error("Không tìm thấy thông tin bãi xe");
      navigate("/parking");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đặt chỗ");
      navigate("/auth");
      return;
    }
    if (!vehicleNumber) {
      toast.error("Vui lòng nhập biển số xe");
      return;
    }

    setProcessing(true);

    try {
      // 1. Giả lập thanh toán (delay 2s)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 2. Lưu vào Database
      const totalCost = parkingLot.current_price * 2; // Giả sử đặt 2 tiếng
      const { error } = await supabase.from("bookings").insert({
        user_id: user.id,
        parking_lot_id: parkingLot.id,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 7200000).toISOString(), // +2h
        total_cost: totalCost,
        deposit_amount: totalCost * 0.5, // Cọc 50%
        status: 'confirmed',
        vehicle_number: vehicleNumber,
        notes: `Đặt qua App - Vị trí ${spotId}`
      });

      if (error) throw error;

      setSuccess(true);
      toast.success("Đặt chỗ thành công!");

    } catch (error: any) {
      toast.error("Lỗi đặt chỗ: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

  if (success) {
    // --- GIAO DIỆN VÉ ĐIỆN TỬ (SUCCESS) ---
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-green-500 bg-slate-900 text-white shadow-[0_0_50px_rgba(34,197,94,0.3)] animate-in zoom-in-95 duration-500">
          <CardHeader className="text-center border-b border-slate-800">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-400">ĐẶT CHỖ THÀNH CÔNG</CardTitle>
            <CardDescription className="text-slate-400">Vé điện tử của bạn đã sẵn sàng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* MÃ QR ĐỂ QUÉT */}
            <div className="bg-white p-4 rounded-xl mx-auto w-fit">
              {/* Sử dụng API tạo QR miễn phí để không cần cài thư viện */}
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${vehicleNumber}`} 
                alt="QR Code" 
                className="w-40 h-40 mix-blend-multiply"
              />
            </div>
            <p className="text-center text-xs text-slate-500 font-mono">MÃ: {vehicleNumber}</p>

            <div className="space-y-3 text-sm bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Bãi xe:</span>
                <span className="font-medium">{parkingLot.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vị trí:</span>
                <span className="font-bold text-yellow-400">{spotId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Biển số:</span>
                <span className="font-mono font-bold">{vehicleNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thời gian:</span>
                <span>{format(new Date(), "HH:mm dd/MM/yyyy", { locale: vi })}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="outline" className="flex-1 border-slate-700 hover:bg-slate-800 text-black" onClick={() => navigate("/")}>Trang chủ</Button>
            <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => navigate("/bookings")}>Xem lịch sử</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // --- GIAO DIỆN THANH TOÁN (CHECKOUT) ---
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI: THÔNG TIN BÃI XE */}
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Xác nhận đặt chỗ</h1>
              <p className="text-muted-foreground">Vui lòng kiểm tra thông tin trước khi thanh toán</p>
            </div>

            {/* THẺ AI PHÂN TÍCH (SÁNG TẠO) */}
            <Card className="border-l-4 border-l-purple-500 bg-purple-50/50 dark:bg-purple-900/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-purple-600 flex items-center gap-2 uppercase tracking-wider">
                   <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></div>
                   AI Spot Analysis™
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                   <div>
                     <p className="text-muted-foreground">Thời tiết:</p>
                     <p className="font-medium">{aiInsights.weather}</p>
                   </div>
                   <div>
                     <p className="text-muted-foreground">Lời khuyên:</p>
                     <p className="font-medium text-green-600">{aiInsights.advice}</p>
                   </div>
                   <div>
                     <p className="text-muted-foreground">Nhu cầu:</p>
                     <Badge variant="destructive" className="text-[10px]">{aiInsights.demand}</Badge>
                   </div>
                   <div>
                     <p className="text-muted-foreground">Giá động:</p>
                     <p className="font-mono text-red-500">{aiInsights.priceModifier}</p>
                   </div>
                </div>
              </CardContent>
            </Card>

            {/* FORM THÔNG TIN */}
            <Card>
              <CardHeader><CardTitle>Thông tin xe</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Biển số xe (Bắt buộc)</Label>
                  <div className="relative">
                    <Car className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Ví dụ: 29A-12345" 
                      className="pl-10 uppercase font-mono text-lg"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Đây sẽ là mã định danh để AI quét khi bạn vào bãi.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vị trí đã chọn</Label>
                    <div className="p-3 bg-muted rounded-md font-bold flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" /> {spotId}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Thời gian bắt đầu</Label>
                    <div className="p-3 bg-muted rounded-md font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" /> Ngay bây giờ
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CỘT PHẢI: THANH TOÁN */}
          <div className="md:col-span-1">
            <Card className="sticky top-24 shadow-xl border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle>Tổng thanh toán</CardTitle>
                <CardDescription>Bao gồm thuế và phí dịch vụ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Giá cơ bản (2h)</span>
                  <span>{(parkingLot.current_price * 2).toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-600">Phí giờ cao điểm (AI)</span>
                  <span className="text-purple-600">+10,000đ</span>
                </div>
                <Separator />
                <div className="flex justify-between items-end">
                  <span className="font-bold">Tổng cộng</span>
                  <span className="text-3xl font-bold text-primary">
                    {((parkingLot.current_price * 2) + 10000).toLocaleString()}đ
                  </span>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                  <CreditCard className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Thanh toán an toàn qua ví điện tử hoặc thẻ tín dụng. Hủy miễn phí trước 15 phút.</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-hero shadow-glow hover:scale-[1.02] transition-all"
                  onClick={handleBooking}
                  disabled={processing}
                >
                  {processing ? (
                    <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý... </>
                  ) : (
                    <> Xác nhận & Thanh toán <ArrowRight className="ml-2 h-4 w-4" /> </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingPage;