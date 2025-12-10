import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Key, Plus, Trash2, Copy, RefreshCw, Users } from "lucide-react";

const PartnerManager = () => {
    const [codes, setCodes] = useState<any[]>([]);
    const [newCode, setNewCode] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchCodes = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/admin/codes');
            const data = await res.json();
            if (data.success) setCodes(data.codes);
        } catch (e) {
            console.error("Lỗi tải mã");
        }
    };

    useEffect(() => {
        fetchCodes();
    }, []);

    const createCode = async () => {
        if (!newCode) return toast.error("Vui lòng nhập mã!");
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3000/api/admin/codes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: newCode })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Đã tạo mã kích hoạt mới!");
                setNewCode("");
                fetchCodes();
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            toast.error("Lỗi kết nối Server");
        } finally {
            setLoading(false);
        }
    };

    const deleteCode = async (id: number) => {
        if (!confirm("Bạn chắc chắn muốn xóa mã này?")) return;
        try {
            await fetch(`http://localhost:3000/api/admin/codes/${id}`, { method: 'DELETE' });
            toast.success("Đã xóa mã");
            fetchCodes();
        } catch (e) {
            toast.error("Lỗi xóa");
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Đã copy mã vào bộ nhớ tạm!");
    };

    const generateRandomCode = () => {
        const prefix = ["VIN", "SUN", "BIT", "LAND", "FLC", "NOVA"];
        const randomPre = prefix[Math.floor(Math.random() * prefix.length)];
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        setNewCode(`${randomPre}-PARTNER-${randomNum}`);
    };

    return (
        <Card className="bg-slate-900 border-slate-800 shadow-2xl mt-6">
            <CardHeader className="border-b border-slate-800 pb-4">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-white flex items-center gap-2 text-lg uppercase tracking-wider">
                        <Users className="w-5 h-5 text-orange-500" /> Quản Lý Đối Tác (SaaS)
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={fetchCodes} className="text-slate-400 hover:text-white">
                        <RefreshCw className="w-4 h-4 mr-2" /> Làm mới
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                {/* CREATE SECTION */}
                <div className="flex gap-4 mb-8 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    <div className="flex-1 relative">
                        <Key className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <Input 
                            value={newCode}
                            onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                            placeholder="Nhập mã kích hoạt (VD: VINCOM-VIP-01)..." 
                            className="pl-10 bg-slate-900 border-slate-700 text-white font-mono uppercase tracking-widest"
                        />
                    </div>
                    <Button variant="outline" onClick={generateRandomCode} title="Tạo mã ngẫu nhiên" className="border-slate-700 text-slate-300">
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button onClick={createCode} disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white font-bold min-w-[120px]">
                        {loading ? "Đang tạo..." : <><Plus className="w-4 h-4 mr-2"/> PHÁT HÀNH</>}
                    </Button>
                </div>

                {/* LIST SECTION */}
                <div className="rounded-md border border-slate-800 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-950">
                            <TableRow className="border-slate-800 hover:bg-slate-950">
                                <TableHead className="text-slate-400 font-bold">MÃ KÍCH HOẠT</TableHead>
                                <TableHead className="text-slate-400 font-bold">VAI TRÒ</TableHead>
                                <TableHead className="text-slate-400 font-bold text-center">TRẠNG THÁI</TableHead>
                                <TableHead className="text-slate-400 font-bold text-right">THAO TÁC</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {codes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-slate-500 italic">Chưa có mã nào được phát hành.</TableCell>
                                </TableRow>
                            ) : (
                                codes.map((code) => (
                                    <TableRow key={code.id} className="border-slate-800 hover:bg-slate-800/50 transition-colors">
                                        <TableCell className="font-mono text-white font-bold tracking-widest text-base">
                                            {code.code}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="border-orange-500/50 text-orange-400 bg-orange-500/10 uppercase text-[10px]">
                                                {code.role === 'admin' ? 'GOD MODE' : 'MANAGER'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {code.is_used ? (
                                                <Badge className="bg-slate-800 text-slate-500 hover:bg-slate-800">Đã sử dụng</Badge>
                                            ) : (
                                                <Badge className="bg-green-600 hover:bg-green-700 animate-pulse">Sẵn sàng</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" className="hover:bg-blue-500/20 hover:text-blue-400" onClick={() => copyToClipboard(code.code)}>
                                                    <Copy className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="hover:bg-red-500/20 hover:text-red-400" onClick={() => deleteCode(code.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

export default PartnerManager;