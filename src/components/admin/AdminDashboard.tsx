import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Car, Activity, Server, Wifi, Zap, AlertTriangle, Eye, Radio, Database, Cpu, ShieldCheck, History } from "lucide-react";
import { toast } from "sonner";
import { 
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// --- TYPES & INTERFACES (CHUẨN STRICT TYPE) ---
interface SystemHealth {
  cpu: number;
  ram: number;
  network: number;
  storage: number;
  temperature: number;
}

interface LogEntry {
  id: string;
  time: string;
  event: string;
  details: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

// --- MOCK DATA GENERATORS (ĐỂ GIAO DIỆN LUÔN ĐẸP) ---
const generateChartData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    revenue: Math.floor(Math.random() * 5000000) + 2000000 + (i > 18 ? 3000000 : 0),
    occupancy: Math.floor(Math.random() * 40) + 40,
    traffic: Math.floor(Math.random() * 100) + 50,
  }));
};

const generateHealthData = () => [
  { subject: 'CPU Load', A: 80, fullMark: 100 },
  { subject: 'RAM Usage', A: 65, fullMark: 100 },
  { subject: 'Network I/O', A: 90, fullMark: 100 },
  { subject: 'Disk Speed', A: 75, fullMark: 100 },
  { subject: 'AI Engines', A: 95, fullMark: 100 },
  { subject: 'Camera Feed', A: 85, fullMark: 100 },
];

// --- COMPONENTS CON (SUB-COMPONENTS) ---

// 1. Biểu Đồ Radar (Sức Khỏe Hệ Thống)
const SystemRadar = ({ data }: { data: any[] }) => (
  <div className="h-[300px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar name="System Health" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.3} />
        <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
            itemStyle={{ color: '#a78bfa' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  </div>
);

// 2. Biểu Đồ Area (Doanh Thu & Lưu Lượng)
const RevenueChart = ({ data }: { data: any[] }) => (
  <div className="h-[350px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorTraf" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="time" stroke="#64748b" tick={{fontSize: 12}} axisLine={false} tickLine={false} minTickGap={30} />
        <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val) => `${val/1000000}M`} />
        <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
        <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid #334155', borderRadius: '8px', backdropFilter: 'blur(4px)' }}
            labelStyle={{ color: '#e2e8f0' }}
        />
        <Legend iconType="circle" />
        <Area yAxisId="left" type="monotone" dataKey="revenue" name="Doanh Thu (VND)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" animationDuration={1500} />
        <Area yAxisId="right" type="monotone" dataKey="traffic" name="Lưu Lượng (Xe)" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTraf)" animationDuration={1500} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// 3. Camera Feed Giả Lập (Có hiệu ứng Glitch)
const SecurityFeed = ({ id, label }: { id: number, label: string }) => (
  <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-slate-700 group cursor-pointer hover:border-red-500 transition-all duration-300">
    <img 
        src={`https://source.unsplash.com/random/400x300/?parking,garage,night&sig=${id}`} 
        className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity duration-500"
        alt="CCTV"
    />
    {/* Overlay UI */}
    <div className="absolute top-2 left-2 flex items-center gap-2">
        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]"></div>
        <span className="text-[10px] font-mono text-red-500 font-bold tracking-widest">REC ●</span>
    </div>
    <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
        <p className="text-[10px] font-mono text-green-400">{label}</p>
        <p className="text-[8px] font-mono text-slate-400">{new Date().toLocaleTimeString()}</p>
    </div>
    {/* Grid Overlay */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
  </div>
);

