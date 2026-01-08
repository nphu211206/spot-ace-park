import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Database, AlertTriangle, Eye, ShieldCheck, Cpu, Server, Wifi, Car, DollarSign, TrendingUp, Zap, Battery, Thermometer, Users, MapPin, Clock, BarChart3, PieChart, Globe, Shield, Bell, Settings, Power, RefreshCw } from "lucide-react";
import {
    Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    BarChart, Bar, Cell, LineChart, Line
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

// --- UTILS ---
const formatCurrency = (num: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

// --- MOCK DATA ---
const chartData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    revenue: Math.floor(Math.random() * 5000000) + 2000000 + (i > 17 ? 3000000 : 0),
    traffic: Math.floor(Math.random() * 100) + 20,
    occupancy: Math.floor(Math.random() * 40) + 40,
}));

const healthData = [
    { subject: 'CPU', A: 75, fullMark: 100 },
    { subject: 'RAM', A: 60, fullMark: 100 },
    { subject: 'NET', A: 95, fullMark: 100 },
    { subject: 'DISK', A: 40, fullMark: 100 },
    { subject: 'AI', A: 90, fullMark: 100 },
    { subject: 'CAM', A: 85, fullMark: 100 },
];

const zoneData = [
    { name: 'Zone A', value: 85, color: '#22c55e' },
    { name: 'Zone B', value: 72, color: '#3b82f6' },
    { name: 'Zone C', value: 58, color: '#f59e0b' },
    { name: 'VIP', value: 95, color: '#8b5cf6' },
    { name: 'EV', value: 40, color: '#06b6d4' },
];

const weeklyData = [
    { day: 'T2', revenue: 4500000, cars: 120 },
    { day: 'T3', revenue: 5200000, cars: 145 },
    { day: 'T4', revenue: 4800000, cars: 132 },
    { day: 'T5', revenue: 6100000, cars: 168 },
    { day: 'T6', revenue: 7200000, cars: 195 },
    { day: 'T7', revenue: 8500000, cars: 220 },
    { day: 'CN', revenue: 6800000, cars: 185 },
];

// --- ANIMATED NUMBER COMPONENT ---
const AnimatedNumber = ({ value, prefix = "", suffix = "" }: { value: number, prefix?: string, suffix?: string }) => {
    const [displayValue, setDisplayValue] = useState(0);
    useEffect(() => {
        const duration = 1500;
        const steps = 60;
        const increment = value / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setDisplayValue(value);
                clearInterval(timer);
            } else {
                setDisplayValue(Math.floor(current));
            }
        }, duration / steps);
        return () => clearInterval(timer);
    }, [value]);
    return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
};

