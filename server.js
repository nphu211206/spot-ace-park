import express from 'express';
import sql from 'mssql';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- CẤU HÌNH DATABASE ---
const dbConfig = {
    user: 'spot_user',
    password: '123456',
    server: 'DESKTOP-UKPMA8V\\SQLEXPRESS02',
    database: 'SpotAcePark',
    options: { encrypt: false, trustServerCertificate: true }
};

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('✅ [DB] Kết nối SQL Server THÀNH CÔNG!');
    return pool;
  })
  .catch(err => console.error('❌ [DB] Lỗi kết nối:', err));

// --- API ROUTES ---

// 1. AUTH
app.post('/api/auth/signup', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { fullName, phone, password, adminCode } = req.body;
        let role = adminCode === 'SPOT_ACE_MASTER' ? 'admin' : 'user';

        // Check trùng
        const check = await pool.request().input('p', sql.NVarChar, phone).query('SELECT id FROM AppUsers WHERE phone = @p');
        if (check.recordset.length > 0) return res.status(400).json({ success: false, message: 'Số điện thoại đã tồn tại' });
        
        // Tạo user
        const result = await pool.request()
            .input('n', sql.NVarChar, fullName)
            .input('p', sql.NVarChar, phone)
            .input('pass', sql.NVarChar, password)
            .input('role', sql.NVarChar, role)
            .query("INSERT INTO AppUsers (full_name, phone, password, role) OUTPUT INSERTED.id VALUES (@n, @p, @pass, @role)");
            
        res.json({ success: true, user: { id: result.recordset[0].id, name: fullName, phone, role } });
    } catch (err) { 
        console.error("Signup Error:", err);
        res.status(500).json({ success: false, message: "Lỗi Server: " + err.message }); 
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { phone, password } = req.body;
        const result = await pool.request()
            .input('phone', sql.NVarChar, phone)
            .input('password', sql.NVarChar, password)
            .query('SELECT * FROM AppUsers WHERE phone = @phone AND password = @password');

        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            res.json({ success: true, user: { id: user.id, name: user.full_name, role: user.role, phone: user.phone } });
        } else {
            res.status(401).json({ success: false, message: 'Sai thông tin đăng nhập' });
        }
    } catch (err) { 
        console.error("Login Error:", err);
        res.status(500).json({ success: false, message: err.message }); 
    }
});

// 2. PARKING LOTS
app.get('/api/parking-lots', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM ParkingLots');
        res.json(result.recordset);
    } catch (err) { res.status(500).send(err.message); }
});

app.get('/api/parking-lots/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().input('id', sql.Int, req.params.id).query('SELECT * FROM ParkingLots WHERE id = @id');
        if (result.recordset.length > 0) res.json(result.recordset[0]);
        else res.status(404).send('Not found');
    } catch (err) { res.status(500).send(err.message); }
});

// 3. BOOKINGS (FIXED & ROBUST)
app.get('/api/bookings', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { userId } = req.query;
        
        if (!userId) return res.status(400).json({ error: "Thiếu UserId" });

        console.log(`Fetching bookings for User ID: ${userId}`); // Log để debug

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
    } catch (err) { 
        console.error("❌ GET /api/bookings ERROR:", err);
        res.status(500).json({ error: err.message }); 
    }
});

app.post('/api/bookings', async (req, res) => {
    const { userId, lotId, vehicleNumber, totalCost, startTime, endTime } = req.body;
    
    console.log("Received Booking:", req.body); // Log dữ liệu nhận được

    try {
        const pool = await poolPromise;
        
        // Update slot
        await pool.request().input('id', sql.Int, lotId).query('UPDATE ParkingLots SET available_spots = available_spots - 1 WHERE id = @id AND available_spots > 0');
        
        // Insert booking
        await pool.request()
            .input('uid', sql.Int, userId)
            .input('lid', sql.Int, lotId)
            .input('vnum', sql.NVarChar, vehicleNumber)
            .input('cost', sql.Decimal, totalCost)
            .input('start', sql.DateTime, new Date(startTime)) // Ensure Date type
            .input('end', sql.DateTime, new Date(endTime))     // Ensure Date type
            .query(`
                INSERT INTO Bookings (user_id_int, parking_lot_id, vehicle_number, total_cost, status, start_time, end_time, created_at) 
                VALUES (@uid, @lid, @vnum, @cost, 'confirmed', @start, @end, GETDATE())
            `);
        
        res.json({ success: true });
    } catch (err) { 
        console.error("❌ POST /api/bookings ERROR:", err);
        res.status(500).json({ success: false, message: err.message }); 
    }
});

// 4. ADMIN & STATS
app.get('/api/stats', async (req, res) => {
    try {
        const pool = await poolPromise;
        const r1 = await pool.request().query("SELECT SUM(total_cost) as val FROM Bookings WHERE status != 'cancelled'");
        const r2 = await pool.request().query('SELECT COUNT(*) as val FROM Bookings');
        const r3 = await pool.request().query('SELECT SUM(available_spots) as avail, SUM(total_spots) as total FROM ParkingLots');
        
        const total = r3.recordset[0].total || 1;
        res.json({ 
            revenue: r1.recordset[0].val || 0, 
            bookings: r2.recordset[0].val || 0, 
            occupancy: ((total - (r3.recordset[0].avail || 0)) / total) * 100 
        });
    } catch (err) { res.status(500).send(err.message); }
});

app.listen(PORT, () => console.log(`🔥 Server chạy tại http://localhost:${PORT}`));