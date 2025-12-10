import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Database, AlertTriangle, Eye, ShieldCheck, Cpu, Server, Wifi } from "lucide-react";
import { 
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- UTILS ---
const formatCurrency = (num: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

// --- MOCK DATA ---
const chartData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    revenue: Math.floor(Math.random() * 5000000) + 2000000 + (i > 17 ? 3000000 : 0),
    traffic: Math.floor(Math.random() * 100) + 20,
}));

const healthData = [
  { subject: 'CPU', A: 75, fullMark: 100 },
  { subject: 'RAM', A: 60, fullMark: 100 },
  { subject: 'NET', A: 95, fullMark: 100 },
  { subject: 'DISK', A: 40, fullMark: 100 },
  { subject: 'AI', A: 90, fullMark: 100 },
  { subject: 'CAM', A: 85, fullMark: 100 },
];

// --- COMPONENT: CAMERA FEED (THE RESTORATION) ---
const SecurityFeed = ({ id, label, status = "REC" }: { id: number, label: string, status?: string }) => (
    <div className="relative aspect-video bg-black rounded-sm overflow-hidden border border-slate-800 group cursor-pointer hover:border-red-500/50 transition-all duration-300 shadow-lg">
      {/* Image Placeholder with Glitch Effect on Hover */}
      <img 
          src={`https://images.unsplash.com/photo-1590674899484-d5640e854abe?q=80&w=400&auto=format&fit=crop&sig=${id}`} 
          className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500 grayscale group-hover:grayscale-0"
          alt="CCTV"
      />
      
      {/* Scan Lines Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30"></div>
      
      {/* UI Overlay */}
      <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
          <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_#ef4444]"></div>
          <span className="text-[8px] font-mono text-red-500 font-bold tracking-widest">{status}</span>
      </div>
      
      <div className="absolute top-2 right-2">
          <Badge variant="outline" className="text-[8px] h-4 border-slate-600 bg-black/50 text-slate-300 font-mono rounded-sm px-1">
              CAM-0{id}
          </Badge>
      </div>
  
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-8">
          <div className="flex justify-between items-end">
              <p className="text-[10px] font-mono text-green-400 font-bold tracking-wider uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> {label}
              </p>
              <p className="text-[8px] font-mono text-slate-500">{new Date().toLocaleTimeString()}</p>
          </div>
      </div>
    </div>
  );

