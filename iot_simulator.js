/**
 * 🌐 SPOT ACE PARK - IOT SIMULATOR (KỶ NGUYÊN 3)
 * Giả lập hàng nghìn cảm biến từ các bãi đỗ xe gửi dữ liệu về Server.
 * Tự động tạo xe vào/xe ra, cập nhật trạng thái thời gian thực.
 */

import sql from 'mssql';

// --- CẤU HÌNH KẾT NỐI DATABASE (Dùng chung với Server) ---
const dbConfig = {
    user: 'spot_user',
    password: '123456',
    server: 'DESKTOP-UKPMA8V\\SQLEXPRESS02',
    database: 'SpotAcePark',
    options: { encrypt: false, trustServerCertificate: true }
};

// --- DANH SÁCH BIỂN SỐ XE GIẢ LẬP ---
const dummyPlates = [
    '29A-12345', '30E-99999', '51H-88888', '14A-56789', '99K-11111',
    '29B-55555', '30F-12121', '51G-34567', '60A-98765', '15A-43210'
];

// --- HÀM TIỆN ÍCH ---
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomPlate = () => dummyPlates[randomInt(0, dummyPlates.length - 1)];

// --- LOGIC CHÍNH ---
async function runIoTSimulation() {
    try {
        const pool = await sql.connect(dbConfig);
        console.log('🤖 [IOT BOT] Đã kết nối vào Ma Trận dữ liệu...');
        console.log('⚡ [IOT BOT] Bắt đầu giả lập cảm biến xe ra/vào...');

        // Lấy danh sách User ID và Parking Lot ID thật để giả lập cho chuẩn
        const users = await pool.request().query('SELECT top 5 id FROM AppUsers');
        const lots = await pool.request().query('SELECT id, base_price FROM ParkingLots');

        if (users.recordset.length === 0 || lots.recordset.length === 0) {
            console.log('❌ [ERROR] Chưa có dữ liệu User hoặc Bãi xe. Hãy chạy Seed Data trước!');
            return;
        }

        // --- VÒNG LẶP VÔ TẬN (SIMULATION LOOP) ---
        setInterval(async () => {
            try {
                const actionType = Math.random() > 0.5 ? 'ENTRY' : 'EXIT';
                const randomLot = lots.recordset[randomInt(0, lots.recordset.length - 1)];
                const randomUser = users.recordset[randomInt(0, users.recordset.length - 1)];
                const plate = getRandomPlate();

                if (actionType === 'ENTRY') {
                    // Giả lập xe vào -> Tạo Booking mới (Status: Confirmed)
                    console.log(`🟢 [XE VÀO] ${plate} tại bãi xe #${randomLot.id}`);
                    
                    // 1. Trừ chỗ trống
                    await pool.request()
                        .input('id', sql.Int, randomLot.id)
                        .query('UPDATE ParkingLots SET available_spots = available_spots - 1 WHERE id = @id AND available_spots > 0');

                    // 2. Tạo Booking
                    await pool.request()
                        .input('uid', sql.Int, randomUser.id)
                        .input('lid', sql.Int, randomLot.id)
                        .input('vnum', sql.NVarChar, plate)
                        .input('cost', sql.Decimal, randomLot.base_price) // Giá tạm tính
                        .query(`
                            INSERT INTO Bookings (user_id_int, parking_lot_id, vehicle_number, start_time, end_time, total_cost, status, created_at)
                            VALUES (@uid, @lid, @vnum, GETDATE(), DATEADD(HOUR, 2, GETDATE()), @cost, 'confirmed', GETDATE())
                        `);

                } else {
                    // Giả lập xe ra -> Update Booking thành Completed
                    console.log(`🔴 [XE RA] ${plate} thanh toán và rời đi.`);
                    
                    // 1. Cộng chỗ trống
                    await pool.request()
                        .input('id', sql.Int, randomLot.id)
                        .query('UPDATE ParkingLots SET available_spots = available_spots + 1 WHERE id = @id');

                    // 2. Update trạng thái Booking ngẫu nhiên thành completed
                    // (Lấy 1 booking đang confirmed ngẫu nhiên để kết thúc)
                    await pool.request()
                        .query(`
                            UPDATE TOP (1) Bookings 
                            SET status = 'completed', updated_at = GETDATE() 
                            WHERE status = 'confirmed'
                        `);
                }

            } catch (err) {
                console.error('⚠️ [IOT ERROR] Lỗi cảm biến:', err.message);
            }
        }, 5000); // Chạy mỗi 5 giây

    } catch (err) {
        console.error('❌ [FATAL] Không thể khởi động IoT Simulator:', err);
    }
}

runIoTSimulation();