// --- MAIN COMPONENT ---
const AdminDashboard = () => {
  const [stats, setStats] = useState({ revenue: 0, bookings: 0, occupancy: 0 });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [chartData, setChartData] = useState(generateChartData());
  const [healthData, setHealthData] = useState(generateHealthData());
  const [isConnected, setIsConnected] = useState(true); // Giả lập luôn kết nối để đẹp

  // Hiệu ứng nhảy số & Log
  useEffect(() => {
    // 1. Poll Data từ API thật (Nếu có) hoặc Fallback sang giả lập
    const interval = setInterval(() => {
      // Logic: Lấy data thật -> Nếu lỗi hoặc = 0 -> Lấy data giả để UI không chết
      fetch('http://localhost:3000/api/stats')
        .then(res => res.json())
        .then(data => {
            if (data.revenue > 0) setStats(data);
            else throw new Error("Empty Data");
        })
        .catch(() => {
            // Fallback Simulation
            setStats(prev => ({
                revenue: prev.revenue + Math.floor(Math.random() * 50000),
                bookings: prev.bookings + 1,
                occupancy: Math.min(100, Math.max(40, prev.occupancy + (Math.random() > 0.5 ? 1 : -1)))
            }));
        });

      // 2. Cập nhật Log giả lập
      const newLog: LogEntry = {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString(),
        event: ['Xe Vào', 'Xe Ra', 'Thanh Toán', 'Cảnh Báo', 'Hệ Thống'][Math.floor(Math.random() * 5)],
        details: `Biển số ${Math.floor(Math.random()*99)}A-${Math.floor(Math.random()*99999)} tại Cổng ${['A','B','C'][Math.floor(Math.random()*3)]}`,
        type: 'info'
      };
      setLogs(prev => [newLog, ...prev].slice(0, 20));

    }, 2000); // 2 giây nhảy 1 lần

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-6 font-sans">
      {/* --- HEADER: THE COMMAND CENTER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            WAR ROOM : INFINITY
          </h1>
          <p className="text-slate-400 flex items-center gap-2 mt-2 font-mono text-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            SYSTEM STATUS: OPERATIONAL | LATENCY: 12ms | AI CORES: ACTIVE
          </p>
        </div>
        <div className="flex gap-3">
            <Button variant="outline" className="border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300">
                <Database className="w-4 h-4 mr-2"/> Export Data
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-pulse border border-red-500">
                <AlertTriangle className="w-4 h-4 mr-2"/> EMERGENCY STOP
            </Button>
        </div>
      </div>

      {/* --- MAIN GRID LAYOUT --- */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: KPI CARDS (Col-3) */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
            {/* Revenue Card */}
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-md">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-widest">Tổng Doanh Thu</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-black text-emerald-400 tabular-nums">
                        {stats.revenue.toLocaleString()} <span className="text-sm text-emerald-700">VND</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 mt-4 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[75%] shadow-[0_0_10px_#10b981]"></div>
                    </div>
                </CardContent>
            </Card>

            {/* Traffic Card */}
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-md">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-widest">Lưu Lượng Xe</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-end">
                        <div className="text-3xl font-black text-blue-400 tabular-nums">{stats.bookings}</div>
                        <Badge variant="outline" className="border-blue-500/30 text-blue-400 mb-1">+12/h</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Dự báo: Tăng mạnh vào 18:00</p>
                </CardContent>
            </Card>

            {/* Occupancy Card */}
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-md">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-widest">Tỉ Lệ Lấp Đầy</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-4 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-purple-400">{stats.occupancy}%</span>
                        </div>
                        <svg className="w-24 h-24 transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                            <circle cx="48" cy="48" r="40" stroke="#a855f7" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 * (1 - stats.occupancy / 100)} className="transition-all duration-1000" />
                        </svg>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* MIDDLE COLUMN: MAIN CHART & CAMS (Col-6) */}
        <div className="col-span-12 lg:col-span-6 space-y-6">
            <Card className="bg-slate-900 border-slate-800 shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-500"/> Live Traffic Analysis
                    </CardTitle>
                    <CardDescription>Dữ liệu được cập nhật theo thời gian thực từ 24 cảm biến IoT</CardDescription>
                </CardHeader>
                <CardContent>
                    <RevenueChart data={chartData} />
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
                <SecurityFeed id={1} label="CAM-01: Cổng Chính" />
                <SecurityFeed id={2} label="CAM-02: Khu Vực VIP" />
            </div>
        </div>

        {/* RIGHT COLUMN: LOGS & HEALTH (Col-3) */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
            {/* System Health Radar */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-0">
                    <CardTitle className="text-sm font-medium text-slate-400">Server Health</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <SystemRadar data={healthData} />
                </CardContent>
            </Card>

            {/* Live Log Terminal */}
            <Card className="bg-black border-slate-800 font-mono text-xs h-[400px] flex flex-col shadow-inner shadow-slate-900">
                <CardHeader className="py-3 border-b border-slate-800 bg-slate-900/50">
                    <CardTitle className="text-sm text-green-500 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 animate-pulse rounded-full"></span>
                        TERMINAL LOGS
                    </CardTitle>
                </CardHeader>
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                        {logs.map((log, idx) => (
                            <div key={log.id} className={`flex gap-3 animate-in slide-in-from-left-2 duration-300 opacity-${100 - idx*5}`}>
                                <span className="text-slate-500">[{log.time}]</span>
                                <div>
                                    <span className={`font-bold ${log.event === 'Xe Vào' ? 'text-green-400' : log.event === 'Xe Ra' ? 'text-orange-400' : 'text-blue-400'}`}>
                                        {log.event}
                                    </span>
                                    <span className="text-slate-400 mx-1">::</span>
                                    <span className="text-slate-300">{log.details}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;