const AdminDashboard = () => {
  const [stats, setStats] = useState({ revenue: 3500000, bookings: 42, occupancy: 65.4 });
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate Live Data
      setStats(prev => ({
          revenue: prev.revenue + Math.floor(Math.random() * 100000),
          bookings: prev.bookings + (Math.random() > 0.7 ? 1 : 0),
          occupancy: Math.min(100, Math.max(20, prev.occupancy + (Math.random() - 0.5)))
      }));

      const events = [
          { msg: "Phát hiện xe 51H-123.45 vào cổng A", type: "success", icon: Eye },
          { msg: "Giao dịch hoàn tất: 50.000đ", type: "info", icon: Database },
          { msg: "Cảnh báo nhiệt độ máy chủ tăng", type: "warning", icon: AlertTriangle },
          { msg: "AI Pricing: Điều chỉnh giá +5%", type: "system", icon: Cpu }
      ];
      const randEvt = events[Math.floor(Math.random() * events.length)];
      
      setLogs(prev => [{
          id: Date.now(),
          time: new Date().toLocaleTimeString('vi-VN', {hour12: false}),
          ...randEvt
      }, ...prev].slice(0, 10));

    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-6 font-sans">
      {/* HEADER: THE COMMAND DECK */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-800/60 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
            SPOT ACE <span className="text-white text-lg font-light opacity-50">///</span> WAR ROOM
          </h1>
          <div className="flex items-center gap-4 mt-2 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                SYSTEM ONLINE
            </span>
            <span className="flex items-center gap-1.5">
                <Server className="w-3 h-3"/> LATENCY: 12ms
            </span>
            <span className="flex items-center gap-1.5">
                <Wifi className="w-3 h-3"/> IOT SENSORS: 24/24
            </span>
          </div>
        </div>
        <div className="flex gap-3">
            <Button variant="outline" className="border-slate-700 bg-slate-950/50 hover:bg-slate-800 text-slate-300 font-mono text-xs h-9">
                EXPORT DATA
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-pulse border border-red-500 font-bold text-xs h-9">
                EMERGENCY SHUTDOWN
            </Button>
        </div>
      </div>

      {/* MAIN GRID: BENTO STYLE */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* COLUMN 1: METRICS & KPI (3 cols) */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
            {/* REVENUE CARD */}
            <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl shadow-xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Net Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black text-emerald-400 tabular-nums tracking-tight">
                        {formatCurrency(stats.revenue)}
                    </div>
                    <div className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
                        <Activity className="w-3 h-3" /> +12.5% so với hôm qua
                    </div>
                </CardContent>
            </Card>

            {/* TRAFFIC CARD */}
            <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl shadow-xl group hover:border-blue-500/30 transition-colors">
                <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Traffic Flow</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-blue-400 tabular-nums">{stats.bookings}</span>
                        <span className="text-xs text-slate-500 mb-1.5">xe đang đỗ</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 mt-4 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[45%] shadow-[0_0_10px_#3b82f6]"></div>
                    </div>
                </CardContent>
            </Card>

            {/* OCCUPANCY CARD (FIXED UI) */}
            <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl shadow-xl group">
                <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Occupancy</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-4">
                    {/* CIRCULAR PROGRESS */}
                    <div className="relative w-28 h-28">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="56" cy="56" r="48" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                            <circle cx="56" cy="56" r="48" stroke="#a855f7" strokeWidth="8" fill="transparent" strokeDasharray={301.6} strokeDashoffset={301.6 * (1 - stats.occupancy / 100)} className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-white tabular-nums">{stats.occupancy.toFixed(1)}%</span>
                            <span className="text-[9px] text-slate-500 uppercase">Capacity</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* COLUMN 2: MAIN VISUALS (6 cols) */}
        <div className="col-span-12 lg:col-span-6 space-y-6">
            {/* MAIN CHART */}
            <Card className="bg-slate-900/60 border-slate-800 shadow-2xl h-[320px]">
                <CardHeader className="pb-0 border-b border-slate-800/50">
                    <CardTitle className="text-white flex items-center gap-2 font-mono text-xs uppercase tracking-widest py-2">
                        <Activity className="w-3 h-3 text-cyan-400"/> Real-time Analytics
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="time" stroke="#475569" tick={{fontSize: 10}} axisLine={false} tickLine={false} minTickGap={30} />
                            <YAxis stroke="#475569" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }}
                                itemStyle={{ fontSize: '12px', color: '#22d3ee' }}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={2} fill="url(#colorRev)" animationDuration={1500} />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* CCTV GRID (RESTORED & ENHANCED) */}
            <div className="grid grid-cols-2 gap-4">
                <SecurityFeed id={1} label="GATE A - ENTRY" />
                <SecurityFeed id={2} label="ZONE B - VIP" />
            </div>
        </div>

        {/* COLUMN 3: LOGS & HEALTH (3 cols) */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
            {/* RADAR HEALTH */}
            <Card className="bg-slate-900/40 border-slate-800">
                <CardHeader className="pb-0 pt-4">
                    <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] text-center">Server Health</CardTitle>
                </CardHeader>
                <CardContent className="p-0 h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="60%" data={healthData}>
                            <PolarGrid stroke="#334155" strokeOpacity={0.5} />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 'bold' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Health" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.2} />
                        </RadarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* TERMINAL LOGS */}
            <Card className="bg-black border-slate-800 font-mono text-[10px] h-[300px] flex flex-col shadow-inner shadow-slate-950 relative overflow-hidden">
                {/* Matrix Rain Effect Overlay */}
                <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/U3qYN8S0j3bpK/giphy.gif')] opacity-5 pointer-events-none bg-cover"></div>
                
                <CardHeader className="py-2 border-b border-slate-900 bg-slate-950/80 z-10">
                    <CardTitle className="text-green-500 font-bold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> SYSTEM LOGS
                    </CardTitle>
                </CardHeader>
                <ScrollArea className="flex-1 p-3 z-10">
                    <div className="space-y-2.5">
                        {logs.map((log, i) => (
                            <div key={log.id} className="flex gap-2 items-start animate-in slide-in-from-left-2 fade-in duration-300">
                                <span className="text-slate-600 min-w-[50px]">[{log.time}]</span>
                                <div className="flex items-center gap-1.5">
                                    <log.icon className={`w-3 h-3 
                                        ${log.type === 'success' ? 'text-emerald-500' : ''}
                                        ${log.type === 'warning' ? 'text-yellow-500' : ''}
                                        ${log.type === 'info' ? 'text-blue-500' : ''}
                                        ${log.type === 'system' ? 'text-purple-500' : ''}
                                    `} />
                                    <span className={`
                                        ${log.type === 'success' ? 'text-emerald-400' : ''}
                                        ${log.type === 'warning' ? 'text-yellow-400' : ''}
                                        ${log.type === 'info' ? 'text-blue-300' : ''}
                                        ${log.type === 'system' ? 'text-purple-400' : ''}
                                    `}>
                                        {log.msg}
                                    </span>
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