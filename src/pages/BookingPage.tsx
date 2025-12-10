import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Clock, MapPin, Car, ShieldCheck, Loader2, CloudRain, Zap, CreditCard, QrCode, Ticket } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import PaymentGateway from "@/components/payment/PaymentGateway"; // Đảm bảo đường dẫn đúng

const BookingPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const spotId = searchParams.get("spot") || "A-01";
  const navigate = useNavigate();

  // State
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [parkingLot, setParkingLot] = useState<any>(null);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [user, setUser] = useState<any>(null);
  const [duration, setDuration] = useState(2); // Mặc định 2 giờ
  const [txnId, setTxnId] = useState("");

  // Load Data
  useEffect(() => {
    const userData = localStorage.getItem('spot_user');
    if (!userData) {
        toast.error("Vui lòng đăng nhập để thực hiện giao dịch!");
        navigate('/auth');
        return;
    }
    setUser(JSON.parse(userData));

    // Fetch Parking Info
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

  // Xử lý khi bấm nút Thanh Toán (Mở Modal)
  const handleBookingInit = () => {
    if (!vehicleNumber) return toast.error("Hệ thống cần biển số xe để định danh!");
    if (vehicleNumber.length < 4) return toast.error("Biển số không hợp lệ!");
    
    // Mở cổng thanh toán
    setShowPayment(true);
  };

  // Callback khi thanh toán thành công từ PaymentGateway
  const onPaymentSuccess = (transactionId: string) => {
    setTxnId(transactionId);
    setSuccess(true);
    toast.success(`Giao dịch thành công: ${transactionId}`);
    
    // Âm thanh vé in ra
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3');
    audio.play().catch(()=>{});
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-center flex-col gap-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-blue-400 font-mono animate-pulse">ĐANG TẢI DỮ LIỆU TỪ BLOCKCHAIN...</p>
    </div>
  );

  // Tính tổng tiền
  const totalCost = parkingLot ? (parkingLot.current_price || parkingLot.base_price) * duration : 0;

  // --- SUCCESS SCREEN (VÉ ĐIỆN TỬ - DIGITAL TICKET) ---
  if (success) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
           {/* Confetti Effect Background */}
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-900/20 to-slate-950 pointer-events-none"></div>
           
           <Card className="w-full max-w-md bg-slate-900 text-white border-emerald-500/50 border-2 shadow-[0_0_60px_rgba(16,185,129,0.2)] relative z-10 overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 animate-pulse"></div>
               
               <CardHeader className="text-center border-b border-slate-800 pb-6 bg-slate-950/50">
                   <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3 border border-emerald-500/20 shadow-inner">
                        <ShieldCheck className="w-8 h-8 text-emerald-400"/>
                   </div>
                   <CardTitle className="text-2xl text-emerald-400 font-black uppercase tracking-widest">VÉ ĐIỆN TỬ</CardTitle>
                   <CardDescription className="text-slate-500 font-mono text-xs mt-1">Mã GD: {txnId}</CardDescription>
               </CardHeader>

               <CardContent className="space-y-6 pt-8 px-8">
                   <div className="bg-white p-3 rounded-2xl w-fit mx-auto shadow-2xl shadow-emerald-900/50 border-4 border-white">
                       <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${vehicleNumber}_${txnId}`} alt="QR" className="rounded-lg mix-blend-multiply" />
                   </div>
                   
                   <div className="text-center space-y-1">
                        <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-bold">Biển Số Định Danh</p>
                        <p className="font-mono text-4xl font-black text-white tracking-wider drop-shadow-md">{vehicleNumber}</p>
                   </div>

                   <div className="space-y-3 text-sm bg-slate-800/40 p-5 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                       <div className="flex justify-between items-center">
                           <span className="text-slate-400">Vị trí đỗ:</span> 
                           <span className="font-bold text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded border border-yellow-400/20 shadow-[0_0_10px_rgba(250,204,21,0.1)]">{spotId}</span>
                       </div>
                       <div className="flex justify-between items-center">
                           <span className="text-slate-400">Thời gian vào:</span> 
                           <span className="font-mono text-white">{format(new Date(), "HH:mm dd/MM/yyyy", { locale: vi })}</span>
                       </div>
                       <div className="flex justify-between items-center border-t border-slate-700/50 pt-3 mt-3">
                           <span className="text-slate-400">Đã thanh toán:</span> 
                           <span className="font-black text-emerald-400 text-xl">{totalCost.toLocaleString()}đ</span>
                       </div>
                   </div>
                   
                   <div className="text-center">
                        <p className="text-[10px] text-slate-500 italic flex items-center justify-center gap-2">
                            <Ticket className="w-3 h-3"/> Xuất trình mã này tại cổng kiểm soát
                        </p>
                   </div>
               </CardContent>

               <CardFooter className="grid grid-cols-2 gap-4 bg-slate-950 p-6 border-t border-slate-800">
                   <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors" onClick={() => navigate('/')}>Trang Chủ</Button>
                   <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-[0_0_20px_rgba(5,150,105,0.3)] transition-all hover:scale-105" onClick={() => navigate('/scanner')}>Mở Máy Quét</Button>
               </CardFooter>
           </Card>
        </div>
      );
  }

  // --- BOOKING FORM SCREEN ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid md:grid-cols-12 gap-8">
            
            {/* LEFT: THÔNG TIN BÃI XE & AI ANALYSIS */}
            <div className="md:col-span-7 space-y-6 animate-in slide-in-from-left-10 duration-700">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{parkingLot.name}</h1>
                    <div className="flex items-center text-slate-500 dark:text-slate-400 gap-2 font-medium">
                        <MapPin className="w-4 h-4 text-primary" /> {parkingLot.address}
                    </div>
                </div>

                {/* AI Pricing Card */}
                <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-none shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-30 transition-opacity">
                        <Zap className="w-32 h-32 rotate-12 text-indigo-400" />
                    </div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-300 text-sm uppercase tracking-widest font-bold">
                            <Zap className="w-4 h-4" /> AI Dynamic Pricing v2.0
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs text-indigo-200 uppercase font-semibold mb-1">Giá thời gian thực</p>
                                <div className="text-5xl font-black text-white tracking-tighter">
                                    {parkingLot.current_price.toLocaleString()}đ <span className="text-lg font-medium text-indigo-300">/ h</span>
                                </div>
                            </div>
                            {parkingLot.current_price > parkingLot.base_price && (
                                <Badge variant="destructive" className="animate-pulse px-3 py-1 text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                                    <Zap className="w-3 h-3 mr-1 fill-white"/> Cao điểm +{Math.round((parkingLot.current_price/parkingLot.base_price - 1)*100)}%
                                </Badge>
                            )}
                        </div>
                        
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-sm space-y-3 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-indigo-200"><CloudRain className="w-4 h-4 text-blue-400"/> Thời tiết:</span>
                                <span className="font-bold text-blue-300">Mưa lớn (Khu vực Q1)</span>
                            </div>
                            <div className="flex items-center justify-between border-t border-white/5 pt-2">
                                <span className="flex items-center gap-2 text-indigo-200"><Clock className="w-4 h-4 text-yellow-400"/> Nhu cầu:</span>
                                <span className="font-bold text-yellow-300">Cao điểm (17:00 - 19:00)</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-indigo-300/60 italic text-right">* Cập nhật tự động bởi SpotAce Neural Engine.</p>
                    </CardContent>
                </Card>

                {/* Slot Info */}
                <div className="flex gap-5 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg items-center">
                    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-600/20 rounded-full flex items-center justify-center border border-blue-200 dark:border-blue-500/30">
                        <Car className="w-7 h-7 text-blue-600 dark:text-blue-400"/>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Vị trí đã chọn</p>
                        <p className="text-3xl font-black dark:text-white mt-1">{spotId}</p>
                    </div>
                </div>
            </div>

            {/* RIGHT: BOOKING FORM */}
            <div className="md:col-span-5 animate-in slide-in-from-right-10 duration-700">
                <Card className="border-0 shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800 sticky top-24">
                    <CardHeader className="bg-slate-50 dark:bg-slate-950 border-b dark:border-slate-800 pb-6">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <CreditCard className="w-5 h-5 text-primary"/> Xác Nhận Đặt Chỗ
                        </CardTitle>
                        <CardDescription>Hoàn tất thông tin để giữ chỗ ngay lập tức</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Biển số xe định danh</Label>
                            <div className="relative group">
                                <Car className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <Input 
                                    value={vehicleNumber} 
                                    onChange={e => setVehicleNumber(e.target.value.toUpperCase())} 
                                    placeholder="29A-123.45" 
                                    className="pl-12 text-lg font-mono uppercase border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 h-12 focus:ring-2 focus:ring-primary/20 transition-all font-bold" 
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <Label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Thời gian đỗ</Label>
                                <span className="font-black text-primary text-lg">{duration} giờ</span>
                            </div>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(h => (
                                    <button 
                                        key={h}
                                        onClick={() => setDuration(h)}
                                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all border ${duration === h ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-105' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary/50'}`}
                                    >
                                        {h}h
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <Separator className="my-4"/>
                        
                        <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between text-sm text-slate-500">
                                <span>Đơn giá</span>
                                <span className="font-mono">{parkingLot.current_price.toLocaleString()}đ / h</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-500">
                                <span>Thời gian</span>
                                <span className="font-mono">x {duration}h</span>
                            </div>
                            <div className="flex justify-between items-end pt-3 border-t border-slate-200 dark:border-slate-800 mt-2">
                                <span className="font-bold text-sm dark:text-white uppercase tracking-wider">TỔNG THANH TOÁN</span>
                                <span className="text-3xl font-black text-primary tracking-tight">{totalCost.toLocaleString()}đ</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-4 bg-slate-50 dark:bg-slate-950 p-6 border-t dark:border-slate-800">
                        <Button 
                            size="lg" 
                            className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-1 bg-gradient-to-r from-primary to-indigo-600" 
                            onClick={handleBookingInit} 
                        >
                            <QrCode className="mr-2 h-6 w-6"/> THANH TOÁN NGAY
                        </Button>
                        <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1.5 opacity-70">
                            <ShieldCheck className="w-3 h-3 text-green-500"/> Giao dịch được bảo mật 2 lớp bởi SpotAce Secure™
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
      </main>

      {/* COMPONENT THANH TOÁN RỜI - ĐƯỢC GỌI VÀO ĐÂY */}
      <PaymentGateway 
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={onPaymentSuccess}
        amount={totalCost}
        bookingId={parkingLot?.id?.toString() || "temp_id"}
      />
    </div>
  );
};

export default BookingPage;