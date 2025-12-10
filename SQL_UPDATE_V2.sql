USE SpotAcePark;
GO

-- 1. THÊM CỘT MANAGER_ID VÀO BẢNG PARKINGLOTS
-- Liên kết bãi xe với tài khoản Manager
ALTER TABLE ParkingLots
ADD manager_id INT NULL FOREIGN KEY REFERENCES AppUsers(id);
GO

-- 2. CẬP NHẬT DỮ LIỆU MẪU (Gán bãi xe cho các Admin/Manager có sẵn nếu cần)
-- Ví dụ: Gán bãi Vincom (id=1) cho User có id=1 (Admin) để test
UPDATE ParkingLots SET manager_id = 1 WHERE id = 1;
GO

-- 3. THÊM BẢNG IOT_LOGS (Lưu lịch sử cảm biến chi tiết cho Manager soi)
CREATE TABLE IoTLogs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    parking_lot_id INT FOREIGN KEY REFERENCES ParkingLots(id),
    sensor_id NVARCHAR(50),
    event_type NVARCHAR(50), -- 'entry', 'exit', 'blocked', 'fire_alarm'
    vehicle_plate NVARCHAR(50),
    timestamp DATETIME DEFAULT GETDATE()
);
GO

PRINT '>>> [SUCCESS] HỆ THỐNG ĐÃ SẴN SÀNG CHO KỶ NGUYÊN QUẢN LÝ ĐA ĐIỂM <<<';