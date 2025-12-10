import { useEffect, useState, useRef } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Scan, Lock, ShieldCheck, Zap, Aperture, Crosshair } from "lucide-react";
import { useCamera } from "@/hooks/use-camera";
import { scanLicensePlate } from "@/lib/vision-engine";
import { motion, AnimatePresence } from "framer-motion";

const ScannerHUD = ({ scanning }: { scanning: boolean }) => (
  <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
    {/* Tech Grid Background */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]"></div>

    {/* Corners */}
    <div className="absolute top-8 left-8 w-24 h-24 border-l-4 border-t-4 border-cyan-500/80 rounded-tl-3xl drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
    <div className="absolute top-8 right-8 w-24 h-24 border-r-4 border-t-4 border-cyan-500/80 rounded-tr-3xl drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
    <div className="absolute bottom-24 left-8 w-24 h-24 border-l-4 border-b-4 border-cyan-500/80 rounded-bl-3xl drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
    <div className="absolute bottom-24 right-8 w-24 h-24 border-r-4 border-b-4 border-cyan-500/80 rounded-br-3xl drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
    
    {/* Central Focus */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div 
            animate={{ rotate: 360, scale: [1, 1.05, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-64 h-64 border border-cyan-500/30 rounded-full flex items-center justify-center"
        >
             <div className="w-60 h-60 border border-dashed border-cyan-500/20 rounded-full"></div>
        </motion.div>
        <Crosshair className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-red-500/80" />
    </div>

    {/* Scanning Laser */}
    {scanning && (
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500/50 shadow-[0_0_30px_#ef4444] animate-scan-laser"></div>
    )}

    {/* Data Stream Text */}
    <div className="absolute top-1/3 right-12 text-[10px] font-mono text-cyan-500/70 space-y-1 hidden md:block">
        <p>SYS_OPT: NORMAL</p>
        <p>OCR_ENGINE: ONLINE</p>
        <p>LATENCY: 14ms</p>
        <p>NET_SEC: ENCRYPTED</p>
    </div>

    <style>{`
        @keyframes scan-laser {
            0% { top: 10%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 90%; opacity: 0; }
        }
        .animate-scan-laser {
            animation: scan-laser 2s linear infinite;
        }
    `}</style>
  </div>
);

const Scanner = () => {
  const { videoRef, startCamera, captureImage } = useCamera();
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopScanning();
  }, []);

  const stopScanning = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    setIsScanning(false);
  };

  const handleScan = async () => {
    const canvas = captureImage();
    if (!canvas) return;

    try {
      const plateNumber = await scanLicensePlate(canvas);
      if (plateNumber) {
        stopScanning();
        checkBooking(plateNumber);
      }
    } catch (error) { console.error(error); }
  };

  const checkBooking = async (plate: string) => {
    toast.loading(`Phát hiện biển số: ${plate}...`);
    try {
        const res = await fetch('http://localhost:3000/api/scan', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ plate })
        });
        const data = await res.json();
        toast.dismiss();

        if (data.success) {
            setResult({ type: 'success', ...data.data });
            // Play Sound
            new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3').play().catch(()=>{});
        } else {
            setResult({ type: 'error', plate });
            new Audio('https://assets.mixkit.co/active_storage/sfx/2015/2015-preview.mp3').play().catch(()=>{});
        }
    } catch (e) { toast.error("Lỗi Server"); }
  };

  const toggleAutoScan = () => {
    if (isScanning) stopScanning();
    else {
        setIsScanning(true);
        setResult(null);
        scanIntervalRef.current = setInterval(handleScan, 800);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans overflow-hidden">
      <Header />
      
      <main className="flex-1 relative flex flex-col">
        <div className="flex-1 relative bg-slate-900 flex items-center justify-center overflow-hidden">
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[30%]" playsInline muted autoPlay />
          
          <ScannerHUD scanning={isScanning} />

          <AnimatePresence>
              {result && (
                <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="absolute bottom-28 left-4 right-4 z-50 md:left-auto md:right-auto md:w-[400px]"
                >
                    <Card className={`backdrop-blur-xl border-2 p-6 text-white shadow-[0_0_50px_rgba(0,0,0,0.5)] ${result.type === 'success' ? 'bg-green-950/90 border-green-500' : 'bg-red-950/90 border-red-500'}`}>
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full ${result.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                                {result.type === 'success' ? <ShieldCheck className="w-8 h-8 text-white"/> : <Lock className="w-8 h-8 text-white"/>}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black uppercase italic tracking-wider">
                                    {result.type === 'success' ? "ACCESS GRANTED" : "ACCESS DENIED"}
                                </h3>
                                <p className="font-mono text-lg text-white/80 mt-1">{result.type === 'success' ? result.vehicle_number : result.plate}</p>
                                
                                {result.type === 'success' && (
                                    <div className="mt-4 text-xs bg-black/30 p-3 rounded border border-white/10 space-y-1">
                                        <div className="flex justify-between"><span>Chủ xe:</span> <span className="font-bold">{result.user_name}</span></div>
                                        <div className="flex justify-between"><span>Giờ vào:</span> <span>{new Date(result.start_time).toLocaleTimeString()}</span></div>
                                        <div className="mt-2 pt-2 border-t border-white/10 text-center font-bold text-green-400">WELCOME BACK, SIR!</div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Button className="w-full mt-4 bg-white/10 hover:bg-white/20 border border-white/20" onClick={() => { setResult(null); toggleAutoScan(); }}>
                            TIẾP TỤC QUÉT
                        </Button>
                    </Card>
                </motion.div>
              )}
          </AnimatePresence>
        </div>

        {/* CONTROL BAR */}
        <div className="h-24 bg-black/90 border-t border-slate-800 flex items-center justify-center gap-8 px-6 relative z-30 backdrop-blur-md">
            <div className="text-center hidden md:block">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">AI Engine</p>
                <p className="text-xs font-bold text-green-500">READY</p>
            </div>
            
            <Button 
                size="icon" 
                className={`h-16 w-16 rounded-full border-4 transition-all duration-300 shadow-2xl ${isScanning ? 'bg-red-600 border-red-900 animate-pulse' : 'bg-cyan-600 border-cyan-400 hover:bg-cyan-500 hover:scale-110'}`}
                onClick={toggleAutoScan}
            >
                {isScanning ? <div className="w-6 h-6 bg-white rounded-sm" /> : <Aperture className="w-8 h-8 text-white animate-spin-slow" />}
            </Button>

            <div className="text-center hidden md:block">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Mode</p>
                <p className="text-xs font-bold text-blue-500">AUTO</p>
            </div>
        </div>
      </main>
    </div>
  );
};

export default Scanner;