// --- MINI CHART COMPONENT ---
const MiniSparkline = ({ data, color }: { data: number[], color: string }) => (
    <div className="flex items-end gap-0.5 h-8">
        {data.map((val, i) => (
            <motion.div
                key={i}
                className="w-1 rounded-t"
                style={{ backgroundColor: color }}
                initial={{ height: 0 }}
                animate={{ height: `${val}%` }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
            />
        ))}
    </div>
);

// --- CAMERA FEED COMPONENT ---
const SecurityFeed = ({ id, label, status = "REC", threat = false }: { id: number, label: string, status?: string, threat?: boolean }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        className={`relative aspect-video bg-black rounded-xl overflow-hidden border-2 group cursor-pointer transition-all duration-300 shadow-2xl ${threat ? 'border-red-500 animate-pulse' : 'border-slate-800 hover:border-cyan-500/50'}`}
    >
        <img
            src={`https://images.unsplash.com/photo-1590674899484-d5640e854abe?q=80&w=400&auto=format&fit=crop&sig=${id}`}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500 grayscale group-hover:grayscale-0"
            alt="CCTV"
        />

        {/* Scan Lines Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30" />

        {/* AI Detection Overlay */}
        {threat && (
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 border-2 border-red-500 rounded animate-pulse" />
                <Badge className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 animate-bounce">
                    <AlertTriangle className="w-3 h-3 mr-1" /> ALERT
                </Badge>
            </div>
        )}

        {/* UI Overlay */}
        <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
            <div className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px] ${status === 'REC' ? 'bg-red-600 shadow-red-500' : 'bg-yellow-500 shadow-yellow-500'}`} />
            <span className={`text-[9px] font-mono font-bold tracking-widest ${status === 'REC' ? 'text-red-500' : 'text-yellow-500'}`}>{status}</span>
        </div>

        <div className="absolute top-2 right-2">
            <Badge variant="outline" className="text-[8px] h-4 border-slate-600 bg-black/60 text-slate-300 font-mono rounded-sm px-1">
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
    </motion.div>
);

// --- STAT CARD COMPONENT ---
const StatCard = ({ title, value, prefix, suffix, icon: Icon, trend, trendValue, color, sparkData }: any) => (
    <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
        <Card className={`bg-slate-900/60 border-slate-800 backdrop-blur-xl shadow-2xl overflow-hidden relative group hover:border-${color}-500/30 transition-all duration-500`}>
            <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-${color}-500 to-transparent`} />
            <CardContent className="p-5">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">{title}</p>
                        <p className={`text-3xl font-black text-${color}-400 tabular-nums tracking-tight`}>
                            <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
                        </p>
                        {trend && (
                            <div className={`flex items-center gap-1 mt-2 text-[10px] ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                <TrendingUp className={`w-3 h-3 ${trend < 0 && 'rotate-180'}`} />
                                <span>{trend > 0 ? '+' : ''}{trendValue}</span>
                            </div>
                        )}
                    </div>
                    <div className={`p-3 rounded-xl bg-${color}-500/10 border border-${color}-500/20`}>
                        <Icon className={`w-6 h-6 text-${color}-400`} />
                    </div>
                </div>
                {sparkData && (
                    <div className="mt-4">
                        <MiniSparkline data={sparkData} color={`hsl(var(--${color === 'emerald' ? 'success' : color === 'blue' ? 'primary' : 'accent'}))`} />
                    </div>
                )}
            </CardContent>
        </Card>
    </motion.div>
);

// --- MAIN COMPONENT ---
const AdminDashboard = () => {
    const [stats, setStats] = useState({ revenue: 3500000, bookings: 42, occupancy: 65.4, evCharging: 8, alerts: 2 });
    const [logs, setLogs] = useState<any[]>([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [systemStatus, setSystemStatus] = useState({ cpu: 45, ram: 62, network: 98, uptime: 99.9 });

    useEffect(() => {
        const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);

        const dataInterval = setInterval(() => {
            setStats(prev => ({
                revenue: prev.revenue + Math.floor(Math.random() * 100000),
                bookings: prev.bookings + (Math.random() > 0.7 ? 1 : 0),
                occupancy: Math.min(100, Math.max(20, prev.occupancy + (Math.random() - 0.5) * 2)),
                evCharging: Math.floor(Math.random() * 12),
                alerts: Math.floor(Math.random() * 5)
            }));

            setSystemStatus({
                cpu: Math.floor(Math.random() * 30) + 40,
                ram: Math.floor(Math.random() * 20) + 55,
                network: Math.floor(Math.random() * 5) + 95,
                uptime: 99.9
            });

            const events = [
                { msg: "Phát hiện xe 51H-123.45 vào cổng A", type: "success", icon: Eye },
                { msg: "Giao dịch hoàn tất: 50.000đ", type: "info", icon: Database },
                { msg: "EV Station #2: Đang sạc 45%", type: "ev", icon: Battery },
                { msg: "AI: Phát hiện biển số 30F-789.12", type: "ai", icon: Cpu },
                { msg: "Cảnh báo: Camera Zone B mất tín hiệu", type: "warning", icon: AlertTriangle },
            ];
            const randEvt = events[Math.floor(Math.random() * events.length)];

            setLogs(prev => [{
                id: Date.now(),
                time: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
                ...randEvt
            }, ...prev].slice(0, 15));

        }, 3000);

        return () => {
            clearInterval(timeInterval);
            clearInterval(dataInterval);
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 p-6 font-sans">
            {/* HEADER */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4 border-b border-slate-800/60 pb-6"
            >
                <div>
                    <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                        SPOT ACE <span className="text-white text-lg font-light opacity-50">///</span> COMMAND CENTER
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-mono text-slate-400">
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            ALL SYSTEMS OPERATIONAL
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> {currentTime.toLocaleTimeString('vi-VN')}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Server className="w-3 h-3" /> LATENCY: 12ms
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Wifi className="w-3 h-3" /> IOT: 48/48 ONLINE
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Globe className="w-3 h-3" /> 3 LOCATIONS
                        </span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm" className="border-slate-700 bg-slate-950/50 hover:bg-slate-800 text-slate-300 font-mono text-xs h-9">
                        <RefreshCw className="w-3 h-3 mr-2" /> SYNC DATA
                    </Button>
                    <Button variant="outline" size="sm" className="border-slate-700 bg-slate-950/50 hover:bg-slate-800 text-slate-300 font-mono text-xs h-9">
                        <Settings className="w-3 h-3 mr-2" /> CONFIG
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700 text-white shadow-[0_0_25px_rgba(220,38,38,0.4)] border border-red-500 font-bold text-xs h-9">
                        <Power className="w-3 h-3 mr-2" /> EMERGENCY
                    </Button>
                </div>
            </motion.div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-12 gap-6">

                {/* KPI CARDS - TOP ROW */}
                <div className="col-span-12 grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard title="Net Revenue" value={stats.revenue} prefix="" suffix="đ" icon={DollarSign} trend={1} trendValue="+12.5% hôm nay" color="emerald" sparkData={[40, 60, 55, 70, 65, 80, 75, 90]} />
                    <StatCard title="Traffic Flow" value={stats.bookings} suffix=" xe" icon={Car} trend={1} trendValue="+8 lượt" color="blue" sparkData={[30, 45, 50, 40, 60, 55, 70, 65]} />
                    <StatCard title="Occupancy" value={Math.round(stats.occupancy)} suffix="%" icon={BarChart3} color="purple" sparkData={[60, 65, 70, 68, 72, 75, 70, 68]} />
                    <StatCard title="EV Charging" value={stats.evCharging} suffix=" xe" icon={Zap} color="cyan" />
                    <StatCard title="Active Alerts" value={stats.alerts} icon={Bell} color="amber" />
                </div>

                {/* LEFT COLUMN */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* MAIN CHART */}
                    <Card className="bg-slate-900/60 border-slate-800 shadow-2xl">
                        <CardHeader className="pb-0 border-b border-slate-800/50">
                            <CardTitle className="text-white flex items-center gap-2 font-mono text-xs uppercase tracking-widest py-2">
                                <Activity className="w-4 h-4 text-cyan-400" /> Real-time Analytics Dashboard
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={30} />
                                    <YAxis stroke="#475569" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ fontSize: '12px' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={2} fill="url(#colorRev)" name="Doanh thu" />
                                    <Area type="monotone" dataKey="occupancy" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorOcc)" name="Công suất %" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* CCTV GRID */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <SecurityFeed id={1} label="GATE A - ENTRY" />
                        <SecurityFeed id={2} label="ZONE B - VIP" threat />
                        <SecurityFeed id={3} label="EV STATION" status="AI" />
                        <SecurityFeed id={4} label="EXIT GATE" />
                    </div>

                    {/* WEEKLY CHART */}
                    <Card className="bg-slate-900/60 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-green-400" /> Weekly Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="day" stroke="#475569" tick={{ fontSize: 10 }} axisLine={false} />
                                    <YAxis stroke="#475569" tick={{ fontSize: 10 }} axisLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px' }} />
                                    <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} name="Doanh thu" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    {/* SYSTEM HEALTH RADAR */}
                    <Card className="bg-slate-900/60 border-slate-800">
                        <CardHeader className="pb-0 pt-4">
                            <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] text-center flex items-center justify-center gap-2">
                                <Cpu className="w-3 h-3" /> Infrastructure Health
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={healthData}>
                                    <PolarGrid stroke="#334155" strokeOpacity={0.5} />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="Health" dataKey="A" stroke="#22c55e" strokeWidth={2} fill="#22c55e" fillOpacity={0.2} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* ZONE OCCUPANCY */}
                    <Card className="bg-slate-900/60 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Zone Occupancy</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {zoneData.map((zone, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400">{zone.name}</span>
                                        <span className="font-bold" style={{ color: zone.color }}>{zone.value}%</span>
                                    </div>
                                    <Progress value={zone.value} className="h-2" style={{ '--progress-color': zone.color } as any} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* LIVE SYSTEM STATUS */}
                    <Card className="bg-slate-900/60 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Server className="w-3 h-3" /> System Metrics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'CPU', value: systemStatus.cpu, color: 'cyan' },
                                { label: 'RAM', value: systemStatus.ram, color: 'purple' },
                                { label: 'Network', value: systemStatus.network, color: 'green' },
                                { label: 'Uptime', value: systemStatus.uptime, color: 'blue' },
                            ].map((m, i) => (
                                <div key={i} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                                    <p className="text-[9px] text-slate-500 uppercase tracking-wider">{m.label}</p>
                                    <p className={`text-xl font-bold text-${m.color}-400 mt-1`}>{m.value}%</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* TERMINAL LOGS */}
                    <Card className="bg-black border-slate-800 font-mono text-[10px] h-[280px] flex flex-col shadow-inner shadow-slate-950 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/U3qYN8S0j3bpK/giphy.gif')] opacity-[0.03] pointer-events-none bg-cover" />

                        <CardHeader className="py-2 border-b border-slate-900 bg-slate-950/80 z-10">
                            <CardTitle className="text-green-500 font-bold flex items-center gap-2 text-xs">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> SYSTEM LOGS
                                <Badge variant="outline" className="ml-auto text-[8px] border-green-800 text-green-500">LIVE</Badge>
                            </CardTitle>
                        </CardHeader>
                        <ScrollArea className="flex-1 p-3 z-10">
                            <div className="space-y-2">
                                <AnimatePresence>
                                    {logs.map((log) => (
                                        <motion.div
                                            key={log.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="flex gap-2 items-start"
                                        >
                                            <span className="text-slate-600 min-w-[55px]">[{log.time}]</span>
                                            <log.icon className={`w-3 h-3 mt-0.5 flex-shrink-0
                        ${log.type === 'success' ? 'text-emerald-500' : ''}
                        ${log.type === 'warning' ? 'text-yellow-500' : ''}
                        ${log.type === 'info' ? 'text-blue-500' : ''}
                        ${log.type === 'ai' ? 'text-purple-500' : ''}
                        ${log.type === 'ev' ? 'text-cyan-500' : ''}
                      `} />
                                            <span className={`
                        ${log.type === 'success' ? 'text-emerald-400' : ''}
                        ${log.type === 'warning' ? 'text-yellow-400' : ''}
                        ${log.type === 'info' ? 'text-blue-300' : ''}
                        ${log.type === 'ai' ? 'text-purple-400' : ''}
                        ${log.type === 'ev' ? 'text-cyan-400' : ''}
                      `}>
                                                {log.msg}
                                            </span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </ScrollArea>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;