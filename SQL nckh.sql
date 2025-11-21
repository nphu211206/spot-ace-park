-- =============================================
-- MASTER DATABASE SCHEMA FOR SPOT ACE PARK
-- LEVEL: CONTINENTAL / ENTERPRISE
-- =============================================

USE master;
GO

-- 1. TẠO DATABASE NẾU CHƯA CÓ
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'SpotAcePark')
BEGIN
    CREATE DATABASE SpotAcePark;
END
GO

USE SpotAcePark;
GO

-- 2. XÓA BẢNG CŨ (LÀM SẠCH)
DROP TABLE IF EXISTS Reviews;
DROP TABLE IF EXISTS Transactions;
DROP TABLE IF EXISTS SystemConfig;
DROP TABLE IF EXISTS Bookings;
DROP TABLE IF EXISTS ParkingLots;
DROP TABLE IF EXISTS AppUsers;
GO

-- 3. BẢNG NGƯỜI DÙNG (USERS) - THAY THẾ AUTH.USERS CỦA SUPABASE
CREATE TABLE AppUsers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(100) NOT NULL,
    phone NVARCHAR(20) NOT NULL UNIQUE,
    password NVARCHAR(100) NOT NULL, -- Trong thực tế nên mã hóa hash
    role NVARCHAR(20) CHECK (role IN ('admin', 'user', 'manager')) DEFAULT 'user',
    avatar_url NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    is_active BIT DEFAULT 1
);
GO

-- 4. BẢNG BÃI ĐỖ XE (PARKING LOTS)
CREATE TABLE ParkingLots (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    address NVARCHAR(MAX) NOT NULL,
    latitude DECIMAL(18, 15), -- Độ chính xác cao cho GPS
    longitude DECIMAL(18, 15),
    total_spots INT NOT NULL CHECK (total_spots > 0),
    available_spots INT NOT NULL CHECK (available_spots >= 0),
    base_price DECIMAL(18, 2) NOT NULL,
    current_price DECIMAL(18, 2) NOT NULL, -- Giá động AI
    rating DECIMAL(3, 2) DEFAULT 5.0,
    description NVARCHAR(MAX),
    amenities NVARCHAR(MAX), -- Lưu dạng JSON String (VD: "Camera, Mái che")
    image_url NVARCHAR(MAX),
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- 5. BẢNG ĐẶT CHỖ (BOOKINGS) - TRÁI TIM CỦA HỆ THỐNG
CREATE TABLE Bookings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES AppUsers(id),
    parking_lot_id INT NOT NULL FOREIGN KEY REFERENCES ParkingLots(id),
    vehicle_number NVARCHAR(50) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    total_cost DECIMAL(18, 2) NOT NULL,
    status NVARCHAR(50) CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'checked-in')) DEFAULT 'pending',
    qr_code_data NVARCHAR(MAX), -- Mã QR định danh
    notes NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- 6. BẢNG CẤU HÌNH HỆ THỐNG (SYSTEM CONFIG) - CHO AI
CREATE TABLE SystemConfig (
    id INT IDENTITY(1,1) PRIMARY KEY,
    config_key NVARCHAR(100) NOT NULL UNIQUE,
    config_value NVARCHAR(MAX) NOT NULL, -- Lưu JSON config
    description NVARCHAR(255)
);
GO

-- 7. BẢNG ĐÁNH GIÁ (REVIEWS)
CREATE TABLE Reviews (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES AppUsers(id),
    parking_lot_id INT FOREIGN KEY REFERENCES ParkingLots(id),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- =============================================
-- SEED DATA (DỮ LIỆU MẪU ĐỂ TEST NGAY)
-- =============================================

-- A. Tạo Admin & User
INSERT INTO AppUsers (full_name, phone, password, role)
VALUES 
(N'Super Administrator', 'admin', '123456', 'admin'), -- SĐT: admin / Pass: 123456
(N'Nguyễn Văn Khách', '0909123456', '123456', 'user');

-- B. Tạo Bãi xe (Dữ liệu thật ở TP.HCM)
INSERT INTO ParkingLots (name, address, latitude, longitude, total_spots, available_spots, base_price, current_price, amenities, image_url)
VALUES 
(N'Vincom Center Đồng Khởi', N'72 Lê Thánh Tôn, Bến Nghé, Quận 1, Hồ Chí Minh', 10.7769, 106.7009, 200, 150, 50000, 50000, N'Camera,An ninh 24/7,Thẻ từ', 'https://images.unsplash.com/photo-1573348722427-f1d6d71813cd?q=80&w=1000&auto=format&fit=crop'),
(N'Sân Bay Tân Sơn Nhất (Ga Quốc Nội)', N'Đường Trường Sơn, Phường 2, Tân Bình', 10.8184, 106.6580, 1000, 450, 30000, 35000, N'Mái che,Xe đưa đón,Sạc điện', 'https://images.unsplash.com/photo-1470224114660-3f6686c562eb?q=80&w=1000&auto=format&fit=crop'),
(N'Bitexco Financial Tower', N'2 Hải Triều, Bến Nghé, Quận 1', 10.7716, 106.7044, 100, 12, 100000, 120000, N'VIP,Rửa xe,Valet Parking', 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?q=80&w=1000&auto=format&fit=crop');

-- C. Tạo Cấu hình AI
INSERT INTO SystemConfig (config_key, config_value, description)
VALUES 
('weather_impact', '{"factor": 1.2, "rain_threshold": 0.8}', N'Hệ số tăng giá khi mưa'),
('peak_hours', '{"morning": [7,9], "evening": [17,19]}', N'Khung giờ cao điểm');

-- D. Tạo Booking Mẫu (Để test Scanner)
-- Biển số: 29A-12345
INSERT INTO Bookings (user_id, parking_lot_id, vehicle_number, start_time, end_time, total_cost, status)
VALUES 
(2, 1, '29A-12345', GETDATE(), DATEADD(HOUR, 2, GETDATE()), 100000, 'confirmed');

PRINT '✅ DATABASE SETUP COMPLETED SUCCESSFULLY!';