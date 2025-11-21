import { useRef, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      // Yêu cầu quyền truy cập Camera (Ưu tiên Camera sau)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: "environment" }, // Quan trọng: Lấy camera sau
          width: { ideal: 1920 },
          height: { ideal: 1080 } 
        }, 
        audio: false 
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsStreaming(true);
        };
      }
    } catch (err: any) {
      console.error("Camera Error:", err);
      setError("Không thể truy cập Camera. Vui lòng cấp quyền.");
      toast.error("Lỗi Camera: " + err.message);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsStreaming(false);
    }
  }, [stream]);

  const captureImage = useCallback((): HTMLCanvasElement | null => {
    if (!videoRef.current || !isStreaming) return null;

    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    
    // Set kích thước canvas bằng với kích thước video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Vẽ frame hiện tại từ video lên canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas;
  }, [isStreaming]);

  // Cleanup khi unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  return {
    videoRef,
    startCamera,
    stopCamera,
    captureImage,
    isStreaming,
    error
  };
};