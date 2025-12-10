import express from 'express';
import sql from 'mssql';
import cors from 'cors';

const app = express();
const PORT = 3000;

// --- DATABASE CONFIG ---
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
    console.log('✅ [SYSTEM] MATRIX DATABASE CONNECTED');
    return pool;
  })
  .catch(err => console.error('❌ [SYSTEM] DB ERROR:', err));

app.use(cors());
app.use(express.json());

// --- MIDDLEWARE DEBUG (ĐỂ XEM SERVER CÓ NHẬN REQUEST KHÔNG) ---
app.use((req, res, next) => {
    console.log(`📡 [REQUEST] ${req.method} ${req.url}`);
    next();
});

// ==========================================
// 1. ADMIN PARTNER API (QUẢN LÝ MÃ KÍCH HOẠT) - ĐẶT LÊN ĐẦU
// ==========================================
app.get('/api/admin/codes', async (req, res) => {
    try {
        const pool = await poolPromise;
        // Kiểm tra bảng tồn tại chưa, nếu chưa thì tạo (Auto-fix)
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ActivationCodes' AND xtype='U')
            CREATE TABLE ActivationCodes (
                id INT IDENTITY(1,1) PRIMARY KEY,
                code NVARCHAR(50) UNIQUE NOT NULL,
                parking_lot_id INT NULL,
                role NVARCHAR(20) DEFAULT 'manager',
                is_used BIT DEFAULT 0,
                created_at DATETIME DEFAULT GETDATE()
            )
        `);

        const result = await pool.request().query("SELECT * FROM ActivationCodes ORDER BY created_at DESC");
        res.json({ success: true, codes: result.recordset });
    } catch (err) { 
        console.error("GET CODES ERROR:", err);
        res.status(500).json({ success: false, message: err.message }); 
    }
});

app.post('/api/admin/codes', async (req, res) => {
    const { code } = req.body;
    console.log("Generating Code:", code); // Debug Log

    if (!code) return res.status(400).json({ success: false, message: "Thiếu mã code" });

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('code', sql.NVarChar, code.toUpperCase())
            .input('role', sql.NVarChar, 'manager')
            .query("INSERT INTO ActivationCodes (code, role, is_used) VALUES (@code, @role, 0)");
        
        res.json({ success: true, message: "Đã phát hành mã!" });
    } catch (err) { 
        console.error("CREATE CODE ERROR:", err);
        res.status(500).json({ success: false, message: "Lỗi: Mã này có thể đã tồn tại." }); 
    }
});

app.delete('/api/admin/codes/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request().input('id', sql.Int, req.params.id).query("DELETE FROM ActivationCodes WHERE id = @id");
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ==========================================
// 2. AUTHENTICATION & SEEDING
// ==========================================
// Hàm bơm dữ liệu mẫu
const seedParkingData = async (transaction, lotId, userId) => {
    console.log(`🌱 [SEEDING] Injecting data for Lot ID: ${lotId}...`);
    const plates = ['51H-12345', '30A-99999', '60F-56789', '29C-88888', '43A-11111', '15K-22222'];
    for (let i = 0; i < 20; i++) {
        const plate = plates[Math.floor(Math.random() * plates.length)];
        const cost = [30000, 50000, 100000][Math.floor(Math.random() * 3)];
        const hourOffset = Math.floor(Math.random() * 12); 
        await new sql.Request(transaction)
            .input('uid', sql.Int, userId).input('lid', sql.Int, lotId).input('vnum', sql.NVarChar, plate).input('cost', sql.Decimal, cost).input('ho', sql.Int, hourOffset)
            .query(`INSERT INTO Bookings (user_id_int, parking_lot_id, vehicle_number, start_time, end_time, total_cost, status, created_at) VALUES (@uid, @lid, @vnum, DATEADD(HOUR, -@ho-2, GETDATE()), DATEADD(HOUR, -@ho, GETDATE()), @cost, 'completed', DATEADD(HOUR, -@ho, GETDATE()))`);
        await new sql.Request(transaction).input('lid', sql.Int, lotId).input('p', sql.NVarChar, plate).input('ho', sql.Int, hourOffset)
            .query(`INSERT INTO IoTLogs (parking_lot_id, event_type, vehicle_plate, timestamp) VALUES (@lid, 'ENTRY', @p, DATEADD(HOUR, -@ho, GETDATE()))`);
    }
};

app.post('/api/auth/signup', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { fullName, phone, password, adminCode } = req.body;
        let role = 'user';
        let assignedLotId = null;

        if (adminCode) {
            if (adminCode === 'SPOT_ACE_MASTER') role = 'admin';
            else {
                const codeCheck = await pool.request().input('c', sql.NVarChar, adminCode).query("SELECT * FROM ActivationCodes WHERE code = @c AND is_used = 0");
                if (codeCheck.recordset.length > 0) {
                    role = codeCheck.recordset[0].role;
                    assignedLotId = codeCheck.recordset[0].parking_lot_id;
                    await pool.request().input('id', sql.Int, codeCheck.recordset[0].id).query("UPDATE ActivationCodes SET is_used = 1 WHERE id = @id");
                } else {
                    return res.status(400).json({ success: false, message: 'Mã kích hoạt không hợp lệ!' });
                }
            }
        }

        const checkPhone = await pool.request().input('p', sql.NVarChar, phone).query('SELECT id FROM AppUsers WHERE phone = @p');
        if (checkPhone.recordset.length > 0) return res.status(400).json({ success: false, message: 'Số điện thoại đã tồn tại!' });
        
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            const userRes = await new sql.Request(transaction)
                .input('n', sql.NVarChar, fullName).input('p', sql.NVarChar, phone).input('pw', sql.NVarChar, password).input('r', sql.NVarChar, role)
                .query("INSERT INTO AppUsers (full_name, phone, password, role) OUTPUT INSERTED.id VALUES (@n, @p, @pw, @r)");
            const userId = userRes.recordset[0].id;

            if (role === 'manager') {
                let lotId = assignedLotId;
                if (!lotId) {
                    const lotRes = await new sql.Request(transaction).input('uid', sql.Int, userId).input('name', sql.NVarChar, `Bãi Xe Của ${fullName}`)
                        .query(`INSERT INTO ParkingLots (name, address, latitude, longitude, total_spots, available_spots, base_price, current_price, rating, manager_id) OUTPUT INSERTED.id VALUES (@name, 'Đang cập nhật', 10.7, 106.6, 50, 50, 20000, 20000, 5.0, @uid)`);
                    lotId = lotRes.recordset[0].id;
                    await seedParkingData(transaction, lotId, userId);
                } else {
                    await new sql.Request(transaction).input('uid', sql.Int, userId).input('lid', sql.Int, lotId).query("UPDATE ParkingLots SET manager_id = @uid WHERE id = @lid");
                }
            }
            await transaction.commit();
            res.json({ success: true, user: { id: userId, name: fullName, phone, role } });
        } catch (err) { await transaction.rollback(); throw err; }
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().input('p', sql.NVarChar, req.body.phone).input('pw', sql.NVarChar, req.body.password)
            .query('SELECT * FROM AppUsers WHERE phone = @p AND password = @pw');
        if (result.recordset.length > 0) res.json({ success: true, user: { id: result.recordset[0].id, name: result.recordset[0].full_name, role: result.recordset[0].role, phone: result.recordset[0].phone } });
        else res.status(401).json({ success: false, message: 'Sai thông tin' });
    } catch (err) { res.status(500).send(err.message); }
});

// ==========================================
// 3. MANAGER DASHBOARD & IOT
// ==========================================
app.get('/api/manager/dashboard/:userId', async (req, res) => {
    try {
        const pool = await poolPromise;
        const lotRes = await pool.request().input('uid', sql.Int, req.params.userId).query('SELECT * FROM ParkingLots WHERE manager_id = @uid');
        if (lotRes.recordset.length === 0) return res.status(404).json({ message: "Chưa có bãi xe" });
        const myLot = lotRes.recordset[0];

        const statsRes = await pool.request().input('lid', sql.Int, myLot.id).query(`
            SELECT (SELECT COUNT(*) FROM Bookings WHERE parking_lot_id = @lid AND status = 'confirmed') as active_cars,
            (SELECT ISNULL(SUM(total_cost), 0) FROM Bookings WHERE parking_lot_id = @lid AND status = 'completed' AND CAST(created_at AS DATE) = CAST(GETDATE() AS DATE)) as revenue_today,
            (SELECT COUNT(*) FROM Bookings WHERE parking_lot_id = @lid AND CAST(created_at AS DATE) = CAST(GETDATE() AS DATE)) as total_bookings_today`);
        
        const reportRes = await pool.request().input('lid', sql.Int, myLot.id).query(`SELECT TOP 10 * FROM Bookings WHERE parking_lot_id = @lid ORDER BY created_at DESC`);
        const logsRes = await pool.request().input('lid', sql.Int, myLot.id).query("SELECT TOP 20 * FROM IoTLogs WHERE parking_lot_id = @lid ORDER BY timestamp DESC");

        res.json({
            lot: myLot,
            stats: {
                activeCars: statsRes.recordset[0].active_cars,
                revenue: statsRes.recordset[0].revenue_today,
                totalBookings: statsRes.recordset[0].total_bookings_today,
                occupancy: ((myLot.total_spots - myLot.available_spots) / myLot.total_spots) * 100
            },
            recentBookings: reportRes.recordset,
            logs: logsRes.recordset
        });
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/api/iot/event', async (req, res) => {
    const { lotId, type, plate } = req.body;
    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            await new sql.Request(transaction).input('lid', sql.Int, lotId).input('t', sql.NVarChar, type).input('p', sql.NVarChar, plate).query("INSERT INTO IoTLogs (parking_lot_id, event_type, vehicle_plate) VALUES (@lid, @t, @p)");
            if (type === 'ENTRY') {
                await new sql.Request(transaction).input('lid', sql.Int, lotId).query("UPDATE ParkingLots SET available_spots = available_spots - 1 WHERE id = @lid AND available_spots > 0");
                await new sql.Request(transaction).input('lid', sql.Int, lotId).input('p', sql.NVarChar, plate).query("INSERT INTO Bookings (user_id_int, parking_lot_id, vehicle_number, start_time, end_time, total_cost, status) VALUES (2, @lid, @p, GETDATE(), DATEADD(hour, 2, GETDATE()), 50000, 'confirmed')");
            } else {
                await new sql.Request(transaction).input('lid', sql.Int, lotId).query("UPDATE ParkingLots SET available_spots = available_spots + 1 WHERE id = @lid");
                await new sql.Request(transaction).input('p', sql.NVarChar, plate).query("UPDATE TOP(1) Bookings SET status = 'completed', total_cost = 50000, end_time = GETDATE() WHERE vehicle_number = @p AND status = 'confirmed'");
            }
            await transaction.commit();
            res.json({ success: true });
        } catch (err) { await transaction.rollback(); throw err; }
    } catch (err) { res.status(500).send(err.message); }
});

app.get('/api/stats', async (req, res) => {
    try {
        const pool = await poolPromise;
        const r1 = await pool.request().query("SELECT SUM(total_cost) as val FROM Bookings WHERE status != 'cancelled'");
        const r2 = await pool.request().query("SELECT COUNT(*) as val FROM Bookings");
        const r3 = await pool.request().query("SELECT SUM(available_spots) as avail, SUM(total_spots) as total FROM ParkingLots");
        const total = r3.recordset[0].total || 1;
        res.json({ revenue: r1.recordset[0].val || 0, bookings: r2.recordset[0].val || 0, occupancy: ((total - (r3.recordset[0].avail || 0)) / total) * 100 });
    } catch (err) { res.status(500).send(err.message); }
});

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
        if (result.recordset.length > 0) res.json(result.recordset[0]); else res.status(404).send('Not found');
    } catch (err) { res.status(500).send(err.message); }
});

app.get('/api/bookings', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { userId } = req.query;
        const result = await pool.request().input('uid', sql.Int, userId)
            .query(`SELECT b.*, p.name as parking_name, p.address FROM Bookings b JOIN ParkingLots p ON b.parking_lot_id = p.id WHERE b.user_id_int = @uid ORDER BY b.created_at DESC`);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/bookings', async (req, res) => {
    const { userId, lotId, vehicleNumber, totalCost, startTime, endTime } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request().input('id', sql.Int, lotId).query('UPDATE ParkingLots SET available_spots = available_spots - 1 WHERE id = @id AND available_spots > 0');
        await pool.request()
            .input('uid', sql.Int, userId).input('lid', sql.Int, lotId).input('vnum', sql.NVarChar, vehicleNumber)
            .input('cost', sql.Decimal, totalCost).input('start', sql.DateTime, new Date(startTime)).input('end', sql.DateTime, new Date(endTime))
            .query(`INSERT INTO Bookings (user_id_int, parking_lot_id, vehicle_number, total_cost, status, start_time, end_time, created_at) VALUES (@uid, @lid, @vnum, @cost, 'confirmed', @start, @end, GETDATE())`);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.listen(PORT, () => console.log(`🔥 [SYSTEM] SERVER ONLINE AT http://localhost:${PORT}`));