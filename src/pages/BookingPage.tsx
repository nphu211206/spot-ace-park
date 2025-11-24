import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Clock, MapPin, Car, ShieldCheck, ArrowRight, Loader2, CloudRain, Zap, CreditCard, QrCode } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

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
  const [duration, setDuration] = useState(2); // Mặc định 2 giờ

  useEffect(() => {
    const userData = localStorage.getItem('spot_user');
    if (!userData) {
        toast.error("Vui lòng đăng nhập để thực hiện giao dịch!");
        navigate('/auth');
        return;
    }
    setUser(JSON.parse(userData));

    // Gọi API lấy thông tin bãi xe (có kèm AI Pricing từ server.js)
    fetch(`http://localhost:3000/api/parking-lots/${id}`)
      .then(res => res.json())
      .then(data => {
          setParkingLot(data);
          setLoading(false);
      })
      .catch(() => {
          toast.error("Mất kết nối với Ma Trận Dữ Liệu (Server)");
          navigate("/parking");
      });
  }, [id, navigate]);

  const handleBooking = async () => {
    if (!vehicleNumber) return toast.error("Hệ thống cần biển số xe để định danh!");
    if (vehicleNumber.length < 5) return toast.error("Biển số không hợp lệ!");
    
    setProcessing(true);

    // Giả lập độ trễ của "Smart Contract"
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const totalCost = (parkingLot.current_price || parkingLot.base_price) * duration;
      const startTime = new Date().toISOString();
      const endTime = new Date(Date.now() + duration * 3600000).toISOString();

      const res = await fetch('http://localhost:3000/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              userId: user.id,
              lotId: parkingLot.id,
              vehicleNumber: vehicleNumber.toUpperCase(),
              totalCost,
              startTime,
              endTime
          })
      });
      
      const result = await res.json();
      if (!result.success) throw new Error("Giao dịch thất bại");

      setSuccess(true);
      toast.success("Giao dịch Smart Parking hoàn tất!");
      // Phát âm thanh thanh toán thành công
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3');
      audio.play().catch(()=>{});

    } catch (error) {
      toast.error("Lỗi xử lý giao dịch blockchain (giả lập)");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-center flex-col gap-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-blue-400 font-mono animate-pulse">ĐANG TẢI DỮ LIỆU TỪ BLOCKCHAIN...</p>
    </div>
  );

  // --- SUCCESS SCREEN (VÉ ĐIỆN TỬ) ---
  if (success) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
           {/* Confetti Effect Background */}
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
           
           <Card className="w-full max-w-md bg-slate-900 text-white border-emerald-500 border-2 shadow-[0_0_50px_rgba(16,185,129,0.3)] relative z-10">
               <CardHeader className="text-center border-b border-slate-800 pb-6">
                   <div className="mx-auto w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 animate-bounce">
                        <ShieldCheck className="w-10 h-10 text-emerald-400"/>
                   </div>
                   <CardTitle className="text-3xl text-emerald-400 font-black uppercase tracking-wider">VÉ ĐIỆN TỬ</CardTitle>
                   <CardDescription className="text-slate-400">Giao dịch #{(Math.random()*1000000).toFixed(0)}</CardDescription>
               </CardHeader>
               <CardContent className="space-y-6 pt-6">
                   <div className="bg-white p-4 rounded-xl w-fit mx-auto shadow-lg">
                       <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${vehicleNumber}`} alt="QR" />
                   </div>
                   
                   <div className="text-center space-y-1">
                        <p className="text-slate-400 text-sm uppercase tracking-widest">Biển Số Định Danh</p>
                        <p className="font-mono text-3xl font-bold text-white tracking-wider">{vehicleNumber}</p>
                   </div>

                   <div className="space-y-3 text-sm bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                       <div className="flex justify-between items-center">
                           <span className="text-slate-400">Vị trí đỗ:</span> 
                           <span className="font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded border border-yellow-400/30">{spotId}</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-slate-400">Thời gian vào:</span> 
                           <span className="font-mono">{format(new Date(), "HH:mm dd/MM/yyyy", { locale: vi })}</span>
                       </div>
                       <div className="flex justify-between border-t border-slate-700 pt-2 mt-2">
                           <span className="text-slate-400">Đã thanh toán:</span> 
                           <span className="font-bold text-emerald-400 text-lg">{(parkingLot.current_price * duration).toLocaleString()}đ</span>
                       </div>
                   </div>
                   
                   <div className="text-center">
                        <p className="text-xs text-slate-500 italic">Vui lòng đưa mã QR này vào máy quét tại cổng ra vào.</p>
                   </div>
               </CardContent>
               <CardFooter className="grid grid-cols-2 gap-4 bg-slate-950/50 p-6">
                   <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => navigate('/')}>Trang Chủ</Button>
                   <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)]" onClick={() => navigate('/scanner')}>Mở Scanner</Button>
               </CardFooter>
           </Card>
        </div>
      );
  }

  // --- BOOKING FORM ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid md:grid-cols-12 gap-8">
            
            {/* LEFT: THÔNG TIN BÃI XE & AI ANALYSIS */}
            <div className="md:col-span-7 space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{parkingLot.name}</h1>
                    <div className="flex items-center text-slate-500 dark:text-slate-400 gap-2">
                        <MapPin className="w-4 h-4" /> {parkingLot.address}
                    </div>
                </div>

                {/* AI Pricing Card */}
                <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-none shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-3 opacity-20">
                        <Zap className="w-24 h-24 rotate-12" />
                    </div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-300">
                            <Zap className="w-5 h-5" /> AI Dynamic Pricing Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-sm text-slate-300">Giá hiện tại (Real-time)</p>
                                <div className="text-4xl font-bold text-white mt-1">
                                    {parkingLot.current_price.toLocaleString()}đ <span className="text-lg font-normal text-slate-400">/ giờ</span>
                                </div>
                            </div>
                            {parkingLot.current_price > parkingLot.base_price && (
                                <Badge variant="destructive" className="animate-pulse">
                                    Giá tăng {Math.round((parkingLot.current_price/parkingLot.base_price - 1)*100)}%
                                </Badge>
                            )}
                        </div>
                        
                        <div className="bg-white/10 p-3 rounded-lg border border-white/10 text-sm space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2"><CloudRain className="w-4 h-4 text-blue-400"/> Điều kiện thời tiết:</span>
                                <span className="font-bold text-blue-300">Mưa lớn (Khu vực Q1)</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-yellow-400"/> Nhu cầu đặt chỗ:</span>
                                <span className="font-bold text-yellow-300">Cao điểm (17:00 - 19:00)</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 italic">* Giá được cập nhật tự động bởi hệ thống AI mỗi 5 phút.</p>
                    </CardContent>
                </Card>

                {/* Slot Info */}
                <div className="flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Car className="w-6 h-6 text-blue-600 dark:text-blue-400"/>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Vị trí đã chọn</p>
                        <p className="text-xl font-bold dark:text-white">{spotId}</p>
                    </div>
                </div>
            </div>

            {/* RIGHT: BOOKING FORM */}
            <div className="md:col-span-5">
                <Card className="border-0 shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800 sticky top-24">
                    <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b dark:border-slate-800">
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5"/> Thanh Toán & Xác Nhận
                        </CardTitle>
                        <CardDescription>Hoàn tất thủ tục để giữ chỗ</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-2">
                            <Label>Biển số xe định danh</Label>
                            <div className="relative">
                                <Car className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input 
                                    value={vehicleNumber} 
                                    onChange={e => setVehicleNumber(e.target.value.toUpperCase())} 
                                    placeholder="Ví dụ: 29A-123.45" 
                                    className="pl-10 text-lg font-mono uppercase border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 h-12" 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Thời gian đỗ dự kiến</Label>
                                <span className="font-bold text-primary">{duration} giờ</span>
                            </div>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(h => (
                                    <button 
                                        key={h}
                                        onClick={() => setDuration(h)}
                                        className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${duration === h ? 'bg-primary text-white shadow-lg scale-105' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}
                                    >
                                        {h}h
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm text-slate-500">
                                <span>Đơn giá</span>
                                <span>{parkingLot.current_price.toLocaleString()}đ / h</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-500">
                                <span>Thời gian</span>
                                <span>x {duration}h</span>
                            </div>
                            <div className="flex justify-between items-end pt-2">
                                <span className="font-bold text-lg dark:text-white">TỔNG CỘNG</span>
                                <span className="text-3xl font-black text-primary">{(parkingLot.current_price * duration).toLocaleString()}đ</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-3 bg-slate-50 dark:bg-slate-900/50 p-6">
                        <Button 
                            size="xl" 
                            className="w-full text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1" 
                            onClick={handleBooking} 
                            disabled={processing}
                        >
                            {processing ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> ĐANG XỬ LÝ BLOCKCHAIN...</>
                            ) : (
                                <><QrCode className="mr-2 h-5 w-5"/> THANH TOÁN NGAY</>
                            )}
                        </Button>
                        <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
                            <ShieldCheck className="w-3 h-3"/> Giao dịch được bảo mật bởi SpotAce Secure
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
      </main>
    </div>
  );
};

export default BookingPage;