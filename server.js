import express from 'express';
import sql from 'mssql';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// CẤU HÌNH DATABASE
const dbConfig = {
    user: 'spot_user',
    password: '123456',
    server: 'DESKTOP-UKPMA8V\\SQLEXPRESS02',
    database: 'SpotAcePark',
    options: { encrypt: false, trustServerCertificate: true }
};

const pool = new sql.ConnectionPool(dbConfig);
const dbConnect = pool.connect().then(() => console.log('🚀 DB Connected!')).catch(err => console.error('❌ DB Error:', err));
// --- API AUTH ---
app.post('/api/auth/login', async (req, res) => {
    try {
        await dbConnect;
        const { phone, password } = req.body;
        const result = await pool.request()
            .input('phone', sql.NVarChar, phone)
            .input('password', sql.NVarChar, password)
            .query('SELECT * FROM AppUsers WHERE phone = @phone AND password = @password');

        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            res.json({ 
                success: true, 
                user: { id: user.id, name: user.full_name, role: user.role, phone: user.phone } 
            });
        } else {
            res.status(401).json({ success: false, message: 'Sai thông tin đăng nhập' });
        }
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/auth/signup', async (req, res) => {
    try {
        await dbConnect;
        const { fullName, phone, password } = req.body;
        
        // [CHEAT CODE] Nếu tên có chữ "Admin", tự động set quyền admin (Để bạn test dễ dàng)
        const role = fullName.toLowerCase().includes('admin') ? 'admin' : 'user';

        const check = await pool.request().input('p', sql.NVarChar, phone).query('SELECT id FROM AppUsers WHERE phone = @p');
        if (check.recordset.length > 0) return res.status(400).json({ success: false, message: 'SĐT đã tồn tại' });
        
        await pool.request()
            .input('n', sql.NVarChar, fullName)
            .input('p', sql.NVarChar, phone)
            .input('pass', sql.NVarChar, password)
            .input('role', sql.NVarChar, role)
            .query("INSERT INTO AppUsers (full_name, phone, password, role) VALUES (@n, @p, @pass, @role)");
            
        res.json({ success: true, message: `Đăng ký thành công với quyền ${role}` });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});
// --- API DỮ LIỆU ---

// Lấy danh sách bãi xe (Cho trang Parking)
app.get('/api/parking-lots', async (req, res) => {
    try {
        await dbConnect;
        const result = await pool.request().query('SELECT * FROM ParkingLots');
        res.json(result.recordset);
    } catch (err) { res.status(500).send(err.message); }
});

// Lấy chi tiết 1 bãi xe
app.get('/api/parking-lots/:id', async (req, res) => {
    try {
        await dbConnect;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM ParkingLots WHERE id = @id');
        if (result.recordset.length > 0) res.json(result.recordset[0]);
        else res.status(404).send('Not found');
    } catch (err) { res.status(500).send(err.message); }
});

// Lấy lịch sử đặt chỗ của User
app.get('/api/bookings', async (req, res) => {
    try {
        await dbConnect;
        const { userId } = req.query;
        const result = await pool.request()
            .input('uid', sql.Int, userId)
            .query(`
                SELECT b.*, p.name as parking_name, p.address 
                FROM Bookings b
                JOIN ParkingLots p ON b.parking_lot_id = p.id
                WHERE b.user_id_int = @uid
                ORDER BY b.created_at DESC
            `);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Tạo Booking mới
app.post('/api/bookings', async (req, res) => {
    const { userId, lotId, vehicleNumber, totalCost, startTime, endTime } = req.body;
    try {
        await dbConnect;
        // 1. Trừ chỗ trống
        await pool.request().input('id', sql.Int, lotId).query('UPDATE ParkingLots SET available_spots = available_spots - 1 WHERE id = @id AND available_spots > 0');
        
        // 2. Tạo booking
        await pool.request()
            .input('uid', sql.Int, userId)
            .input('lid', sql.Int, lotId)
            .input('vnum', sql.NVarChar, vehicleNumber)
            .input('cost', sql.Decimal, totalCost)
            .input('start', sql.DateTime, startTime)
            .input('end', sql.DateTime, endTime)
            .query(`
                INSERT INTO Bookings (user_id_int, parking_lot_id, vehicle_number, total_cost, status, start_time, end_time) 
                VALUES (@uid, @lid, @vnum, @cost, 'confirmed', @start, @end)
            `);
        res.json({ success: true });
    } catch (err) { res.status(500).send(err.message); }
});

// API SCANNER (AI Logic)
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
                AND b.status IN ('confirmed', 'pending')
            `);
        if (result.recordset.length > 0) res.json({ success: true, data: result.recordset[0] });
        else res.json({ success: false });
    } catch (err) { res.status(500).send(err.message); }
});

// API STATS (Admin)
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

app.listen(PORT, () => console.log(`🔥 Server chạy tại http://localhost:${PORT}`));