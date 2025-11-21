import Tesseract from 'tesseract.js';

/**
 * THE VISION ENGINE V3.0 (Raw Mode)
 * - Bỏ qua filter màu để tránh mất nét trên màn hình LCD
 * - Auto-crop chuẩn hơn
 */

const preprocessImage = (canvas: HTMLCanvasElement): string => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Cắt vùng trung tâm (nơi chứa biển số)
  // Lấy rộng hơn chút để ko bị mất chữ
  const cropWidth = canvas.width * 0.8; 
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
  
  // Trả về ảnh gốc đã crop, không chỉnh màu
  return tempCanvas.toDataURL('image/png');
};

export const scanLicensePlate = async (imageSource: HTMLCanvasElement): Promise<string | null> => {
  try {
    const processedImage = preprocessImage(imageSource);
    const worker = await Tesseract.createWorker('eng');
    
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHKLMNPQRSTUVXYZ0123456789-', // Chỉ đọc ký tự biển số
      tessedit_pageseg_mode: '7' as any, // Single line mode
    });

    const { data: { text, confidence } } = await worker.recognize(processedImage);
    await worker.terminate();

    const cleanText = text.toUpperCase().replace(/[^A-Z0-9-]/g, '').trim();
    
    // Hạ độ tin cậy xuống cực thấp để bắt mọi thứ có thể
    if (cleanText.length >= 3 && confidence > 30) {
      return cleanText;
    }
    return null;
  } catch (error) {
    return null;
  }
};