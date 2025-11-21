import { useEffect, useState, useRef } from "react";
import { useCamera } from "@/hooks/use-camera";
import { scanLicensePlate } from "@/lib/vision-engine";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Scan, Camera, RefreshCw, CheckCircle2, XCircle, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// --- INTERFACES ---
interface BookingData {
  id: string;
  status: string;
  total_cost: number;
  start_time: string;
  end_time: string;
  vehicle_number: string | null;
  profiles: {
    full_name: string | null;
    phone: string | null;
  } | null;
  parking_lots: {
    name: string;
  } | null;
}

type ScanResult = {
  status: 'success' | 'error' | 'not_found' | 'scanning';
  message: string;
  bookingData?: BookingData;
};

const Scanner = () => {
  const { videoRef, startCamera, stopCamera, captureImage, isStreaming } = useCamera();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scannedText, setScannedText] = useState<string>("");
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
      const plateNumber = await scanLicensePlate(canvas);
      
      if (plateNumber) {
        // Hiệu ứng rung máy khi quét được (nếu hỗ trợ)
        if (navigator.vibrate) navigator.vibrate(200);
        
        console.log("Phát hiện:", plateNumber);
        setScannedText(plateNumber);
        stopScanning(); 
        await checkBooking(plateNumber);
      }
    } catch (error) {
      console.error("Lỗi xử lý ảnh:", error);
    }
  };

  const checkBooking = async (plateNumber: string) => {
    setScanResult({ status: 'scanning', message: 'Đang truy vấn SQL Server...' });
    
    try {
      const response = await fetch('http://localhost:3000/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plate: plateNumber })
      });

      const result = await response.json();

      if (result.success) {
        setScanResult({
          status: 'success',
          message: 'Check-in Thành Công! ✅',
          bookingData: {
             // Map dữ liệu từ SQL Server về format cũ để không phải sửa UI
             id: result.data.id,
             status: result.data.status,
             total_cost: result.data.total_cost,
             vehicle_number: result.data.vehicle_number,
             profiles: { full_name: result.data.user_name }, // SQL lưu thẳng tên
             parking_lots: { name: result.data.lot_name }
          } as any
        });
        toast.success(`Mời vào: ${result.data.user_name}`);
        // (Optional) Phát âm thanh Ding!
      } else {
        setScanResult({
          status: 'not_found',
          message: `Không tìm thấy vé: ${plateNumber}`,
        });
        toast.error("Biển số không tồn tại trong SQL Server.");
      }
    } catch (err) {
      setScanResult({ status: 'error', message: 'Lỗi kết nối Server' });
    }
  };

  const toggleAutoScan = () => {
    if (isScanning) {
      stopScanning();
      toast.info("Đã dừng quét.");
    } else {
      setIsScanning(true);
      setScanResult(null);
      setScannedText("");
      toast.success("Bắt đầu quét tự động...");
      scanIntervalRef.current = setInterval(handleScan, 500);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 relative flex flex-col overflow-hidden">
        <div className="relative flex-1 bg-gray-900 flex items-center justify-center">
          <video 
            ref={videoRef} 
            className="absolute inset-0 w-full h-full object-cover"
            playsInline 
            muted 
            autoPlay
          />

          {/* --- HUD SÁNG HƠN --- */}
          <div className="absolute inset-0 pointer-events-none z-10">
            {/* Mask làm tối xung quanh, sáng ở giữa */}
            <div className="absolute inset-0 bg-black/30 mask-scan-bright"></div>
            
            {/* Khung quét */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[85%] h-[35%] border-2 border-green-400 rounded-lg shadow-[0_0_50px_rgba(74,222,128,0.5)]">
               {isScanning && <div className="absolute w-full h-1 bg-green-400/80 top-0 animate-scan-laser shadow-[0_0_15px_rgba(74,222,128,1)]"></div>}
               <div className="absolute -bottom-8 left-0 right-0 text-center">
                 <span className="text-xs font-bold text-black bg-green-400 px-3 py-1 rounded">ĐƯA BIỂN SỐ VÀO KHUNG</span>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-black/80 backdrop-blur-lg border-t border-white/10 p-6 pb-10 rounded-t-3xl -mt-6 relative z-20">
          <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto mb-6"></div>

          {scanResult ? (
            <Card className={`p-4 border-l-4 ${
              scanResult.status === 'success' ? 'border-l-green-500 bg-green-950/50' : 
              scanResult.status === 'not_found' ? 'border-l-red-500 bg-red-950/50' : 'bg-slate-900'
            }`}>
              <div className="flex gap-4">
                <div className="mt-1">
                  {scanResult.status === 'success' && <CheckCircle2 className="w-8 h-8 text-green-500" />}
                  {scanResult.status === 'not_found' && <XCircle className="w-8 h-8 text-red-500" />}
                  {scanResult.status === 'scanning' && <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-white">{scanResult.message}</h3>
                  <p className="text-xl font-mono text-yellow-400 my-1">{scannedText}</p>
                  {scanResult.bookingData && (
                    <div className="text-sm text-gray-300 mt-2">
                      <p>Khách: {scanResult.bookingData.profiles?.full_name}</p>
                      <p>Xe: {scanResult.bookingData.vehicle_number}</p>
                    </div>
                  )}
                </div>
              </div>
              <Button className="w-full mt-4 bg-white text-black hover:bg-gray-200" onClick={() => { setScanResult(null); setScannedText(""); toggleAutoScan(); }}>Tiếp tục</Button>
            </Card>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="text-gray-400 text-sm">{isScanning ? "Đang quét..." : "Sẵn sàng"}</p>
              <Button 
                size="xl" 
                className={`h-20 w-20 rounded-full border-4 transition-all duration-300 ${isScanning ? "bg-red-600 border-red-400 animate-pulse" : "bg-white text-black border-gray-300"}`}
                onClick={toggleAutoScan}
              >
                {isScanning ? <div className="w-6 h-6 bg-white rounded-sm" /> : <Scan className="h-8 w-8" />}
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <style>{`
        @keyframes scan-laser { 0% { top: 0; opacity: 0.5; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0.5; } }
        .animate-scan-laser { animation: scan-laser 2s linear infinite; }
        /* Mask làm sáng vùng giữa */
        .mask-scan-bright {
           -webkit-mask-image: radial-gradient(rectangle, transparent 50%, black 100%);
           mask-image: radial-gradient(transparent 0%, black 100%);
           clip-path: polygon(0% 0%, 0% 100%, 7.5% 100%, 7.5% 32.5%, 92.5% 32.5%, 92.5% 67.5%, 7.5% 67.5%, 7.5% 100%, 100% 100%, 100% 0%);
        }
      `}</style>
    </div>
  );
};

export default Scanner;