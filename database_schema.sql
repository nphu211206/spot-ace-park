-- =============================================
-- PROJECT: SPOT ACE PARK - ENTERPRISE EDITION
-- DATABASE: SQL SERVER (T-SQL)
-- AUTHOR: MASTER DEV
-- DESCRIPTION: FULL SCHEMA & SEED DATA
-- =============================================

USE master;
GO

-- 1. TẠO DATABASE (NẾU CHƯA CÓ)
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'SpotAcePark')
BEGIN
    CREATE DATABASE SpotAcePark;
    PRINT '>>> DATABASE SpotAcePark CREATED SUCCESSFULLY';
END
GO

USE SpotAcePark;
GO

-- 2. DỌN DẸP BẢNG CŨ (CLEANUP)
-- Xóa theo thứ tự ngược lại của quan hệ khóa ngoại
DROP TABLE IF EXISTS Payments;
DROP TABLE IF EXISTS Reviews;
DROP TABLE IF EXISTS SystemConfig;
DROP TABLE IF EXISTS Bookings;
DROP TABLE IF EXISTS ParkingLots;
DROP TABLE IF EXISTS AppUsers;
GO

-- =============================================
-- 3. KHỞI TẠO CẤU TRÚC BẢNG (SCHEMA)
-- =============================================

-- [TABLE] NGƯỜI DÙNG
CREATE TABLE AppUsers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(100) NOT NULL,
    phone NVARCHAR(20) NOT NULL UNIQUE, -- Số điện thoại là định danh duy nhất
    password NVARCHAR(255) NOT NULL,    -- Mật khẩu (Nên hash trong thực tế)
    role NVARCHAR(20) CHECK (role IN ('admin', 'user', 'manager')) DEFAULT 'user',
    avatar_url NVARCHAR(MAX),
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- [TABLE] BÃI ĐỖ XE
CREATE TABLE ParkingLots (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(200) NOT NULL,
    address NVARCHAR(MAX) NOT NULL,
    latitude DECIMAL(18, 15) NOT NULL, -- Tọa độ GPS chính xác cao
    longitude DECIMAL(18, 15) NOT NULL,
    total_spots INT NOT NULL CHECK (total_spots > 0),
    available_spots INT NOT NULL CHECK (available_spots >= 0),
    base_price DECIMAL(18, 2) NOT NULL, -- Giá gốc
    current_price DECIMAL(18, 2) NOT NULL, -- Giá biến động (AI Pricing)
    rating DECIMAL(3, 2) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
    description NVARCHAR(MAX),
    amenities NVARCHAR(MAX), -- Lưu danh sách tiện ích dạng chuỗi (VD: "Camera,Wifi")
    image_url NVARCHAR(MAX),
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- [TABLE] CẤU HÌNH HỆ THỐNG (CHO AI & SETTINGS)
CREATE TABLE SystemConfig (
    id INT IDENTITY(1,1) PRIMARY KEY,
    config_key NVARCHAR(100) NOT NULL UNIQUE,
    config_value NVARCHAR(MAX) NOT NULL, -- Lưu JSON string
    description NVARCHAR(255),
    updated_at DATETIME DEFAULT GETDATE()
);
GO

-- [TABLE] ĐẶT CHỖ (BOOKINGS)
CREATE TABLE Bookings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id_int INT NOT NULL FOREIGN KEY REFERENCES AppUsers(id), -- Liên kết với bảng AppUsers
    parking_lot_id INT NOT NULL FOREIGN KEY REFERENCES ParkingLots(id),
    vehicle_number NVARCHAR(50) NOT NULL, -- Biển số xe
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    total_cost DECIMAL(18, 2) NOT NULL,
    status NVARCHAR(50) CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'checked-in')) DEFAULT 'pending',
    qr_code_data NVARCHAR(MAX), -- Mã vé QR
    notes NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- [TABLE] THANH TOÁN (PAYMENTS) - Nâng cao
