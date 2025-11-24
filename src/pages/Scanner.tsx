import { useEffect, useState, useRef } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Scan, RefreshCw, CheckCircle2, XCircle, Zap, ShieldAlert, Lock } from "lucide-react";
import { useCamera } from "@/hooks/use-camera";
import { scanLicensePlate } from "@/lib/vision-engine";

// --- HUD COMPONENT (Giao diện Iron Man) ---
const ScannerHUD = ({ scanning }: { scanning: boolean }) => (
  <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
    {/* Corner Brackets */}
    <div className="absolute top-4 left-4 w-16 h-16 border-l-4 border-t-4 border-cyan-500 rounded-tl-xl"></div>
    <div className="absolute top-4 right-4 w-16 h-16 border-r-4 border-t-4 border-cyan-500 rounded-tr-xl"></div>
    <div className="absolute bottom-4 left-4 w-16 h-16 border-l-4 border-b-4 border-cyan-500 rounded-bl-xl"></div>
    <div className="absolute bottom-4 right-4 w-16 h-16 border-r-4 border-b-4 border-cyan-500 rounded-br-xl"></div>
    
    {/* Center Crosshair */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-40 border border-cyan-500/30 rounded-lg bg-cyan-500/5 backdrop-blur-[1px]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-cyan-500/20"></div>
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[1px] bg-cyan-500/20"></div>
    </div>

    {/* Scanning Line Animation */}
    {scanning && (
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent animate-scan"></div>
    )}

    {/* Status Text */}
    <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/70 text-cyan-400 px-4 py-1 rounded font-mono text-xs tracking-[0.2em] border border-cyan-900">
        {scanning ? "SYSTEM SCANNING..." : "STANDBY MODE"}
    </div>
  </div>
);

const Scanner = () => {
  const { videoRef, startCamera, captureImage } = useCamera();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [manualMode, setManualMode] = useState(false);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopScanning();
  }, []);

  const stopScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScan = async () => {
    const canvas = captureImage();
    if (!canvas) return;

    try {
      // 1. OCR Xử lý ảnh (Local)
      const plateNumber = await scanLicensePlate(canvas);
      
      if (plateNumber) {
        stopScanning();
        // 2. Gọi API kiểm tra
        await checkBooking(plateNumber);
      }
    } catch (error) {
      console.error("Lỗi xử lý ảnh:", error);
    }
  };

  const checkBooking = async (plateNumber: string) => {
    toast.loading(`Đang phân tích biển số: ${plateNumber}...`);
    
    try {
      const response = await fetch('http://localhost:3000/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plate: plateNumber })
      });

      const result = await response.json();
      toast.dismiss();

      if (result.success) {
        setScanResult({ status: 'success', data: result.data, plate: plateNumber });
        // Phát âm thanh (Giả lập)
        const audio = new Audio('https://actions.google.com/sounds/v1/science_fiction/scifi_laser_1.ogg');
        audio.play().catch(() => {});
        toast.success(`XÁC THỰC THÀNH CÔNG: ${plateNumber}`);
      } else {
        setScanResult({ status: 'not_found', plate: plateNumber });
        toast.error("KHÔNG TÌM THẤY DỮ LIỆU VÉ XE!");
      }
    } catch (err) {
      toast.error("Lỗi kết nối Server");
    }
  };

  const toggleAutoScan = () => {
    if (isScanning) {
      stopScanning();
    } else {
      setIsScanning(true);
      setScanResult(null);
      scanIntervalRef.current = setInterval(handleScan, 800); // Scan mỗi 0.8s
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans overflow-hidden">
      <Header />
      
      <main className="flex-1 relative flex flex-col">
        {/* VIDEO FEED AREA */}
        <div className="flex-1 relative bg-slate-900 flex items-center justify-center overflow-hidden">
          <video 
            ref={videoRef} 
            className="absolute inset-0 w-full h-full object-cover opacity-80"
            playsInline 
            muted 
            autoPlay
          />
          
          {/* Noise Texture Overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          
          {/* THE HUD LAYER */}
          <ScannerHUD scanning={isScanning} />

          {/* RESULT POPUP CARD */}
          {scanResult && (
            <div className="absolute bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-10">
                <Card className={`bg-slate-950/90 backdrop-blur-xl border-l-4 p-6 text-white shadow-2xl ${scanResult.status === 'success' ? 'border-l-green-500 border-white/10' : 'border-l-red-500 border-white/10'}`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${scanResult.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {scanResult.status === 'success' ? <CheckCircle2 className="w-8 h-8"/> : <XCircle className="w-8 h-8"/>}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold uppercase tracking-wide">
                                {scanResult.status === 'success' ? "GATE OPENING..." : "ACCESS DENIED"}
                            </h3>
                            <p className="text-4xl font-black font-mono mt-2 tracking-widest text-yellow-400">{scanResult.plate}</p>
                            
                            {scanResult.status === 'success' && (
                                <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-400 bg-white/5 p-3 rounded">
                                    <div>Chủ xe: <span className="text-white font-bold">{scanResult.data.user_name}</span></div>
                                    <div>Bãi xe: <span className="text-white font-bold">{scanResult.data.lot_name}</span></div>
                                    <div>Giờ vào: <span className="text-white font-bold">{new Date(scanResult.data.start_time).toLocaleTimeString()}</span></div>
                                    <div>Phí: <span className="text-green-400 font-bold">{scanResult.data.total_cost.toLocaleString()}đ</span></div>
                                </div>
                            )}
                        </div>
                    </div>
                    <Button className="w-full mt-6 bg-white text-black hover:bg-slate-200 font-bold" onClick={() => { setScanResult(null); toggleAutoScan(); }}>
                        TIẾP TỤC QUÉT (AUTO)
                    </Button>
                </Card>
            </div>
          )}
        </div>

        {/* CONTROL BAR */}
        <div className="h-24 bg-slate-950 border-t border-slate-800 flex items-center justify-center gap-6 px-6 relative z-30">
            <Button 
                size="icon" 
                className={`h-16 w-16 rounded-full border-4 transition-all duration-500 ${isScanning ? 'bg-red-600 border-red-900 shadow-[0_0_30px_rgba(220,38,38,0.6)] animate-pulse' : 'bg-cyan-600 border-cyan-900 hover:bg-cyan-500 shadow-[0_0_20px_rgba(8,145,178,0.4)]'}`}
                onClick={toggleAutoScan}
            >
                {isScanning ? <div className="w-6 h-6 bg-white rounded-sm" /> : <Scan className="w-8 h-8 text-white" />}
            </Button>

            <div className="absolute right-6 flex gap-2">
                <Button variant="outline" size="icon" className="border-slate-700 bg-transparent text-slate-400" onClick={() => setManualMode(!manualMode)}>
                    {manualMode ? <Lock className="w-5 h-5 text-red-500"/> : <ShieldAlert className="w-5 h-5"/>}
                </Button>
            </div>
        </div>
      </main>
      
      <style>{`
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
            animation: scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            background: linear-gradient(to bottom, transparent, rgba(6,182,212,0.5), transparent);
            height: 10%;
        }
      `}</style>
    </div>
  );
};

export default Scanner;