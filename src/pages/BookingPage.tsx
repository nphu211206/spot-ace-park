import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Clock, MapPin, Car, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const BookingPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const spotId = searchParams.get("spot") || "A-01";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [parkingLot, setParkingLot] = useState<any>(null);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('spot_user');
    if (!userData) {
        toast.error("Vui lòng đăng nhập!");
        navigate('/auth');
        return;
    }
    setUser(JSON.parse(userData));

    // Lấy thông tin bãi xe từ API Local
    fetch(`http://localhost:3000/api/parking-lots/${id}`)
      .then(res => res.json())
      .then(data => {
          setParkingLot(data);
          setLoading(false);
      })
      .catch(() => {
          toast.error("Lỗi tải thông tin bãi xe");
          navigate("/parking");
      });
  }, [id, navigate]);

  const handleBooking = async () => {
    if (!vehicleNumber) return toast.error("Nhập biển số xe!");
    setProcessing(true);

    try {
      const totalCost = parkingLot.current_price * 2; // Demo 2h
      const startTime = new Date().toISOString();
      const endTime = new Date(Date.now() + 7200000).toISOString();

      const res = await fetch('http://localhost:3000/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              userId: user.id,
              lotId: parkingLot.id,
              vehicleNumber,
              totalCost,
              startTime,
              endTime
          })
      });
      
      const result = await res.json();
      if (!result.success) throw new Error("Lỗi đặt chỗ");

      setSuccess(true);
      toast.success("Đặt chỗ thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center">Loading...</div>;

  if (success) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
           <Card className="w-full max-w-md bg-slate-800 text-white border-green-500 border-2">
               <CardHeader className="text-center">
                   <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4"/>
                   <CardTitle className="text-2xl text-green-400">ĐẶT CHỖ THÀNH CÔNG</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                   <div className="bg-white p-4 rounded-xl w-fit mx-auto">
                       <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${vehicleNumber}`} alt="QR" />
                   </div>
                   <p className="text-center font-mono text-lg">{vehicleNumber}</p>
                   <div className="space-y-2 text-sm bg-slate-700 p-4 rounded">
                       <div className="flex justify-between"><span>Bãi xe:</span> <b>{parkingLot.name}</b></div>
                       <div className="flex justify-between"><span>Vị trí:</span> <b className="text-yellow-400">{spotId}</b></div>
                       <div className="flex justify-between"><span>Thời gian:</span> <b>{format(new Date(), "HH:mm dd/MM", { locale: vi })}</b></div>
                   </div>
               </CardContent>
               <CardFooter className="flex gap-2">
                   <Button variant="outline" className="flex-1 text-black" onClick={() => navigate('/')}>Về trang chủ</Button>
                   <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => navigate('/bookings')}>Xem lịch sử</Button>
               </CardFooter>
           </Card>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
            <CardHeader><CardTitle>Xác nhận đặt chỗ</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label>Biển số xe</Label>
                        <Input value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value.toUpperCase())} placeholder="Ví dụ: 29A-12345" className="text-lg font-mono uppercase" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted rounded flex items-center gap-3"><MapPin className="text-primary"/> <div><p className="text-xs text-muted-foreground">Bãi xe</p><p className="font-bold">{parkingLot.name}</p></div></div>
                        <div className="p-4 bg-muted rounded flex items-center gap-3"><Car className="text-primary"/> <div><p className="text-xs text-muted-foreground">Vị trí</p><p className="font-bold">{spotId}</p></div></div>
                    </div>
                </div>
                <Separator />
                <div className="flex justify-between items-end">
                    <span className="font-bold text-lg">Tổng cộng</span>
                    <span className="text-3xl font-bold text-primary">{(parkingLot.current_price * 2).toLocaleString()}đ</span>
                </div>
            </CardContent>
            <CardFooter>
                <Button size="lg" className="w-full" onClick={handleBooking} disabled={processing}>
                    {processing ? <Loader2 className="animate-spin" /> : <><ArrowRight className="mr-2"/> Xác nhận thanh toán</>}
                </Button>
            </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default BookingPage;