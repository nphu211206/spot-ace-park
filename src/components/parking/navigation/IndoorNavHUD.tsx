import { useState } from "react";
import { IndoorLandmark, PathNavigationResult } from "./ParkingPathfinder";
import { playCarHornSound } from "./CarBeaconMarker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Compass,
  Footprints,
  Volume2,
  X,
  Navigation,
  RotateCcw,
  Play,
  Pause,
  MapPin,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface IndoorNavHUDProps {
  landmarks: IndoorLandmark[];
  activeLandmark: IndoorLandmark;
  onSelectLandmark: (landmark: IndoorLandmark) => void;
  targetSlotCode: string;
  targetPlateNumber: string;
  pathResult: PathNavigationResult;
  isWalking: boolean;
  onToggleWalking: () => void;
  onTriggerHonk: () => void;
  onResetCamera: () => void;
  onClose: () => void;
}

export function IndoorNavHUD({
  landmarks,
  activeLandmark,
  onSelectLandmark,
  targetSlotCode,
  targetPlateNumber,
  pathResult,
  isWalking,
  onToggleWalking,
  onTriggerHonk,
  onResetCamera,
  onClose,
}: IndoorNavHUDProps) {
  const [showInstructions, setShowInstructions] = useState(false);
  const [isHonking, setIsHonking] = useState(false);

  const handleHonk = () => {
    setIsHonking(true);
    playCarHornSound();
    onTriggerHonk();
    setTimeout(() => setIsHonking(false), 1600);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Bar: Target & Status */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pointer-events-auto flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/85 p-3.5 shadow-2xl backdrop-blur-xl sm:p-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <Navigation className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
                ĐIỀU HƯỚNG TRONG HẦM 3D
              </span>
              <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs">
                Live Wayfinding
              </Badge>
            </div>
            <p className="text-base font-bold text-white">
              Đích đến: <span className="text-emerald-400">Ô {targetSlotCode}</span> • Xe:{" "}
              <span className="text-cyan-300 font-mono">{targetPlateNumber}</span>
            </p>
          </div>
        </div>

        {/* Distance and ETA metrics */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-1.5 text-center">
            <span className="text-[11px] uppercase tracking-wide text-slate-400">Khoảng cách</span>
            <p className="text-base font-bold text-white">{pathResult.totalDistanceMeters}m</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-1.5 text-center">
            <span className="text-[11px] uppercase tracking-wide text-slate-400">Thời gian đi bộ</span>
            <p className="text-base font-bold text-emerald-400">~{pathResult.estimatedWalkSeconds}s</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-9 w-9 rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>

      {/* Middle Floating Alert: Compass Heading Notice */}
      <div className="flex justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-cyan-500/20 bg-slate-900/90 px-4 py-1.5 text-xs font-medium text-cyan-200 shadow-lg backdrop-blur-md"
        >
          <Compass className="h-4 w-4 text-cyan-400 animate-spin" style={{ animationDuration: "12s" }} />
          <span>Vuốt màn hình để xoay 360° nhìn cột số xung quanh • Lần theo dải mũi tên neon</span>
        </motion.div>
      </div>

      {/* Bottom Panel: Landmark Selector & Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pointer-events-auto space-y-3"
      >
        {/* Landmark Selection Carousel / Buttons */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/85 p-3.5 shadow-2xl backdrop-blur-xl sm:p-4">
          <div className="mb-2.5 flex items-center justify-between text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-cyan-400" />
              <span>BẠN ĐANG ĐỨNG Ở ĐÂU? (CHỌN ĐIỂM XUẤT PHÁT):</span>
            </div>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
            >
              {showInstructions ? "Ẩn lộ trình" : "Xem chi tiết rẽ"}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {landmarks.map((landmark) => {
              const isSelected = landmark.id === activeLandmark.id;
              return (
                <button
                  key={landmark.id}
                  onClick={() => onSelectLandmark(landmark)}
                  className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition-all ${
                    isSelected
                      ? "border-cyan-500 bg-cyan-500/15 shadow-md shadow-cyan-500/10"
                      : "border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-xs font-bold text-white">{landmark.name}</span>
                    {isSelected && <Badge className="bg-cyan-500 text-[10px] text-black">Vị trí hiện tại</Badge>}
                  </div>
                  <span className="mt-1 text-[11px] text-slate-400">{landmark.description}</span>
                </button>
              );
            })}
          </div>

          {/* Collapsible Turn-by-turn guidance */}
          <AnimatePresence>
            {showInstructions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 border-t border-white/10 pt-3 text-xs text-slate-300 space-y-1.5"
              >
                {pathResult.instructions.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <ChevronRight className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span>{step}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2.5 border-t border-white/10 pt-3">
            <div className="flex items-center gap-2">
              <Button
                variant={isWalking ? "secondary" : "default"}
                onClick={onToggleWalking}
                className="gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
              >
                {isWalking ? (
                  <>
                    <Pause className="h-4 w-4" /> Dừng Đi Bộ
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" /> Đi Bộ Theo Mũi Tên
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={onResetCamera}
                className="gap-1.5 border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
              >
                <RotateCcw className="h-4 w-4" /> Góc Nhìn 360°
              </Button>
            </div>

            <Button
              onClick={handleHonk}
              disabled={isHonking}
              className={`gap-2 font-bold text-white transition-all shadow-lg ${
                isHonking
                  ? "bg-amber-600 animate-bounce shadow-amber-500/50"
                  : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30"
              }`}
            >
              <Volume2 className="h-4 w-4" />
              {isHonking ? "ĐANG BẤM CÒI & NHÁY ĐÈN..." : "BẤM CÒI & NHÁY ĐÈN TÌM XE"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