CREATE TABLE Payments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT NOT NULL FOREIGN KEY REFERENCES Bookings(id),
    amount DECIMAL(18, 2) NOT NULL,
    payment_method NVARCHAR(50) DEFAULT 'cash', -- 'cash', 'momo', 'visa'
    status NVARCHAR(50) DEFAULT 'success',
    transaction_id NVARCHAR(100),
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- [TABLE] ĐÁNH GIÁ (REVIEWS)
CREATE TABLE Reviews (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES AppUsers(id),
    parking_lot_id INT NOT NULL FOREIGN KEY REFERENCES ParkingLots(id),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- =============================================
-- 4. DỮ LIỆU MẪU (SEED DATA) - ĐỂ TEST NGAY
-- =============================================

-- A. TẠO TÀI KHOẢN ADMIN & USER
INSERT INTO AppUsers (full_name, phone, password, role)
VALUES 
(N'Super Administrator', 'admin', '123456', 'admin'), -- Admin tối cao
(N'Nguyễn Văn Khách', '0909123456', '123456', 'user'), -- Khách hàng mẫu
(N'Trần Thị Test', '0988888888', '123456', 'user');
GO

-- B. TẠO BÃI ĐỖ XE (Dữ liệu thật TP.HCM)
INSERT INTO ParkingLots (name, address, latitude, longitude, total_spots, available_spots, base_price, current_price, amenities, image_url, description)
VALUES 
(N'Vincom Center Đồng Khởi', N'72 Lê Thánh Tôn, Bến Nghé, Quận 1, Hồ Chí Minh', 10.7769, 106.7009, 200, 150, 50000, 50000, N'Camera an ninh,Thẻ từ,Mái che', 'https://images.unsplash.com/photo-1573348722427-f1d6d71813cd?q=80&w=1000', N'Bãi đỗ xe ngầm hiện đại nhất trung tâm.'),
(N'Sân Bay Tân Sơn Nhất (Ga Quốc Nội)', N'Đường Trường Sơn, Phường 2, Tân Bình', 10.8184, 106.6580, 1000, 450, 30000, 35000, N'Xe đưa đón,Sạc xe điện,An ninh 24/7', 'https://images.unsplash.com/photo-1470224114660-3f6686c562eb?q=80&w=1000', N'Bãi đỗ xe sân bay rộng rãi, an ninh cao.'),
(N'Bitexco Financial Tower', N'2 Hải Triều, Bến Nghé, Quận 1', 10.7716, 106.7044, 100, 12, 100000, 120000, N'VIP Valet,Rửa xe,Khu vực riêng', 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?q=80&w=1000', N'Dành cho khách VIP, dịch vụ đỗ xe hộ.');
GO

-- C. TẠO CẤU HÌNH HỆ THỐNG (CHO AI CHẠY)
INSERT INTO SystemConfig (config_key, config_value, description)
VALUES 
('weather_impact', '{"factor": 1.2, "rain_threshold": 0.8}', N'Hệ số tăng giá khi trời mưa'),
('peak_hours', '{"morning_start": 7, "morning_end": 9, "evening_start": 17, "evening_end": 19}', N'Khung giờ cao điểm'),
('ai_model_version', '{"version": "v2.5-turbo", "last_updated": "2024-05-20"}', N'Phiên bản AI Pricing');
GO

-- D. TẠO BOOKING MẪU (ĐỂ TEST SCANNER)
-- Chú ý: user_id_int = 2 (Nguyễn Văn Khách)
INSERT INTO Bookings (user_id_int, parking_lot_id, vehicle_number, start_time, end_time, total_cost, status, notes)
VALUES 
(2, 1, '29A-123.45', GETDATE(), DATEADD(HOUR, 2, GETDATE()), 100000, 'confirmed', N'Đặt qua App SpotAce'),
(2, 2, '51H-999.99', DATEADD(DAY, -1, GETDATE()), DATEADD(DAY, -1, DATEADD(HOUR, 5, GETDATE())), 150000, 'completed', N'Đã hoàn thành'),
(3, 1, '30E-567.89', GETDATE(), DATEADD(HOUR, 4, GETDATE()), 200000, 'pending', N'Chưa thanh toán');
GO

PRINT '>>> [SUCCESS] MASTER DATABASE SETUP COMPLETED!';
GO