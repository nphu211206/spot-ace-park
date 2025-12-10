/**
 * 🌐 SPOT ACE PARK - IOT NEURAL SIMULATOR (ERA 3)
 * Hệ thống giả lập cảm biến IoT thông minh.
 * Tự động đẩy dữ liệu vào Server thông qua REST API.
 */

import fetch from 'node-fetch'; // Đảm bảo đã cài: npm install node-fetch

// --- CẤU HÌNH SIMULATOR ---
const CONFIG = {
    apiUrl: 'http://localhost:3000/api/iot/event',
    targetLotId: 1, // ID bãi xe (Mặc định 1 cho Demo)
    interval: 3000, // 3 giây một sự kiện (Nhanh để thấy hiệu ứng)
};

// --- DỮ LIỆU MẪU ---
const plates = [
    '51H-123.45', '30A-567.89', '60F-999.99', '29C-112.23', '43A-888.88',
    '15K-777.77', '99A-000.01', '59Z-456.78', '14P-333.33', '36C-246.80'
];

// --- UTILS ---
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomPlate = () => plates[randomInt(0, plates.length - 1)];
const getColor = (type) => type === 'ENTRY' ? '\x1b[32m' : '\x1b[31m'; // Green/Red
const resetColor = '\x1b[0m';

// --- MAIN LOOP ---
console.clear();
console.log('\x1b[36m%s\x1b[0m', '╔════════════════════════════════════════════════╗');
console.log('\x1b[36m%s\x1b[0m', '║     SPOT ACE IOT SIMULATOR - ACTIVATED         ║');
console.log('\x1b[36m%s\x1b[0m', '╚════════════════════════════════════════════════╝');
console.log(`🚀 Target Endpoint: ${CONFIG.apiUrl}`);
console.log(`📡 Parking Lot ID: ${CONFIG.targetLotId}`);
console.log('--------------------------------------------------');

async function sendIoTEvent() {
    // Logic ngẫu nhiên: 60% xe vào, 40% xe ra
    const type = Math.random() > 0.4 ? 'ENTRY' : 'EXIT';
    const plate = getRandomPlate();

    const payload = {
        lotId: CONFIG.targetLotId,
        type: type,
        plate: plate
    };

    try {
        // Gửi request vào Server
        const response = await fetch(CONFIG.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            const icon = type === 'ENTRY' ? '🟢 IN ' : '🔴 OUT';
            const logColor = getColor(type);
            console.log(`${logColor}[${new Date().toLocaleTimeString()}] ${icon} Plate: ${plate} | Server: 200 OK${resetColor}`);
        } else {
            console.log(`\x1b[33m[WARN] Server rejected event: ${data.message || 'Unknown error'}\x1b[0m`);
        }

    } catch (error) {
        console.error(`\x1b[31m[ERROR] Connection Lost! Is server.js running?\x1b[0m`);
    }
}

// Chạy vòng lặp vô tận
setInterval(sendIoTEvent, CONFIG.interval);

// Keep process alive nicely
process.on('SIGINT', () => {
    console.log('\n\x1b[36m[SYSTEM] Shutting down simulator... Goodbye!\x1b[0m');
    process.exit();
});