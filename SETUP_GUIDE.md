# 🚀 HƯỚNG DẪN CÀI ĐẶT SPOT ACE PARK - CHI TIẾT TỪNG BƯỚC

## 📋 MỤC LỤC
1. [Cài đặt Node.js](#1-cài-đặt-nodejs)
2. [Cài đặt Git](#2-cài-đặt-git)
3. [Clone dự án](#3-clone-dự-án-từ-github)
4. [Cài đặt packages](#4-cài-đặt-packages)
5. [Cấu hình SQL Server](#5-cấu-hình-sql-server)
6. [Tạo Database](#6-tạo-database)
7. [Cấu hình file .env](#7-cấu-hình-file-env)
8. [Chạy dự án](#8-chạy-dự-án)
9. [Xử lý lỗi](#9-xử-lý-lỗi-thường-gặp)

---

## 1. CÀI ĐẶT NODE.JS

### Bước 1.1: Tải Node.js
1. Mở trình duyệt (Chrome/Edge)
2. Truy cập: **https://nodejs.org**
3. Click nút **"Download Node.js (LTS)"** màu xanh lá
4. File tải về: `node-v20.x.x-x64.msi` (khoảng 30MB)

### Bước 1.2: Cài đặt
1. **Double-click** vào file `.msi` vừa tải
2. Click **Next**
3. Tick ✅ **"I accept the terms..."** → Click **Next**
4. Giữ nguyên đường dẫn mặc định → Click **Next**
5. Giữ nguyên tất cả options → Click **Next**
6. Click **Install** (có thể hỏi quyền Admin → Click **Yes**)
7. Đợi cài xong → Click **Finish**

### Bước 1.3: Kiểm tra
1. Nhấn **Windows + R**
2. Gõ `cmd` → Enter
3. Gõ lệnh:
```
node --version
```
4. Phải hiện ra: `v20.x.x` (hoặc v18.x.x)

5. Gõ tiếp:
```
npm --version
```
6. Phải hiện ra: `10.x.x` (hoặc 9.x.x)

✅ **Nếu hiện version = Thành công!**

---

## 2. CÀI ĐẶT GIT

### Bước 2.1: Tải Git
1. Truy cập: **https://git-scm.com/download/win**
2. Click **"64-bit Git for Windows Setup"**
3. File tải về: `Git-2.x.x-64-bit.exe` (khoảng 60MB)

### Bước 2.2: Cài đặt
1. **Double-click** file `.exe`
2. Click **Yes** nếu hỏi quyền Admin
3. Click **Next** liên tục (giữ mặc định tất cả)
4. Đến màn hình cuối → Click **Install**
5. Đợi cài xong → Click **Finish**

### Bước 2.3: Kiểm tra
1. Mở lại **cmd** (đóng cmd cũ, mở mới)
2. Gõ:
```
git --version
```
3. Phải hiện: `git version 2.x.x`

✅ **Nếu hiện version = Thành công!**

---

## 3. CLONE DỰ ÁN TỪ GITHUB

### Bước 3.1: Mở thư mục muốn lưu dự án
1. Mở **File Explorer** (Windows + E)
2. Vào ổ đĩa bạn muốn (ví dụ: `C:\Users\TenBan` hoặc `D:\Projects`)

### Bước 3.2: Mở Terminal tại thư mục đó
1. Click vào thanh địa chỉ (address bar) ở trên
2. Xóa hết, gõ `cmd` → Enter
3. Một cửa sổ cmd đen sẽ mở ra

### Bước 3.3: Clone dự án
1. Gõ lệnh sau:
```
git clone https://github.com/nphu211206/spot-ace-park.git
```
2. Đợi tải xong (khoảng 1-2 phút)
3. Sẽ thấy thư mục mới: `spot-ace-park`

### Bước 3.4: Mở dự án bằng VS Code
1. Gõ tiếp:
```
cd spot-ace-park
code .
```
2. VS Code sẽ mở ra với dự án

✅ **Thấy VS Code mở với các file = Thành công!**

---

## 4. CÀI ĐẶT PACKAGES

### Bước 4.1: Mở Terminal trong VS Code
1. Trong VS Code, nhấn **Ctrl + `** (dấu ` ở góc trái bàn phím, dưới Esc)
2. Hoặc vào menu **Terminal** → **New Terminal**

### Bước 4.2: Chạy npm install
1. Trong terminal, gõ:
```
npm install
```
2. Đợi cài đặt (3-5 phút, sẽ thấy progress bar chạy)
3. Khi xong sẽ thấy thư mục `node_modules` xuất hiện bên trái

✅ **Thấy "added xxx packages" = Thành công!**

---

## 5. CẤU HÌNH SQL SERVER (QUAN TRỌNG!)

### Bước 5.1: Mở SQL Server Configuration Manager
1. Nhấn **Windows** (phím có logo Windows)
2. Gõ tìm: `SQL Server Configuration Manager`
3. Click vào kết quả tìm được

**⚠️ Nếu không tìm thấy:**
- Tìm theo đường dẫn: `C:\Windows\SysWOW64\SQLServerManager16.msc`
- Hoặc số khác: `SQLServerManager15.msc`, `SQLServerManager14.msc`

### Bước 5.2: Bật TCP/IP
1. Ở cột trái, click mở rộng **SQL Server Network Configuration**
2. Click vào **Protocols for MSSQLSERVER** (hoặc tên instance của bạn)
3. Ở cột phải, tìm dòng **TCP/IP**
4. Nếu Status là **Disabled** → Click phải → **Enable**

### Bước 5.3: Kiểm tra Port 1433
1. Click phải vào **TCP/IP** → **Properties**
2. Chọn tab **IP Addresses**
3. Kéo xuống cuối, tìm **IPAll**
4. Kiểm tra **TCP Port** = `1433`
5. Nếu trống hoặc khác → Sửa thành `1433`
6. Click **OK**

### Bước 5.4: Restart SQL Server
1. Ở cột trái, click **SQL Server Services**
2. Click phải vào **SQL Server (MSSQLSERVER)** → **Restart**
3. Đợi restart xong (10-20 giây)

✅ **TCP/IP = Enabled, Port = 1433 = Thành công!**

---

## 6. TẠO DATABASE

### Bước 6.1: Mở SQL Server Management Studio (SSMS)
1. Nhấn **Windows**, gõ `SSMS` hoặc `SQL Server Management`
2. Click mở SSMS

### Bước 6.2: Kết nối Server
1. **Server name**: gõ `localhost` hoặc `.` (chấm)
2. **Authentication**: chọn `SQL Server Authentication`
   - Login: `sa`
   - Password: mật khẩu bạn đặt khi cài SQL
3. Hoặc chọn `Windows Authentication` nếu không nhớ password
4. Click **Connect**

### Bước 6.3: Tạo Database
1. Trong SSMS, click phải vào **Databases** (ở cột trái)
2. Chọn **New Database...**
3. Database name: `spot_ace_park`
4. Click **OK**

### Bước 6.4: Chạy Script tạo Tables
1. Click phải vào database `spot_ace_park` vừa tạo
2. Chọn **New Query**
3. Mở file `database_schema.sql` trong thư mục dự án (dùng Notepad)
4. Copy toàn bộ nội dung
5. Paste vào cửa sổ Query trong SSMS
6. Click nút **Execute** (hoặc F5)
7. Phải thấy "Commands completed successfully"

✅ **Thấy các tables trong database = Thành công!**

---

## 7. CẤU HÌNH FILE .ENV

### Bước 7.1: Mở file .env
1. Trong VS Code, tìm file `.env` ở thư mục gốc
2. Nếu không có, tạo mới: Click phải → **New File** → đặt tên `.env`

### Bước 7.2: Nội dung file .env
Copy paste nội dung sau và **SỬA LẠI PASSWORD**:

```env
# ============================
# DATABASE CONFIGURATION
# ============================
DB_HOST=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=MatKhauCuaBan123
DB_NAME=spot_ace_park

# ============================
# SERVER CONFIGURATION  
# ============================
PORT=3000
NODE_ENV=development

# ============================
# SUPABASE (Giữ nguyên hoặc để trống)
# ============================
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Bước 7.3: Sửa password
1. Thay `MatKhauCuaBan123` bằng password SQL Server thật của bạn
2. **Ctrl + S** để lưu

✅ **File .env đã lưu = Thành công!**

---

## 8. CHẠY DỰ ÁN

### Bước 8.1: Chạy Backend Server
1. Trong VS Code, mở Terminal (**Ctrl + `**)
2. Gõ:
```
node server.js
```
3. Phải thấy:
```
✅ Database connected successfully
🚀 Server running on port 3000
```

### Bước 8.2: Mở Terminal thứ 2 cho Frontend
1. Click dấu **+** ở góc phải của Terminal
2. Hoặc **Ctrl + Shift + `**
3. Gõ:
```
npm run dev
```
4. Phải thấy:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

### Bước 8.3: Mở trình duyệt
1. Mở Chrome/Edge
2. Gõ địa chỉ: **http://localhost:5173**
3. Trang web hiện ra!

✅ **Thấy giao diện Spot Ace Park = HOÀN THÀNH!** 🎉

---

## 9. XỬ LÝ LỖI THƯỜNG GẶP

### ❌ Lỗi: "ECONNREFUSED 127.0.0.1:1433"
**Nguyên nhân:** SQL Server không cho kết nối TCP/IP

**Cách sửa:**
1. Quay lại Bước 5 - Bật TCP/IP
2. Đảm bảo đã Restart SQL Server

---

### ❌ Lỗi: "Port 3000 is already in use"
**Nguyên nhân:** Port 3000 đang bị chương trình khác chiếm

**Cách sửa:**
1. Mở cmd với quyền Admin
2. Gõ:
```
netstat -ano | findstr :3000
```
3. Thấy số PID ở cuối (ví dụ: 12345)
4. Gõ:
```
taskkill /PID 12345 /F
```
5. Chạy lại `node server.js`

---

### ❌ Lỗi: "Login failed for user 'sa'"
**Nguyên nhân:** Sai password SQL

**Cách sửa:**
1. Mở SSMS
2. Click phải vào Server → **Properties**
3. Chọn **Security** → Đổi sang **SQL Server and Windows Authentication**
4. Click **OK**, Restart SQL Server
5. Reset password cho user `sa`:
   - Mở rộng **Security** → **Logins**
   - Click phải `sa` → **Properties**
   - Nhập password mới
   - Bỏ tick "Enforce password policy"
   - Click **OK**
6. Cập nhật password mới vào file `.env`

---

### ❌ Lỗi: "Cannot find module 'xxx'"
**Nguyên nhân:** Chưa cài đủ packages

**Cách sửa:**
```
npm install
```
Hoặc cài riêng module thiếu:
```
npm install ten-module
```

---

### ❌ Lỗi: "Database 'spot_ace_park' does not exist"
**Nguyên nhân:** Chưa tạo database

**Cách sửa:** Quay lại Bước 6 - Tạo Database

---

## 📞 LIÊN HỆ HỖ TRỢ

Nếu vẫn gặp lỗi, hãy:
1. Chụp màn hình lỗi
2. Ghi lại bước đang thực hiện
3. Liên hệ tác giả để được hỗ trợ

---

**🎉 CHÚC BẠN CÀI ĐẶT THÀNH CÔNG!**
