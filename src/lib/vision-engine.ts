import Tesseract from 'tesseract.js';

/**
 * THE VISION ENGINE V4.0 (Ultimate)
 * - Auto-crop thông minh hơn (Lấy rộng hơn để không mất chữ)
 * - Chế độ "Dễ tính" (Permissive Mode) để bắt biển số trên mọi bề mặt
 */

const preprocessImage = (canvas: HTMLCanvasElement): string => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Cắt vùng trung tâm (Rộng 90%, Cao 40%) - Rộng hơn để bắt trọn biển
  const cropWidth = canvas.width * 0.9;
  const cropHeight = canvas.height * 0.4;
  const startX = (canvas.width - cropWidth) / 2;
  const startY = (canvas.height - cropHeight) / 2;

  const imageData = ctx.getImageData(startX, startY, cropWidth, cropHeight);
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = cropWidth;
  tempCanvas.height = cropHeight;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return '';

  tempCtx.putImageData(imageData, 0, 0);
  
  // Không filter màu, giữ nguyên ảnh gốc để Tesseract tự xử lý (Tốt hơn cho màn hình LCD)
  return tempCanvas.toDataURL('image/png');
};

export const scanLicensePlate = async (imageSource: HTMLCanvasElement): Promise<string | null> => {
  try {
    const processedImage = preprocessImage(imageSource);
    const worker = await Tesseract.createWorker('eng');
    
    // Cấu hình chỉ đọc các ký tự có thể xuất hiện trong biển số
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHKLMNPQRSTUVXYZ0123456789-.',
      tessedit_pageseg_mode: '7' as any, // Single line mode
    });

    const { data: { text, confidence } } = await worker.recognize(processedImage);
    await worker.terminate();

    // Làm sạch chuỗi: 29A-123.45 -> 29A12345 (Bỏ hết ký tự đặc biệt)
    const cleanText = text.toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
    
    // Điều kiện dễ tính: Chỉ cần > 4 ký tự và độ tin cậy > 40%
    if (cleanText.length >= 4 && confidence > 40) {
      return cleanText;
    }
    return null;
  } catch (error) {
    console.error("OCR Error:", error);
    return null;
  }
};