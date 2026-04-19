import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Car,
  Clock,
  CloudRain,
  CreditCard,
  MapPin,
  Minus,
  Plus,
  QrCode,
  ShieldCheck,
  Ticket,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import PaymentGateway from "@/components/payment/PaymentGateway";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { buildBookingQrUrl, StoredBooking, upsertLocalBooking } from "@/lib/booking-storage";
import {
  calculateParkingPrice,
  clampParkingDuration,
  formatDurationLabel,
  getBookingWindow,
  MAX_PARKING_DURATION_MINUTES,
  MIN_PARKING_DURATION_MINUTES,
  PARKING_DURATION_STEP_MINUTES,
} from "@/lib/parking-pricing";

const BookingPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const spotId = searchParams.get("spot") || "A01";
  const navigate = useNavigate();

  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [parkingLot, setParkingLot] = useState<any>(null);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [bookingStartTime, setBookingStartTime] = useState<Date | null>(null);
  const [txnId, setTxnId] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<StoredBooking | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("spot_user");

    if (!userData) {
      toast.error("Vui lòng đăng nhập để thực hiện giao dịch!");
      navigate("/auth");
      return;
    }

    fetch(`http://localhost:3000/api/parking-lots/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setParkingLot(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Mất kết nối với Ma Trận Dữ Liệu (Server)");
        navigate("/parking");
      });
  }, [id, navigate]);

  const hourlyRate = parkingLot ? parkingLot.current_price || parkingLot.base_price : 0;
  const pricing = calculateParkingPrice(hourlyRate, durationMinutes);
  const totalCost = pricing.totalCost;
  const bookingWindow = useMemo(
    () => getBookingWindow(bookingStartTime || new Date(), durationMinutes),
    [bookingStartTime, durationMinutes],
  );

  const adjustDuration = (deltaMinutes: number) => {
    setDurationMinutes((current) => clampParkingDuration(current + deltaMinutes));
  };

  const handleBookingInit = () => {
    if (!vehicleNumber) {
      toast.error("Hệ thống cần biển số xe để định danh!");
      return;
    }

    if (vehicleNumber.length < 4) {
      toast.error("Biển số không hợp lệ!");
      return;
    }

    setBookingStartTime(new Date());
    setShowPayment(true);
  };

  const buildBookingDraft = (transactionId: string): StoredBooking => {
    const userStr = localStorage.getItem("spot_user");
    const user = userStr ? JSON.parse(userStr) : null;
    const currentBookingWindow = getBookingWindow(bookingStartTime || new Date(), durationMinutes);

    return {
      id: Date.now(),
      user_id_int: Number(user?.id || 0),
      parking_lot_id: Number(parkingLot?.id || id || 0),
      parking_name: parkingLot?.name || "SpotAce Parking",
      address: parkingLot?.address || "",
      vehicle_number: vehicleNumber,
      total_cost: totalCost,
      status: "confirmed",
      start_time: currentBookingWindow.startTime.toISOString(),
      end_time: currentBookingWindow.endTime.toISOString(),
      created_at: new Date().toISOString(),
      spot_id: spotId,
      transaction_id: transactionId,
      duration_minutes: durationMinutes,
    };
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    const bookingDraft = buildBookingDraft(transactionId);

    try {
      const response = await fetch("http://localhost:3000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: bookingDraft.user_id_int,
          lotId: bookingDraft.parking_lot_id,
          vehicleNumber: bookingDraft.vehicle_number,
          totalCost: bookingDraft.total_cost,
          startTime: bookingDraft.start_time,
          endTime: bookingDraft.end_time,
          durationMinutes: bookingDraft.duration_minutes,
          spotId: bookingDraft.spot_id,
          transactionId: bookingDraft.transaction_id,
        }),
      });

      if (!response.ok) {
        throw new Error("Booking persistence failed");
      }

      const data = await response.json();
      const persistedBooking: StoredBooking = {
        ...bookingDraft,
        ...(data.booking || {}),
        transaction_id: data.booking?.transaction_id || bookingDraft.transaction_id,
        spot_id: data.booking?.spot_id || bookingDraft.spot_id,
        duration_minutes: data.booking?.duration_minutes || bookingDraft.duration_minutes,
      };

      upsertLocalBooking(persistedBooking);
      setConfirmedBooking(persistedBooking);
      setTxnId(persistedBooking.transaction_id || transactionId);
      setSuccess(true);
      toast.success(`Giao dịch thành công: ${persistedBooking.transaction_id || transactionId}`);
    } catch {
      upsertLocalBooking(bookingDraft);
      setConfirmedBooking(bookingDraft);
      setTxnId(transactionId);
      setSuccess(true);
      toast.success(`Giao dịch thành công: ${transactionId}`);
      toast.error("Máy chủ lưu booking đang lỗi, vé đã được lưu tạm trên trình duyệt của bạn.");
    }

    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3");
    audio.play().catch(() => {});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center flex-col gap-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-blue-400 font-mono animate-pulse">ĐANG TẢI DỮ LIỆU TỪ BLOCKCHAIN...</p>
      </div>
    );
  }

  const ticketBooking = confirmedBooking || {
    id: "preview",
    user_id_int: 0,
    parking_lot_id: Number(parkingLot?.id || id || 0),
    parking_name: parkingLot?.name || "SpotAce Parking",
    address: parkingLot?.address || "",
    vehicle_number: vehicleNumber,
    total_cost: totalCost,
    status: "confirmed",
    start_time: bookingWindow.startTime.toISOString(),
    end_time: bookingWindow.endTime.toISOString(),
    created_at: new Date().toISOString(),
    spot_id: spotId,
    transaction_id: txnId,
    duration_minutes: durationMinutes,
  } satisfies StoredBooking;

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-900/20 to-slate-950 pointer-events-none"></div>

        <Card className="w-full max-w-md bg-slate-900 text-white border-emerald-500/50 border-2 shadow-[0_0_60px_rgba(16,185,129,0.2)] relative z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 animate-pulse"></div>

          <CardHeader className="text-center border-b border-slate-800 pb-6 bg-slate-950/50">
            <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3 border border-emerald-500/20 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <CardTitle className="text-2xl text-emerald-400 font-black uppercase tracking-widest">VÉ ĐIỆN TỬ</CardTitle>
            <CardDescription className="text-slate-500 font-mono text-xs mt-1">
              Mã GD: {ticketBooking.transaction_id || txnId}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-8 px-8">
            <div className="bg-white p-3 rounded-2xl w-fit mx-auto shadow-2xl shadow-emerald-900/50 border-4 border-white">
              <img
                src={buildBookingQrUrl(ticketBooking, 180)}
                alt="QR"
                className="rounded-lg mix-blend-multiply"
              />
            </div>

            <div className="text-center space-y-1">
              <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-bold">Biển Số Định Danh</p>
              <p className="font-mono text-4xl font-black text-white tracking-wider drop-shadow-md">{ticketBooking.vehicle_number}</p>
            </div>

            <div className="space-y-3 text-sm bg-slate-800/40 p-5 rounded-xl border border-slate-700/50 backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Vị trí đỗ:</span>
                <span className="font-bold text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded border border-yellow-400/20 shadow-[0_0_10px_rgba(250,204,21,0.1)]">
                  {ticketBooking.spot_id}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Thời gian vào:</span>
                <span className="font-mono text-white">{format(new Date(ticketBooking.start_time), "HH:mm dd/MM/yyyy", { locale: vi })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Thời lượng:</span>
                <span className="font-bold text-white">
                  {formatDurationLabel(ticketBooking.duration_minutes || durationMinutes)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Rời bãi dự kiến:</span>
                <span className="font-mono text-cyan-300">{format(new Date(ticketBooking.end_time), "HH:mm dd/MM/yyyy", { locale: vi })}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-700/50 pt-3 mt-3">
                <span className="text-slate-400">Đã thanh toán:</span>
                <span className="font-black text-emerald-400 text-xl">{Number(ticketBooking.total_cost).toLocaleString()}đ</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-[10px] text-slate-500 italic flex items-center justify-center gap-2">
                <Ticket className="w-3 h-3" /> Xuất trình mã này tại cổng kiểm soát
              </p>
            </div>
          </CardContent>

          <CardFooter className="grid grid-cols-2 gap-4 bg-slate-950 p-6 border-t border-slate-800">
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              onClick={() => navigate("/")}
            >
              Trang Chủ
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-[0_0_20px_rgba(5,150,105,0.3)] transition-all hover:scale-105"
              onClick={() => navigate("/scanner")}
            >
              Mở Máy Quét
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-7 space-y-6 animate-in slide-in-from-left-10 duration-700">
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{parkingLot.name}</h1>
              <div className="flex items-center text-slate-500 dark:text-slate-400 gap-2 font-medium">
                <MapPin className="w-4 h-4 text-primary" /> {parkingLot.address}
              </div>
            </div>

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
                    <p className="text-xs text-indigo-200 uppercase font-semibold mb-1">Giá thực thời gian</p>
                    <div className="text-5xl font-black text-white tracking-tighter">
                      {hourlyRate.toLocaleString()}đ <span className="text-lg font-medium text-indigo-300">/ h</span>
                    </div>
                  </div>
                  {parkingLot.current_price > parkingLot.base_price && (
                    <Badge variant="destructive" className="animate-pulse px-3 py-1 text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                      <Zap className="w-3 h-3 mr-1 fill-white" /> Cao điểm +
                      {Math.round((parkingLot.current_price / parkingLot.base_price - 1) * 100)}%
                    </Badge>
                  )}
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-sm space-y-3 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-indigo-200">
                      <CloudRain className="w-4 h-4 text-blue-400" /> Thời tiết:
                    </span>
                    <span className="font-bold text-blue-300">Mưa lớn (Khu vực Q1)</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/5 pt-2">
                    <span className="flex items-center gap-2 text-indigo-200">
                      <Clock className="w-4 h-4 text-yellow-400" /> Nhu cầu:
                    </span>
                    <span className="font-bold text-yellow-300">Cao điểm (17:00 - 19:00)</span>
                  </div>
                </div>
                <p className="text-[10px] text-indigo-300/60 italic text-right">
                  * Cập nhật tự động bởi SpotAce Neural Engine.
                </p>
              </CardContent>
            </Card>

            <div className="flex gap-5 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg items-center">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-600/20 rounded-full flex items-center justify-center border border-blue-200 dark:border-blue-500/30">
                <Car className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Vị trí đã chọn</p>
                <p className="text-3xl font-black dark:text-white mt-1">{spotId}</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 animate-in slide-in-from-right-10 duration-700">
            <Card className="border-0 shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800 sticky top-24">
              <CardHeader className="bg-slate-50 dark:bg-slate-950 border-b dark:border-slate-800 pb-6">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CreditCard className="w-5 h-5 text-primary" /> Xác Nhận Đặt Chỗ
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
                      onChange={(event) => setVehicleNumber(event.target.value.toUpperCase())}
                      placeholder="29A-123.45"
                      className="pl-12 text-lg font-mono uppercase border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 h-12 focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Thời gian đỗ</Label>
                    <span className="font-black text-primary text-lg">{formatDurationLabel(durationMinutes)}</span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center justify-between gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-2xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                        disabled={durationMinutes <= MIN_PARKING_DURATION_MINUTES}
                        onClick={() => adjustDuration(-PARKING_DURATION_STEP_MINUTES)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>

                      <div className="flex-1 text-center">
                        <p className="text-3xl font-black text-slate-900 dark:text-white">{formatDurationLabel(durationMinutes)}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-400">
                          Bước nhảy {PARKING_DURATION_STEP_MINUTES} phút
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-2xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                        disabled={durationMinutes >= MAX_PARKING_DURATION_MINUTES}
                        onClick={() => adjustDuration(PARKING_DURATION_STEP_MINUTES)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                      <span>Tối thiểu 30 phút</span>
                      <span>Tối đa 24 giờ</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Đơn giá</span>
                    <span className="font-mono">{pricing.hourlyRate.toLocaleString()}đ / giờ</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Block 30 phút</span>
                    <span className="font-mono">{pricing.halfHourRate.toLocaleString()}đ / 30 phút</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Thời gian đã chọn</span>
                    <span className="font-mono">{formatDurationLabel(durationMinutes)}</span>
                  </div>
                  {pricing.hasLongStayDiscount && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Ưu đãi sau 4 giờ</span>
                      <span className="font-mono">- {pricing.discountSavings.toLocaleString()}đ</span>
                    </div>
                  )}
                  {pricing.capApplied && (
                    <div className="flex justify-between text-sm text-violet-600">
                      <span>Giá trần ngày</span>
                      <span className="font-mono">Tiết kiệm {pricing.capSavings.toLocaleString()}đ</span>
                    </div>
                  )}
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
                  <QrCode className="mr-2 h-6 w-6" /> THANH TOÁN NGAY
                </Button>
                <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1.5 opacity-70">
                  <ShieldCheck className="w-3 h-3 text-green-500" /> Giao dịch được bảo mật 2 lớp bởi SpotAce Secure™
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      <PaymentGateway
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={handlePaymentSuccess}
        amount={totalCost}
        bookingId={parkingLot?.id?.toString() || "temp_id"}
        spotId={spotId}
        parkingName={parkingLot?.name}
        durationMinutes={durationMinutes}
        startTime={bookingWindow.startTime.toISOString()}
      />
    </div>
  );
};

export default BookingPage;
