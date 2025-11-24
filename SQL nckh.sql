USE SpotAcePark;
GO

-- 1. XÓA BẢNG THEO ĐÚNG THỨ TỰ (CON TRƯỚC - CHA SAU)
-- Phải xóa Bookings trước vì nó tham chiếu đến 2 bảng kia
DROP TABLE IF EXISTS Payments; -- Nếu có
DROP TABLE IF EXISTS Reviews;  -- Nếu có
DROP TABLE IF EXISTS Bookings; -- <--- QUAN TRỌNG: Xóa thằng này đầu tiên
DROP TABLE IF EXISTS ParkingLots;
DROP TABLE IF EXISTS AppUsers;
DROP TABLE IF EXISTS SystemConfig;
GO

-- 2. TẠO BẢNG APPUSERS
CREATE TABLE AppUsers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(100),
    phone NVARCHAR(20) UNIQUE,
    password NVARCHAR(100),
    role NVARCHAR(20), -- 'admin' hoặc 'user'
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- 3. TẠO BẢNG PARKINGLOTS
CREATE TABLE ParkingLots (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(200),
    address NVARCHAR(MAX),
    total_spots INT,
    available_spots INT,
    base_price DECIMAL(18, 2),
    current_price DECIMAL(18, 2),
    rating FLOAT,
    image_url NVARCHAR(MAX),
    amenities NVARCHAR(MAX),
    description NVARCHAR(MAX),
    latitude DECIMAL(18, 15),
    longitude DECIMAL(18, 15)
);
GO

-- 4. TẠO BẢNG BOOKINGS
CREATE TABLE Bookings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id_int INT FOREIGN KEY REFERENCES AppUsers(id), -- Khớp với code Node.js
    parking_lot_id INT FOREIGN KEY REFERENCES ParkingLots(id),
    vehicle_number NVARCHAR(50),
    start_time DATETIME,
    end_time DATETIME,
    total_cost DECIMAL(18, 2),
    status NVARCHAR(50), -- 'confirmed', 'completed', 'cancelled'
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
GO

-- 5. BẢNG CẤU HÌNH HỆ THỐNG (CHO DASHBOARD)
CREATE TABLE SystemConfig (
    id INT IDENTITY(1,1) PRIMARY KEY,
    config_key NVARCHAR(100) UNIQUE,
    config_value NVARCHAR(MAX),
    updated_at DATETIME DEFAULT GETDATE()
);
GO

-- 6. SEED DATA (DỮ LIỆU MẪU ĐỂ TEST)
INSERT INTO AppUsers (full_name, phone, password, role)
VALUES (N'Master Admin', 'admin', '123456', 'admin'),
       (N'Khách Vip', '0912345678', '123456', 'user');

INSERT INTO ParkingLots (name, address, total_spots, available_spots, base_price, current_price, rating, amenities, description)
VALUES 
(N'Vincom Center Đồng Khởi', N'72 Lê Thánh Tôn, Q1', 150, 138, 50000, 50000, 4.8, 'Camera,Covered,EV Charging', N'Bãi đỗ xe ngầm hiện đại nhất trung tâm.'),
(N'Sân Bay Tân Sơn Nhất', N'Trường Sơn, Tân Bình', 500, 441, 30000, 35000, 4.5, 'Shuttle,24/7,Car Wash', N'Bãi xe ga quốc nội, an ninh tuyệt đối.'),
(N'Bitexco Financial Tower', N'2 Hải Triều, Q1', 80, 25, 100000, 120000, 5.0, 'Valet,VIP Lounge', N'Dành riêng cho khách VIP.');

PRINT '>>> [SUCCESS] DATABASE ĐÃ ĐƯỢC KHÔI PHỤC CHUẨN CHỈ <<<';