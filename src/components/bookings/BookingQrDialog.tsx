import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Clock, Copy, MapPin, QrCode, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { buildBookingQrUrl, StoredBooking } from "@/lib/booking-storage";
import { formatDurationLabel, getDurationMinutesBetween } from "@/lib/parking-pricing";

interface BookingQrDialogProps {
  booking: StoredBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BookingQrDialog = ({ booking, open, onOpenChange }: BookingQrDialogProps) => {
  if (!booking) {
    return null;
  }

  const copyTransactionId = async () => {
    const transactionId = booking.transaction_id || `BOOK-${booking.id}`;

    try {
      await navigator.clipboard.writeText(transactionId);
      toast.success("Đã sao chép mã giao dịch.");
    } catch {
      toast.error("Không thể sao chép mã giao dịch.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-slate-800 bg-slate-950 p-0 text-white">
        <div className="border-b border-slate-800 bg-gradient-to-r from-emerald-600 to-cyan-600 p-6">
          <DialogHeader className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <QrCode className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight">Vé QR điện tử</DialogTitle>
                <DialogDescription className="text-sm text-emerald-50/80">
                  Xuất trình mã này tại cổng kiểm soát hoặc khi cần đối soát lịch sử.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="space-y-6 p-6">
          <div className="mx-auto w-fit rounded-[28px] bg-white p-4 shadow-2xl">
            <img
              src={buildBookingQrUrl(booking, 240)}
              alt={`Mã QR cho ${booking.vehicle_number}`}
              className="h-60 w-60 rounded-2xl"
            />
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Mã giao dịch</p>
                <p className="mt-2 font-mono text-lg font-bold text-white">{booking.transaction_id || `BOOK-${booking.id}`}</p>
              </div>
              <Button type="button" variant="outline" className="border-slate-700 bg-slate-950 text-slate-200" onClick={copyTransactionId}>
                <Copy className="mr-2 h-4 w-4" />
                Sao chép
              </Button>
            </div>

            <div className="mt-5 grid gap-4 text-sm text-slate-300">
              <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <span className="text-slate-500">Biển số</span>
                <span className="font-mono text-base font-bold text-white">{booking.vehicle_number}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <span className="text-slate-500">Vị trí đỗ</span>
                <span className="font-bold text-amber-400">{booking.spot_id || "Đang cập nhật"}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <span className="flex items-center gap-2 text-slate-500">
                  <Clock className="h-4 w-4" />
                  Thời lượng
                </span>
                <span className="font-bold text-white">
                  {formatDurationLabel(
                    booking.duration_minutes || getDurationMinutesBetween(booking.start_time, booking.end_time),
                  )}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <span className="flex items-center gap-2 text-slate-500">
                  <MapPin className="mt-0.5 h-4 w-4" />
                  Địa điểm
                </span>
                <span className="max-w-[220px] text-right font-medium text-white">{booking.parking_name}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Khung giờ</span>
                <span className="text-right font-medium text-white">
                  {format(new Date(booking.start_time), "HH:mm dd/MM/yyyy", { locale: vi })}
                  {" - "}
                  {format(new Date(booking.end_time), "HH:mm dd/MM/yyyy", { locale: vi })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Vé hợp lệ cho giao dịch đã xác nhận
            </span>
            <span className="text-lg font-black text-emerald-300">{Number(booking.total_cost).toLocaleString()}đ</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingQrDialog;
