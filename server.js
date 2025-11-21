import express from 'express';
import sql from 'mssql'; // Dùng driver chuẩn, ổn định nhất
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- CẤU HÌNH KẾT NỐI (DÙNG TÀI KHOẢN MỚI TẠO) ---
const dbConfig = {
    user: 'spot_user',      // Tài khoản mới tạo
    password: '123456',     // Mật khẩu mới tạo
    server: 'DESKTOP-UKPMA8V\\SQLEXPRESS02', // Server máy bạn
    database: 'SpotAcePark',
    options: {
        encrypt: false, // Quan trọng khi chạy local
        trustServerCertificate: true
    }
};

// Kết nối Database
const pool = new sql.ConnectionPool(dbConfig);
const dbConnect = pool.connect()
    .then(() => console.log('🚀 [SQL SERVER] KẾT NỐI THÀNH CÔNG BẰNG USER spot_user!'))
    .catch(err => {
        console.error('❌ [SQL SERVER] Lỗi kết nối:', err.message);
        console.log('⚠️ Gợi ý: Hãy chắc chắn bạn đã chạy script tạo user trong SSMS!');
    });

// --- CÁC API CHỨC NĂNG (GIỮ NGUYÊN NHƯ CŨ) ---

// Auth Login
app.post('/api/auth/login', async (req, res) => {
    const { phone, password, isAdmin } = req.body;
    try {
        await dbConnect;
        const request = pool.request();
        const result = await request
            .input('phone', sql.NVarChar, phone)
            .input('password', sql.NVarChar, password)
            .query('SELECT * FROM AppUsers WHERE phone = @phone AND password = @password');

        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            if (isAdmin && user.role !== 'admin') {
                return res.status(403).json({ success: false, message: 'Không phải Admin!' });
            }
            res.json({ success: true, user: { id: user.id, name: user.full_name, role: user.role, phone: user.phone } });
        } else {
            res.status(401).json({ success: false, message: 'Sai thông tin!' });
        }
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Auth Signup
app.post('/api/auth/signup', async (req, res) => {
    const { fullName, phone, password } = req.body;
    try {
        await dbConnect;
        const request = pool.request();
        const check = await request.input('p', sql.NVarChar, phone).query('SELECT id FROM AppUsers WHERE phone = @p');
        if (check.recordset.length > 0) return res.status(400).json({ success: false, message: 'SĐT đã tồn tại' });
        
        await pool.request()
            .input('n', sql.NVarChar, fullName)
            .input('p', sql.NVarChar, phone)
            .input('pass', sql.NVarChar, password)
            .query("INSERT INTO AppUsers (full_name, phone, password, role) VALUES (@n, @p, @pass, 'user')");
        res.json({ success: true, message: 'Đăng ký thành công' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Stats
app.get('/api/stats', async (req, res) => {
    try {
        await dbConnect;
        const r1 = await pool.request().query("SELECT SUM(total_cost) as val FROM Bookings WHERE status != 'cancelled'");
        const r2 = await pool.request().query('SELECT COUNT(*) as val FROM Bookings');
        const r3 = await pool.request().query('SELECT SUM(available_spots) as avail, SUM(total_spots) as total FROM ParkingLots');
        
        const avail = r3.recordset[0].avail || 0;
        const total = r3.recordset[0].total || 1;
        
        res.json({
            revenue: r1.recordset[0].val || 0,
            bookings: r2.recordset[0].val || 0,
            occupancy: ((total - avail) / total) * 100
        });
    } catch (err) { res.status(500).send(err.message); }
});

// Parking Lots
app.get('/api/parking-lots', async (req, res) => {
    try {
        await dbConnect;
        const result = await pool.request().query('SELECT * FROM ParkingLots');
        res.json(result.recordset);
    } catch (err) { res.status(500).send(err.message); }
});

// Scanner
app.post('/api/scan', async (req, res) => {
    const { plate } = req.body;
    const cleanPlate = plate.replace(/[^a-zA-Z0-9]/g, '');
    try {
        await dbConnect;
        const result = await pool.request()
            .input('plate', sql.NVarChar, `%${cleanPlate}%`)
            .query(`
                SELECT b.*, u.full_name, p.name as lot_name 
                FROM Bookings b 
                JOIN AppUsers u ON b.user_id_int = u.id 
                JOIN ParkingLots p ON b.parking_lot_id = p.id
                WHERE REPLACE(REPLACE(b.vehicle_number, '-', ''), '.', '') LIKE @plate
            `);
        if (result.recordset.length > 0) res.json({ success: true, data: result.recordset[0] });
        else res.json({ success: false });
    } catch (err) { res.status(500).send(err.message); }
});

// Booking
app.post('/api/bookings', async (req, res) => {
    const { userId, lotId, vehicleNumber, totalCost } = req.body;
    try {
        await dbConnect;
        await pool.request().input('id', sql.Int, lotId).query('UPDATE ParkingLots SET available_spots = available_spots - 1 WHERE id = @id');
        await pool.request()
            .input('uid', sql.Int, userId)
            .input('lid', sql.Int, lotId)
            .input('vnum', sql.NVarChar, vehicleNumber)
            .input('cost', sql.Decimal, totalCost)
            .query("INSERT INTO Bookings (user_id_int, parking_lot_id, vehicle_number, total_cost, status, start_time, end_time) VALUES (@uid, @lid, @vnum, @cost, 'confirmed', GETDATE(), DATEADD(hour, 2, GETDATE()))");
        res.json({ success: true });
    } catch (err) { res.status(500).send(err.message); }
});

app.listen(PORT, () => console.log(`🔥 Server chạy tại http://localhost:${PORT}`));