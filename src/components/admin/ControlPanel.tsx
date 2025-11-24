import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CloudRain, CloudSun, DollarSign, Lock, Unlock, AlertOctagon, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const ControlPanel = () => {
    const [weather, setWeather] = useState<'sunny' | 'rainy'>('sunny');
    const [pricingMode, setPricingMode] = useState<'standard' | 'surge'>('standard');
    const [lockdown, setLockdown] = useState(false);

    const handleWeather = () => {
        const newWeather = weather === 'sunny' ? 'rainy' : 'sunny';
        setWeather(newWeather);
        toast.info(`Đã thay đổi thời tiết mô phỏng: ${newWeather === 'rainy' ? 'MƯA LỚN' : 'NẮNG ĐẸP'}`, {
            description: "Hệ thống AI sẽ tự động điều chỉnh giá vé trong 5 giây tới."
        });
    };

    const handlePricing = () => {
        const newMode = pricingMode === 'standard' ? 'surge' : 'standard';
        setPricingMode(newMode);
        toast.warning(`Đã kích hoạt chế độ giá: ${newMode === 'surge' ? 'CAO ĐIỂM (x1.5)' : 'TIÊU CHUẨN'}`, {
            description: "Thông báo đã được gửi đến tất cả người dùng App."
        });
    };

    const handleLockdown = () => {
        setLockdown(!lockdown);
        if (!lockdown) {
            toast.error("KÍCH HOẠT PHONG TỎA HỆ THỐNG!", {
                description: "Tất cả cổng Barrier đã đóng. Ngừng nhận xe mới.",
                duration: 5000
            });
            // Phát âm thanh cảnh báo
            const audio = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
            audio.play().catch(() => {});
        } else {
            toast.success("Đã gỡ bỏ phong tỏa. Hệ thống hoạt động bình thường.");
        }
    };

    const broadcast = () => {
        toast.success("Đã gửi thông báo toàn hệ thống", {
            description: "'Bãi xe Vincom Q1 sắp hết chỗ. Vui lòng chuyển hướng sang Bitexco.'"
        });
    };

    return (
        <Card className="bg-slate-900 border-slate-800 mt-6 shadow-2xl">
            <CardHeader className="pb-2 border-b border-slate-800">
                <CardTitle className="text-sm font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4" /> God Mode Controls (Manual Override)
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Weather Control */}
                    <div className="space-y-3 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-sm font-mono">SIMULATE WEATHER</span>
                            <Switch checked={weather === 'rainy'} onCheckedChange={handleWeather} />
                        </div>
                        <div className="flex items-center gap-3">
                            {weather === 'rainy' ? <CloudRain className="w-8 h-8 text-blue-400 animate-bounce" /> : <CloudSun className="w-8 h-8 text-yellow-400 animate-spin-slow" />}
                            <div>
                                <div className={`font-bold ${weather === 'rainy' ? 'text-blue-400' : 'text-yellow-400'}`}>
                                    {weather === 'rainy' ? 'ĐANG MƯA' : 'TRỜI NẮNG'}
                                </div>
                                <div className="text-[10px] text-slate-500">Giá vé: {weather === 'rainy' ? '+20%' : 'Normal'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Control */}
                    <div className="space-y-3 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-sm font-mono">PRICING STRATEGY</span>
                            <Switch checked={pricingMode === 'surge'} onCheckedChange={handlePricing} className="data-[state=checked]:bg-red-500"/>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${pricingMode === 'surge' ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                                <DollarSign className={`w-4 h-4 ${pricingMode === 'surge' ? 'text-red-500' : 'text-green-500'}`} />
                            </div>
                            <div>
                                <div className={`font-bold ${pricingMode === 'surge' ? 'text-red-400' : 'text-green-400'}`}>
                                    {pricingMode === 'surge' ? 'SURGE MODE' : 'STANDARD'}
                                </div>
                                <Badge variant="outline" className="text-[10px] h-4 border-slate-700">
                                    {pricingMode === 'surge' ? 'High Demand' : 'Balanced'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Lockdown Control */}
                    <div className="space-y-3 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-sm font-mono">SYSTEM LOCK</span>
                            <Button 
                                size="sm" 
                                variant={lockdown ? "destructive" : "outline"}
                                className={`h-6 text-[10px] ${lockdown ? 'animate-pulse' : 'border-slate-700'}`}
                                onClick={handleLockdown}
                            >
                                {lockdown ? 'UNLOCK' : 'LOCK NOW'}
                            </Button>
                        </div>
                        <div className="flex items-center gap-3">
                            {lockdown ? <Lock className="w-6 h-6 text-red-500" /> : <Unlock className="w-6 h-6 text-slate-600" />}
                            <div className={`text-sm font-bold ${lockdown ? 'text-red-500' : 'text-slate-500'}`}>
                                {lockdown ? 'PHONG TỎA' : 'BÌNH THƯỜNG'}
                            </div>
                        </div>
                    </div>

                    {/* Broadcast */}
                    <div className="flex flex-col justify-center p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                        <Button onClick={broadcast} className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-900/20">
                            <Megaphone className="w-4 h-4 mr-2"/> PHÁT THÔNG BÁO
                        </Button>
                        <p className="text-[10px] text-center text-slate-500 mt-2">Gửi tin nhắn đến toàn bộ App User</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ControlPanel;