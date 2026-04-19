import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    CheckCircle2,
    Loader2,
    QrCode,
    Wallet,
    CreditCard,
    Bitcoin,
    ShieldCheck,
    Smartphone,
    Download,
    Share2,
    Calendar,
    Copy,
    Clock,
    MapPin,
    Receipt,
    Sparkles,
    Volume2,
    VolumeX
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import confetti from 'canvas-confetti';
import { formatDurationLabel } from "@/lib/parking-pricing";

interface PaymentGatewayProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (txnId: string) => void | Promise<void>;
    amount: number;
    bookingId: string;
    spotId?: string;
    parkingName?: string;
    durationMinutes?: number;
    startTime?: string;
}

const PaymentGateway = ({
    isOpen,
    onClose,
    onSuccess,
    amount,
    bookingId,
    spotId = 'A01',
    parkingName = 'Vincom Center Đồng Khởi',
    durationMinutes = 120,
    startTime
}: PaymentGatewayProps) => {
    const [step, setStep] = useState<'method' | 'processing' | 'success'>('method');
    const [method, setMethod] = useState<'momo' | 'bank' | 'crypto'>('momo');
    const [transactionId, setTransactionId] = useState('');
    const [soundEnabled, setSoundEnabled] = useState(true);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Generate transaction ID
    const generateTxnId = () => {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `TXN-${dateStr}-${random}`;
    };

    // Format timestamp
    const getTimestamp = () => {
        return new Date().toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // Reset state khi mở lại
    useEffect(() => {
        if (isOpen) {
            setStep('method');
            setTransactionId(generateTxnId());
        }
    }, [isOpen]);

    // Cleanup audio context
    useEffect(() => {
        return () => {
            audioContextRef.current?.close().catch(() => { });
            audioContextRef.current = null;
        };
    }, []);

    // Confetti burst effect
    const fireConfetti = () => {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 },
            zIndex: 9999
        };

        function fire(particleRatio: number, opts: confetti.Options) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }

        // Multiple bursts for VIP effect
        fire(0.25, {
            spread: 26,
            startVelocity: 55,
            colors: ['#22c55e', '#10b981', '#34d399']
        });
        fire(0.2, {
            spread: 60,
            colors: ['#3b82f6', '#6366f1', '#8b5cf6']
        });
        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8,
            colors: ['#f59e0b', '#fbbf24', '#fcd34d']
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2,
            colors: ['#ec4899', '#f472b6', '#f9a8d4']
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 45,
            colors: ['#14b8a6', '#2dd4bf', '#5eead4']
        });

        // Second wave
        setTimeout(() => {
            confetti({
                particleCount: 50,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#22c55e', '#3b82f6', '#f59e0b']
            });
            confetti({
                particleCount: 50,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#ec4899', '#8b5cf6', '#14b8a6']
            });
        }, 300);
    };

    const getAudioContext = async () => {
        const AudioContextCtor =
            window.AudioContext ||
            (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

        if (!AudioContextCtor) {
            return null;
        }

        if (!audioContextRef.current) {
            audioContextRef.current = new AudioContextCtor();
        }

        if (audioContextRef.current.state === "suspended") {
            await audioContextRef.current.resume();
        }

        return audioContextRef.current;
    };

    const scheduleTone = (
        context: AudioContext,
        {
            frequency,
            duration,
            delay = 0,
            gain = 0.03,
            type = "sine",
        }: {
            frequency: number;
            duration: number;
            delay?: number;
            gain?: number;
            type?: OscillatorType;
        },
    ) => {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        const startAt = context.currentTime + delay;
        const releaseAt = startAt + duration;

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, startAt);
        oscillator.frequency.exponentialRampToValueAtTime(Math.max(80, frequency * 0.92), releaseAt);

        gainNode.gain.setValueAtTime(0.0001, startAt);
        gainNode.gain.exponentialRampToValueAtTime(gain, startAt + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, releaseAt);

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        oscillator.start(startAt);
        oscillator.stop(releaseAt + 0.04);
    };

    // Play sound effects locally so the modal does not depend on remote assets.
    const playSuccessSound = async () => {
        if (!soundEnabled) return;

        try {
            const context = await getAudioContext();
            if (!context) {
                return;
            }

            scheduleTone(context, { frequency: 880, duration: 0.14, gain: 0.018, type: "triangle" });
            scheduleTone(context, { frequency: 1320, duration: 0.18, delay: 0.12, gain: 0.022, type: "triangle" });
            scheduleTone(context, { frequency: 523.25, duration: 0.16, delay: 0.3, gain: 0.03, type: "square" });
            scheduleTone(context, { frequency: 659.25, duration: 0.18, delay: 0.42, gain: 0.028, type: "square" });
            scheduleTone(context, { frequency: 783.99, duration: 0.26, delay: 0.56, gain: 0.032, type: "square" });
        } catch {
            // Keep payment flow silent if Web Audio is unavailable.
        }
    };

    const handlePayment = async () => {
        setStep('processing');

        try {
            const res = await fetch('http://localhost:3000/api/payment/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId, method, amount })
            });
            const data = await res.json();

            if (data.success) {
                const confirmedTransactionId = data.transactionId || transactionId;
                setTimeout(() => {
                    setTransactionId(confirmedTransactionId);
                    setStep('success');
                    playSuccessSound();
                    fireConfetti();
                }, 2000);

                // Đóng modal sau 6s để user xem bill
                setTimeout(async () => {
                    await onSuccess(confirmedTransactionId);
                    onClose();
                }, 8000);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            toast.error("Giao dịch thất bại. Vui lòng thử lại.");
            setStep('method');
        }
    };

    // Copy to clipboard
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Đã sao chép!");
    };

    // Share receipt
    const shareReceipt = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'SpotAce Park - Biên lai thanh toán',
                    text: `Thanh toán thành công!\nMã GD: ${transactionId}\nSố tiền: ${amount.toLocaleString()}đ\nVị trí: ${spotId}`,
                    url: window.location.href
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            copyToClipboard(`SpotAce Park - ${transactionId} - ${amount.toLocaleString()}đ`);
        }
    };

    // Add to calendar
    const addToCalendar = () => {
        const calendarStartTime = startTime ? new Date(startTime) : new Date();
        const endTime = new Date(calendarStartTime.getTime() + durationMinutes * 60 * 1000);
        const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');

        const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Đỗ xe tại ${parkingName}`)}&dates=${formatDate(calendarStartTime)}/${formatDate(endTime)}&details=${encodeURIComponent(`Vị trí: ${spotId}\nMã giao dịch: ${transactionId}`)}&location=${encodeURIComponent(parkingName)}`;

        window.open(calendarUrl, '_blank');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg bg-slate-950 border-slate-800 text-white p-0 overflow-hidden shadow-2xl">

                {/* HEADER VỚI HIỆU ỨNG GRADIENT */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20"></div>
                    {/* Animated sparkles */}
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-white rounded-full"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0, 1, 0],
                                    x: [0, Math.random() * 100 - 50],
                                    y: [0, Math.random() * 50 - 25]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.3
                                }}
                                style={{ left: `${20 + i * 15}%`, top: '50%' }}
                            />
                        ))}
                    </div>
                    <DialogTitle className="text-2xl font-black text-white relative z-10 tracking-tight flex items-center justify-center gap-2">
                        <ShieldCheck className="w-6 h-6" />
                        THANH TOÁN AN TOÀN
                    </DialogTitle>
                    <p className="text-indigo-100 text-sm mt-2 relative z-10 opacity-90">
                        Tổng thanh toán: <span className="font-black text-white text-xl">{amount.toLocaleString()} đ</span>
                    </p>
                    {/* Sound toggle */}
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
                    >
                        {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                </div>

                <div className="p-6">
                    <AnimatePresence mode="wait">

                        {/* STEP 1: CHỌN PHƯƠNG THỨC */}
                        {step === 'method' && (
                            <motion.div
                                key="method"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <Tabs defaultValue="momo" onValueChange={(v: any) => setMethod(v)} className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 bg-slate-900 border border-slate-800 h-12">
                                        <TabsTrigger value="momo" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-xs font-bold">
                                            <Wallet className="w-4 h-4 mr-1" /> Ví Điện Tử
                                        </TabsTrigger>
                                        <TabsTrigger value="bank" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white text-xs font-bold">
                                            <CreditCard className="w-4 h-4 mr-1" /> Ngân Hàng
                                        </TabsTrigger>
                                        <TabsTrigger value="crypto" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-yellow-500 data-[state=active]:text-white text-xs font-bold">
                                            <Bitcoin className="w-4 h-4 mr-1" /> Crypto
                                        </TabsTrigger>
                                    </TabsList>

                                    <div className="mt-6 min-h-[220px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50 relative overflow-hidden">
                                        {/* Shimmer effect */}
                                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                                        <TabsContent value="momo" className="w-full text-center space-y-4 mt-0">
                                            <div className="w-44 h-44 bg-white p-3 mx-auto rounded-xl shadow-lg relative">
                                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=MOMO_${amount}_ORDER_${bookingId}`} alt="Momo QR" className="w-full h-full" />
                                                <div className="absolute inset-0 rounded-xl ring-2 ring-pink-500/50 animate-pulse" />
                                            </div>
                                            <p className="text-xs text-slate-400 flex items-center justify-center gap-2">
                                                <Smartphone className="w-4 h-4" /> Quét bằng App Momo/ZaloPay/VNPay
                                            </p>
                                        </TabsContent>

                                        <TabsContent value="bank" className="w-full mt-0 px-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 bg-slate-800 p-4 rounded-xl border border-slate-700 cursor-pointer hover:border-blue-500 hover:bg-slate-800/80 transition-all group">
                                                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                                        <CreditCard className="w-6 h-6 text-blue-400" />
                                                    </div>
                                                    <div className="text-left flex-1">
                                                        <p className="font-bold text-sm">Vietcombank</p>
                                                        <p className="text-xs text-slate-500">**** **** **** 9999</p>
                                                    </div>
                                                    <div className="w-4 h-4 rounded-full border-2 border-slate-600 group-hover:border-blue-500 group-hover:bg-blue-500 transition-all" />
                                                </div>
                                                <div className="flex items-center gap-3 bg-slate-800 p-4 rounded-xl border border-slate-700 cursor-pointer hover:border-green-500 hover:bg-slate-800/80 transition-all group">
                                                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                                                        <CreditCard className="w-6 h-6 text-green-400" />
                                                    </div>
                                                    <div className="text-left flex-1">
                                                        <p className="font-bold text-sm">MB Bank</p>
                                                        <p className="text-xs text-slate-500">Quét VietQR liên kết ví</p>
                                                    </div>
                                                    <div className="w-4 h-4 rounded-full border-2 border-slate-600 group-hover:border-green-500 group-hover:bg-green-500 transition-all" />
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="crypto" className="w-full text-center mt-0 space-y-4">
                                            <motion.div
                                                className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/30"
                                                animate={{ rotateY: [0, 360] }}
                                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                            >
                                                <Bitcoin className="w-10 h-10 text-white" />
                                            </motion.div>
                                            <div>
                                                <p className="font-black text-xl text-orange-400">{(amount / 2400000000).toFixed(8)} BTC</p>
                                                <p className="text-xs text-slate-500 mt-1">Chấp nhận: BTC, ETH, USDT, SOL</p>
                                            </div>
                                            <Button variant="outline" className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 w-full">
                                                <Wallet className="w-4 h-4 mr-2" /> Kết nối Ví Web3
                                            </Button>
                                        </TabsContent>
                                    </div>
                                </Tabs>

                                <Button
                                    className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 font-black h-14 shadow-lg shadow-purple-500/30 text-lg"
                                    onClick={handlePayment}
                                >
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    XÁC NHẬN THANH TOÁN
                                </Button>
                            </motion.div>
                        )}

                        {/* STEP 2: PROCESSING */}
                        {step === 'processing' && (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-12 space-y-6"
                            >
                                <div className="relative">
                                    <motion.div
                                        className="w-24 h-24 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            <ShieldCheck className="w-10 h-10 text-indigo-500" />
                                        </motion.div>
                                    </div>
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-2xl font-black text-white">Đang xử lý giao dịch...</h3>
                                    <p className="text-slate-400 text-sm">Đang xác thực với ngân hàng. Vui lòng chờ.</p>
                                </div>
                                {/* Processing steps */}
                                <div className="space-y-2 w-full max-w-xs">
                                    {['Xác thực thông tin', 'Kết nối cổng thanh toán', 'Hoàn tất giao dịch'].map((text, i) => (
                                        <motion.div
                                            key={i}
                                            className="flex items-center gap-3 text-sm"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.8 }}
                                        >
                                            <motion.div
                                                className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: i * 0.8 + 0.5 }}
                                            >
                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                            </motion.div>
                                            <span className="text-slate-300">{text}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: SUCCESS - BILL RECEIPT */}
                        {step === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Success Icon */}
                                <div className="text-center">
                                    <motion.div
                                        className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_60px_rgba(34,197,94,0.5)]"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: [0, 1.2, 1] }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <CheckCircle2 className="w-10 h-10 text-white" />
                                    </motion.div>
                                    <motion.h3
                                        className="text-2xl font-black text-white mt-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        THANH TOÁN THÀNH CÔNG!
                                    </motion.h3>
                                </div>

                                {/* Bill Receipt Card */}
                                <motion.div
                                    className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 border border-slate-700 relative overflow-hidden"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    {/* Shimmer effect */}
                                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700">
                                        <div className="flex items-center gap-2">
                                            <Receipt className="w-5 h-5 text-purple-400" />
                                            <span className="font-bold text-white">BIÊN LAI ĐIỆN TỬ</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs text-green-400 font-bold">● VERIFIED</span>
                                        </div>
                                    </div>

                                    {/* Transaction ID with QR */}
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="space-y-3 flex-1">
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase tracking-wider">Mã giao dịch</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-lg font-mono font-bold text-white">{transactionId}</p>
                                                    <button
                                                        onClick={() => copyToClipboard(transactionId)}
                                                        className="text-slate-400 hover:text-white transition-colors"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                <Clock className="w-4 h-4" />
                                                <span>{getTimestamp()}</span>
                                            </div>
                                        </div>
                                        {/* Mini QR */}
                                        <div className="w-20 h-20 bg-white p-1 rounded-lg">
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${transactionId}`}
                                                alt="QR"
                                                className="w-full h-full"
                                            />
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-4 py-4 border-y border-slate-700">
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider">Vị trí đỗ</p>
                                            <p className="text-lg font-bold text-blue-400 mt-1">{spotId}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider">Thời gian</p>
                                            <p className="text-lg font-bold text-white mt-1">{formatDurationLabel(durationMinutes)}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> Địa điểm
                                            </p>
                                            <p className="text-sm font-medium text-white mt-1">{parkingName}</p>
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400 font-medium">TỔNG THANH TOÁN</span>
                                        <span className="text-2xl font-black text-green-400">{amount.toLocaleString()}đ</span>
                                    </div>
                                </motion.div>

                                {/* Action Buttons */}
                                <motion.div
                                    className="grid grid-cols-3 gap-3"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <Button
                                        variant="outline"
                                        className="border-slate-700 text-slate-300 hover:bg-slate-800 flex flex-col items-center gap-1 h-auto py-3"
                                        onClick={() => toast.success("Đang tải xuống...")}
                                    >
                                        <Download className="w-5 h-5" />
                                        <span className="text-xs">Tải về</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="border-slate-700 text-slate-300 hover:bg-slate-800 flex flex-col items-center gap-1 h-auto py-3"
                                        onClick={shareReceipt}
                                    >
                                        <Share2 className="w-5 h-5" />
                                        <span className="text-xs">Chia sẻ</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="border-slate-700 text-slate-300 hover:bg-slate-800 flex flex-col items-center gap-1 h-auto py-3"
                                        onClick={addToCalendar}
                                    >
                                        <Calendar className="w-5 h-5" />
                                        <span className="text-xs">Lịch</span>
                                    </Button>
                                </motion.div>

                                {/* Auto close notice */}
                                <motion.p
                                    className="text-center text-xs text-slate-500"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                >
                                    Cửa sổ sẽ tự động đóng sau vài giây...
                                </motion.p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>

            <style>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </Dialog>
    );
};

export default PaymentGateway;
