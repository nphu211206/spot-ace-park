import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle2, Loader2, QrCode, Wallet, CreditCard, Bitcoin, ShieldCheck, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentGatewayProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (txnId: string) => void;
    amount: number;
    bookingId: string;
}

const PaymentGateway = ({ isOpen, onClose, onSuccess, amount, bookingId }: PaymentGatewayProps) => {
    const [step, setStep] = useState<'method' | 'processing' | 'success'>('method');
    const [method, setMethod] = useState<'momo' | 'bank' | 'crypto'>('momo');

    // Reset state khi mở lại
    useEffect(() => {
        if (isOpen) setStep('method');
    }, [isOpen]);

    const handlePayment = async () => {
        setStep('processing');
        
        // Giả lập quy trình xác thực ngân hàng (3s)
        // Trong thực tế sẽ gọi API server.js ở đây
        try {
            const res = await fetch('http://localhost:3000/api/payment/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId, method, amount })
            });
            const data = await res.json();
            
            if (data.success) {
                setTimeout(() => {
                    setStep('success');
                    // Phát âm thanh "Ka-ching"
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
                    audio.play().catch(()=>{});
                }, 2000);
                
                // Đóng modal sau khi hiện success 2s
                setTimeout(() => {
                    onSuccess(data.transactionId);
                    onClose();
                }, 4000);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            toast.error("Giao dịch thất bại. Vui lòng thử lại.");
            setStep('method');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-white p-0 overflow-hidden shadow-2xl">
                
                {/* HEADER VỚI HIỆU ỨNG GRADIENT */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <DialogTitle className="text-2xl font-black text-white relative z-10 tracking-tight">
                        THANH TOÁN AN TOÀN
                    </DialogTitle>
                    <p className="text-indigo-100 text-sm mt-1 relative z-10 opacity-90">
                        Tổng thanh toán: <span className="font-bold text-white text-lg">{amount.toLocaleString()} đ</span>
                    </p>
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
                                    <TabsList className="grid w-full grid-cols-3 bg-slate-900 border border-slate-800">
                                        <TabsTrigger value="momo" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white text-xs">Ví Điện Tử</TabsTrigger>
                                        <TabsTrigger value="bank" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs">Ngân Hàng</TabsTrigger>
                                        <TabsTrigger value="crypto" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs">Crypto</TabsTrigger>
                                    </TabsList>

                                    <div className="mt-6 min-h-[200px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50 relative">
                                        
                                        <TabsContent value="momo" className="w-full text-center space-y-4 mt-0">
                                            <div className="w-40 h-40 bg-white p-2 mx-auto rounded-lg">
                                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MOMO_${amount}_ORDER_${bookingId}`} alt="Momo QR" className="w-full h-full"/>
                                            </div>
                                            <p className="text-xs text-slate-400 flex items-center justify-center gap-2">
                                                <Smartphone className="w-4 h-4"/> Quét bằng App Momo/ZaloPay
                                            </p>
                                        </TabsContent>

                                        <TabsContent value="bank" className="w-full mt-0 px-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-lg border border-slate-700 cursor-pointer hover:border-blue-500 transition-colors">
                                                    <CreditCard className="w-6 h-6 text-blue-400"/>
                                                    <div className="text-left">
                                                        <p className="font-bold text-sm">Vietcombank</p>
                                                        <p className="text-xs text-slate-500">**** **** **** 9999</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-lg border border-slate-700 cursor-pointer hover:border-blue-500 transition-colors">
                                                    <CreditCard className="w-6 h-6 text-green-400"/>
                                                    <div className="text-left">
                                                        <p className="font-bold text-sm">MB Bank</p>
                                                        <p className="text-xs text-slate-500">Quét QR VietQR</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="crypto" className="w-full text-center mt-0 space-y-4">
                                            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                                <Bitcoin className="w-8 h-8 text-orange-500"/>
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg">{(amount / 2400000000).toFixed(8)} BTC</p>
                                                <p className="text-xs text-slate-500">Chấp nhận: BTC, ETH, USDT</p>
                                            </div>
                                            <Button variant="outline" className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 w-full">
                                                <Wallet className="w-4 h-4 mr-2"/> Kết nối Ví Web3
                                            </Button>
                                        </TabsContent>
                                    </div>
                                </Tabs>

                                <Button 
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold h-12 shadow-lg shadow-indigo-500/20"
                                    onClick={handlePayment}
                                >
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
                                className="flex flex-col items-center justify-center py-10 space-y-6"
                            >
                                <div className="relative">
                                    <div className="w-20 h-20 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <ShieldCheck className="w-8 h-8 text-indigo-500" />
                                    </div>
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-bold text-white">Đang xử lý giao dịch...</h3>
                                    <p className="text-slate-400 text-sm">Vui lòng không tắt trình duyệt.</p>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: SUCCESS */}
                        {step === 'success' && (
                            <motion.div 
                                key="success"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center py-6 space-y-6"
                            >
                                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_50px_#22c55e] animate-bounce">
                                    <CheckCircle2 className="w-12 h-12 text-white" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-wide">Thành Công!</h3>
                                    <p className="text-slate-400 mt-2">Cảm ơn bạn đã sử dụng Spot Ace Park.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentGateway;