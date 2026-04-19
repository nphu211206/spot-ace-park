import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { 
  Activity, Car, DollarSign, AlertCircle, Lock, Unlock, 
  Video, CreditCard, Settings, MapPin, RefreshCw, Zap,
  BrainCircuit, Loader2, Play, Pause, SkipBack, SkipForward, Download, History
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";

// --- CCTV COMPONENT (NIGHT VISION MODE) ---
const LiveFeed = ({ camId, location, active }: { camId: string, location: string, active: boolean }) => (
    <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 group hover:border-green-500/50 transition-all duration-500 shadow-2xl ring-1 ring-white/5">
        {/* Header Overlay */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-20 bg-black/60 px-2 py-1 rounded backdrop-blur-md border border-white/10">
            <span className={`animate-pulse w-2 h-2 rounded-full shadow-[0_0_10px] ${active ? 'bg-red-500 shadow-red-500' : 'bg-gray-500'}`}></span>
            <span className="text-[10px] font-mono font-bold tracking-widest text-white">
                {active ? "REC ●" : "OFFLINE"}
            </span>
        </div>
        <div className="absolute top-3 right-3 z-20">
            <span className="text-[10px] font-mono text-green-400/90 bg-black/60 px-2 py-0.5 rounded border border-green-900/50">
                {new Date().toLocaleTimeString()}
            </span>
        </div>

        {/* Image Layer with Filters */}
        <div className="relative w-full h-full overflow-hidden">
            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none z-10"></div>
            <div className="absolute inset-0 bg-green-900/10 mix-blend-multiply pointer-events-none z-10"></div> {/* Night vision tint */}
            
            <img 
                src={camId} 
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-[2s] ease-out contrast-[1.1] brightness-90 grayscale-[20%]"
                alt="CCTV Feed"
            />
            
            {/* Crosshair Center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-white/20 z-10 opacity-30"></div>
        </div>

        {/* Footer Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 pt-12 z-20">
            <div className="flex justify-between items-end">
                <p className="text-xs font-black text-white tracking-widest uppercase flex items-center gap-2">
                    <Video className="w-3 h-3 text-green-500"/> {location}
                </p>
                <div className="flex gap-0.5 items-end">
                   <span className="text-[9px] text-slate-400 mr-2 font-mono">1080p | 30FPS</span>
                   {[1,2,3,4,5].map(i => (
                       <div key={i} className="w-1 bg-green-500/60 rounded-sm animate-pulse" style={{animationDelay: `${i*0.1}s`, height: `${Math.random() * 8 + 4}px`}}></div>
                   ))}
                </div>
            </div>
        </div>
    </div>
);

const ManagerDashboard = () => {
    const navigate = useNavigate();
    const [barrierStatus, setBarrierStatus] = useState(false);
    const [autoMode, setAutoMode] = useState(true);
    const [lotData, setLotData] = useState<any>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [recentBookings, setRecentBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Modals State
    const [showReport, setShowReport] = useState(false);
    const [showPlayback, setShowPlayback] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackVal, setPlaybackVal] = useState([35]);

    useEffect(() => {
        const userStr = localStorage.getItem('spot_user');
        if (!userStr) { navigate('/auth'); return; }
        const user = JSON.parse(userStr);
        
        if (user.role !== 'manager') {
            toast.error("Khu vực cấm! Chỉ dành cho Quản lý.");
            navigate('/');
            return;
        }

        fetchData(user.id);
        const interval = setInterval(() => fetchData(user.id), 3000);
        return () => clearInterval(interval);
    }, [navigate]);

    const fetchData = async (userId: string) => {
        try {
            const res = await fetch(`http://localhost:3000/api/manager/dashboard/${userId}`);
            const data = await res.json();
            if (data.lot) {
                setLotData(data);
                setLogs(data.logs || []);
                setRecentBookings(data.recentBookings || []);
            }
        } catch (e) {
            console.error("Connection Error");
        }
    };

    const triggerSimulation = async () => {
        if (!lotData?.lot?.id) return;
        setLoading(true);
        toast.info("Đang kích hoạt giả lập xe ra vào...", { duration: 2000 });

        try {
            const events = ['ENTRY', 'EXIT', 'ENTRY'];
            for (const type of events) {
                await fetch('http://localhost:3000/api/iot/event', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        lotId: lotData.lot.id,
                        type: type,
                        plate: `30F-${Math.floor(Math.random() * 90000 + 10000)}`
                    })
                });
                await new Promise(r => setTimeout(r, 800));
            }
            toast.success("Dữ liệu cảm biến đã cập nhật!");
            const userStr = localStorage.getItem('spot_user');
            if (userStr) fetchData(JSON.parse(userStr).id);
        } catch (err) {
            toast.error("Lỗi kết nối Simulator");
        } finally {
            setLoading(false);
        }
    };

    if (!lotData) return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-cyan-500 font-mono">
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
            <p className="animate-pulse tracking-widest text-sm">INITIALIZING COMMAND CENTER...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
            <Header />
            
            <main className="container mx-auto px-4 py-8 pb-20">
                {/* HERO HEADER */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 flex flex-col md:flex-row justify-between items-end gap-6"
                >
                    <div>
                        <div className="flex items-center gap-2 text-cyan-400 mb-2">
                            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Live Operations</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
                            {lotData.lot.name}
                        </h1>
                        <p className="text-slate-400 flex items-center gap-2 mt-2 font-mono text-sm">
                            <MapPin className="w-4 h-4 text-orange-500" /> {lotData.lot.address}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button 
                            onClick={triggerSimulation} 
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_25px_rgba(79,70,229,0.4)] border border-indigo-400/50 h-10 font-bold tracking-wide"
                        >
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2"/> : <Zap className="w-4 h-4 mr-2 fill-white"/>}
                            {loading ? "PROCESSING..." : "SIMULATE TRAFFIC"}
                        </Button>
                    </div>
                </motion.div>

                {/* KPI GRID */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: "Xe Đang Đỗ", val: `${lotData.stats.activeCars}`, unit: `/ ${lotData.lot.total_spots}`, icon: Car, color: "text-blue-400", border: "border-blue-500/20" },
                        { label: "Doanh Thu Ngày", val: lotData.stats.revenue.toLocaleString(), unit: "đ", icon: DollarSign, color: "text-green-400", border: "border-green-500/20" },
                        { label: "Lượt Xe Vào", val: `${lotData.stats.totalBookings}`, unit: "lượt", icon: History, color: "text-orange-400", border: "border-orange-500/20" },
                        { label: "Công Suất", val: lotData.stats.occupancy.toFixed(1), unit: "%", icon: Activity, color: "text-purple-400", border: "border-purple-500/20" }
                    ].map((item, idx) => (
                        <motion.div key={idx} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                            <Card className={`bg-slate-900/40 backdrop-blur-md border-slate-800 shadow-xl ${item.border}`}>
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className={`p-3 bg-slate-950 rounded-xl border border-slate-800 shadow-inner ${item.color}`}>
                                        <item.icon className="w-6 h-6"/>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{item.label}</p>
                                        <p className={`text-3xl font-black ${item.color} tracking-tight`}>
                                            {item.val} <span className="text-xs text-slate-500 font-normal">{item.unit}</span>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT PANEL: CONTROLS */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="bg-slate-900/80 border-slate-800 shadow-2xl relative overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-white text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Settings className="w-4 h-4 text-orange-500" /> Trung tâm điều khiển
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 relative z-10">
                                <div className="p-5 rounded-2xl bg-black/40 border border-slate-800 backdrop-blur-md">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="font-bold text-slate-200 text-sm">Cổng Chính (Barrier)</span>
                                        <Switch checked={barrierStatus} onCheckedChange={setBarrierStatus} className="data-[state=checked]:bg-green-500"/>
                                    </div>
                                    <div className={`h-16 w-full rounded-lg flex items-center justify-center transition-all duration-500 border-2 border-dashed ${barrierStatus ? 'bg-green-500/10 border-green-500/50 shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)]' : 'bg-red-500/10 border-red-500/50'}`}>
                                        <span className={`font-black text-xl tracking-[0.2em] ${barrierStatus ? 'text-green-500' : 'text-red-500'}`}>
                                            {barrierStatus ? 'OPENED' : 'LOCKED'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between p-5 rounded-2xl bg-black/40 border border-slate-800 backdrop-blur-md">
                                    <div>
                                        <p className="font-bold text-slate-200 text-sm flex items-center gap-2">
                                            <BrainCircuit className="w-4 h-4 text-cyan-400" /> AI Auto-Pilot
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-1">Tự động đóng/mở barrier</p>
                                    </div>
                                    <Switch checked={autoMode} onCheckedChange={setAutoMode} className="data-[state=checked]:bg-cyan-500" />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button variant="outline" onClick={() => setShowReport(true)} className="border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs h-12">
                                        <CreditCard className="w-4 h-4 mr-2 text-purple-400"/> BÁO CÁO
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowPlayback(true)} className="border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs h-12">
                                        <Video className="w-4 h-4 mr-2 text-blue-400"/> PLAYBACK
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT PANEL: CAMERAS & LOGS */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* CAMERA CÓ HÌNH ẢNH THẬT */}
                            <LiveFeed camId="https://images.unsplash.com/photo-1590674899484-d5640e854abe?q=80&w=800&auto=format&fit=crop" location="CAM 01: CỔNG VÀO" active={true} />
                            <LiveFeed camId="https://images.unsplash.com/photo-1582647509711-c8aa8a8bda71?q=80&w=800&auto=format&fit=crop" location="CAM 02: KHU VỰC VIP" active={true} />
                        </div>

                        <Card className="bg-black border-slate-800 font-mono text-xs overflow-hidden shadow-2xl">
                            <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/80 text-slate-400 font-bold flex justify-between items-center">
                                <span className="flex items-center gap-2"><Activity className="w-3 h-3 text-blue-500"/> IOT SENSOR STREAM</span>
                                <span className="text-[9px] bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded">LIVE</span>
                            </div>
                            <div className="p-4 h-[200px] overflow-y-auto space-y-3 custom-scrollbar bg-black/50">
                                <AnimatePresence>
                                    {logs.length > 0 ? logs.map((log, i) => (
                                        <motion.div key={log.id || i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex gap-3 text-slate-300 border-b border-slate-900/50 pb-2 last:border-0">
                                            <span className="text-slate-600 min-w-[80px]">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                            <span className={`font-bold ${log.event_type === 'ENTRY' ? 'text-green-500' : 'text-red-500'}`}>
                                                {log.event_type === 'ENTRY' ? '>>> XE VÀO' : '<<< XE RA '}
                                            </span>
                                            <span className="text-yellow-500 font-bold tracking-wider">{log.vehicle_plate}</span>
                                        </motion.div>
                                    )) : (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-700 gap-2">
                                            <Loader2 className="w-6 h-6 animate-spin"/>
                                            <span>Đang chờ tín hiệu từ cảm biến...</span>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>

            {/* REPORT DIALOG - FULLY FUNCTIONAL */}
            <Dialog open={showReport} onOpenChange={setShowReport}>
                <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-4xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-purple-500"/> Báo Cáo Doanh Thu & Lưu Lượng
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">Dữ liệu cập nhật đến {new Date().toLocaleTimeString()}</DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-3 gap-4 my-4">
                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center">
                            <p className="text-xs text-slate-500 uppercase font-bold">Tổng thu hôm nay</p>
                            <p className="text-2xl font-black text-green-400 mt-1">{lotData.stats.revenue.toLocaleString()}đ</p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center">
                            <p className="text-xs text-slate-500 uppercase font-bold">Tổng lượt xe</p>
                            <p className="text-2xl font-black text-blue-400 mt-1">{recentBookings.length}</p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center">
                            <p className="text-xs text-slate-500 uppercase font-bold">Trung bình vé</p>
                            <p className="text-2xl font-black text-orange-400 mt-1">
                                {recentBookings.length > 0 ? Math.round(lotData.stats.revenue / recentBookings.length).toLocaleString() : 0}đ
                            </p>
                        </div>
                    </div>

                    <div className="border rounded-md border-slate-800 overflow-hidden max-h-[300px] overflow-y-auto">
                        <Table>
                            <TableHeader className="bg-slate-950 sticky top-0">
                                <TableRow className="border-slate-800">
                                    <TableHead className="text-slate-400 font-bold">Thời gian</TableHead>
                                    <TableHead className="text-slate-400 font-bold">Biển số</TableHead>
                                    <TableHead className="text-slate-400 font-bold">Trạng thái</TableHead>
                                    <TableHead className="text-right text-slate-400 font-bold">Thành tiền</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentBookings.length > 0 ? recentBookings.map((booking: any, i: number) => (
                                    <TableRow key={i} className="border-slate-800 hover:bg-slate-800/50">
                                        <TableCell className="font-mono text-slate-300">{new Date(booking.created_at).toLocaleString('vi-VN')}</TableCell>
                                        <TableCell className="font-bold text-white font-mono">{booking.vehicle_number}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${booking.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                {booking.status === 'completed' ? 'ĐÃ THANH TOÁN' : 'ĐANG ĐỖ'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-emerald-400">
                                            {booking.status === 'completed' ? booking.total_cost.toLocaleString() + 'đ' : '-'}
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-500 italic">Chưa có dữ liệu giao dịch</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button className="bg-green-600 hover:bg-green-700 h-9 text-xs font-bold shadow-lg shadow-green-900/20"><Download className="w-3 h-3 mr-2"/> XUẤT BÁO CÁO EXCEL</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* PLAYBACK DIALOG - PRO PLAYER */}
            <Dialog open={showPlayback} onOpenChange={setShowPlayback}>
                <DialogContent className="bg-black border-slate-800 text-white max-w-4xl p-0 overflow-hidden shadow-2xl">
                    <div className="relative bg-slate-900 aspect-video flex items-center justify-center overflow-hidden group">
                        <img 
                             src="https://images.unsplash.com/photo-1563452619219-9d916e968374?q=80&w=1000" 
                             className={`w-full h-full object-cover opacity-50 ${isPlaying ? 'opacity-100 transition-none' : 'transition-opacity duration-500'}`}
                        />
                        <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
                        
                        {/* HUD Overlay */}
                        <div className="absolute top-4 right-4 font-mono text-sm bg-black/60 px-2 py-1 rounded text-green-400 border border-green-500/30">
                            {new Date().toLocaleDateString()} 14:30:00
                        </div>
                        <div className="absolute top-4 left-4 bg-blue-600 px-2 py-1 rounded text-[10px] font-bold tracking-widest shadow-lg shadow-blue-500/20">PLAYBACK MODE</div>

                        {!isPlaying && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
                                <Play className="w-20 h-20 text-white/90 fill-white/20 cursor-pointer hover:scale-110 transition-transform drop-shadow-lg" onClick={() => setIsPlaying(true)}/>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-slate-950 border-t border-slate-800">
                        <div className="flex items-center gap-4 mb-2">
                            <Button size="icon" variant="ghost" className="hover:text-blue-400 hover:bg-slate-800" onClick={() => setIsPlaying(!isPlaying)}>
                                {isPlaying ? <Pause className="w-5 h-5 fill-current"/> : <Play className="w-5 h-5 fill-current"/>}
                            </Button>
                            <SkipBack className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition-colors"/>
                            <div className="flex-1">
                                <Slider value={playbackVal} max={100} step={1} onValueChange={setPlaybackVal} className="cursor-pointer" />
                            </div>
                            <SkipForward className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white transition-colors"/>
                            <span className="font-mono text-xs text-slate-400 font-bold">14:30 / 24:00</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default ManagerDashboard;
