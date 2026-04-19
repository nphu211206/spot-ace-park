# Spot Ace Park Final Research Plan

## 1. Muc tieu cua ban final

Xay dung lai de tai theo huong ro rang hon, thuc te hon va co the trien khai thanh mot san pham demo hoan chinh:

**Spot Ace Park - Nen tang ket noi mang luoi bai do xe va tram sac xe dien thong minh**

Huong final khong chi la "bai do co them mo hinh EV", ma la mot he thong dich vu tron goi:

- Tim bai do co cho trong theo thoi gian thuc
- Tim cho do EV co tru sac phu hop voi loai xe
- Dat cho truoc cho ca do xe va sac dien
- Dieu huong den bai do/tru sac toi uu
- Quan ly phien sac trong thoi gian do xe
- Thanh toan hop nhat phi do xe + phi sac + phi qua gio
- Dieu hanh, theo doi, bao cao va toi uu van hanh cho manager/admin

## 2. Ket qua phan tich tai lieu nguon

### 2.1. Tu file thuyet minh cu cua ban

File: `C:\Users\Admin\Downloads\Thuyet_Minh_Nguyen_Phu_Toan_TH29.11-3 (1).docx`

De tai goc cua ban da co huong di rat dung:

- Ten de tai: "Ket noi mang luoi bai do xe - tram sac thong minh"
- Da nghi den 3 role: user, manager, admin
- Da nghi den AI dynamic pricing
- Da nghi den IoT, camera, quet bien so
- Da mo rong sang EV Finder, Smart Charging Session, EV Route Planner

Van de hien tai khong nam o y tuong, ma nam o cho y tuong chua duoc "dong goi" thanh mot pham vi final ro rang de viet bao cao va trien khai tiep.

### 2.2. Tu file HUBT Social

File: `C:\Users\Admin\Downloads\Baocao_HUBT_SOCIALdocx.docx`

Bo cuc cua file nay rat hop de dung lam form chuan cho Spot Ace Park:

- Loi mo dau
- Chuong 1: Co so ly luan
- Chuong 2: Thuc trang, danh gia thuc trang
- Chuong 3: Giai phap, trien khai thuc hien
- Chuong 4: Ket luan, kien nghi

Ben trong Chuong 3, mau nay rat manh o cac phan:

- Mo hinh tong quan he thong
- So do use case
- Nhom tinh nang theo tung doi tuong
- Kien truc ky thuat
- Thiet ke CSDL
- Thiet ke UI/UX
- Cac luong hoat dong chinh
- Bao mat he thong

Do day la bo cuc nen ap dung cho ban final cua Spot Ace Park.

## 3. Hien trang du an Spot Ace Park trong code

Repo hien tai da co san cac nhom tinh nang sau:

- Frontend React + TypeScript + Vite
- Trang home, auth, parking, booking, bookings, profile, scanner, manager, admin
- Mo phong bai do 3D
- Dynamic pricing giao dien
- Quet bien so bang OCR
- Manager dashboard va admin dashboard
- Payment gateway demo
- API backend Node/Express + SQL Server
- IoT event log cho xe vao/ra

Nhung hien trang EV moi chu yeu dung o muc:

- Hinh anh/mo phong tram sac trong giao dien 3D
- Thong diep EV trong dashboard/demo

Chua co nghiep vu EV hoan chinh, vi du:

- Chua co bang du lieu cho charger, charging session, charging connector
- Chua co logic dat cho sac dien
- Chua co xep hang sac
- Chua co tinh gia dien + gia do tong hop
- Chua co theo doi phien sac theo SOC/cong suat/thoi gian
- Chua co toi uu tai dien hoac smart charging
- Chua co route planning cho EV

Ngoai ra, he thong hien tai con mot so khoang trong nghiep vu:

- Scanner page goi `/api/scan` nhung backend hien tai chua co route nay
- Nhieu tinh nang mang tinh demo/visual hon la nghiep vu dong bo dau-cuoi
- Schema hien tai chua phu hop de mo rong thanh bai do + tram sac thong minh day du

## 4. Huong chot de tai final

### 4.1. Dinh nghia moi de tai

De xuat ten final:

**Spot Ace Park: He thong ket noi mang luoi bai do xe va tram sac xe dien thong minh ung dung AI, IoT va phan tich du lieu**

### 4.2. Tuyen bo gia tri cua de tai

He thong giai quyet dong thoi 3 bai toan:

- Bai toan tim cho do xe nhanh, minh bach va dat truoc duoc
- Bai toan tim va su dung tram sac EV phu hop, tranh den noi nhung het cho/hong tru
- Bai toan quan ly van hanh bai do - tram sac theo thoi gian thuc cho don vi khai thac

## 5. Giai thich ro phan "them sac dien cho xe dien" nen lam the nao

De xuat **khong** lam theo huong chi "them icon tram sac" hoac chi "goi y duong di" mot cach don le.

Nen lam thanh 1 cum tinh nang hoan chinh gom 4 lop:

### Lop 1. Tim kiem va lua chon

- Nguoi dung loc bai do co ho tro EV
- Xem loai cong sac: AC, DC, CCS2, Type 2
- Xem cong suat, gia/kWh, trang thai trong
- Xem bai do con cho EV hay khong

### Lop 2. Dat cho truoc

- Dat cho do thuong
- Dat cho EV co kem tru sac
- Chon khung gio den
- Neu het cho: vao hang doi cho sac

### Lop 3. Phien sac thong minh

- Check-in bang QR hoac bien so
- Bat dau phien sac
- Theo doi trang thai sac tren app
- Canh bao 80%, day pin, qua gio
- Co the dung sac som tu xa

### Lop 4. Dieu hanh va thanh toan

- Tinh rieng phi do xe
- Tinh rieng phi dien tieu thu
- Tinh phi chiem cho sau khi sac day neu khong di xe
- Dashboard theo doi tai dien, doanh thu, luu luong, ty le su dung tram sac

Day moi la cach dua EV charging thanh mot "dich vu" hoan chinh, thay vi mot tinh nang trang tri.

## 6. Bo tinh nang moi de xuat cho ban final

### 6.1. Tinh nang cot loi cho nguoi dung

1. Tim bai do theo vi tri, gia, so cho trong, ho tro EV
2. Tim bai do co tru sac phu hop theo loai xe va muc pin
3. Dat cho truoc cho do hoac cho do + sac
4. Ban do chi duong den bai do/tram sac
5. Check-in bang QR, bien so hoac camera
6. Theo doi phien do xe va phien sac theo thoi gian thuc
7. Nhan canh bao sap het gio, sac 80%, day pin, phi qua gio
8. Thanh toan hop nhat
9. Xem lich su do xe, lich su sac, hoa don
10. Danh gia bai do/tram sac

### 6.2. Tinh nang thong minh de tang gia tri de tai

1. Smart suggestion:
   de xuat bai do/tru sac dua tren khoang cach, muc pin, chi phi, muc do dong, thoi gian cho
2. Dynamic pricing:
   gia do xe va gia sac thay doi theo cao diem, muc tai, thoi tiet, su kien
3. Queue management:
   xep hang cho EV khi het tru sac
4. Smart charging/load balancing:
   phan bo cong suat sạc hop ly khi nhieu xe sac cung luc
5. Occupancy prediction:
   du doan kha nang het cho trong 30-60 phut toi
6. Energy analytics:
   thong ke dien nang tieu thu, doanh thu EV, khung gio cao tai

### 6.3. Tinh nang cho manager

1. Quan ly bai do, khu vuc, o do, o do EV
2. Quan ly danh sach tru sac, cong sac, cong suat, tinh trang bao tri
3. Theo doi luot xe vao/ra, check-in/check-out
4. Theo doi phien sac dang dien ra
5. Dieu khien barrier, mo phong su kien IoT
6. Bao cao doanh thu theo bai do, theo EV, theo khung gio
7. Quan ly hang doi sac va canh bao tru qua tai
8. Quan ly su co: tru hong, mat ket noi, cam bien loi

### 6.4. Tinh nang cho admin

1. Quan ly nguoi dung, manager, bai do, tram sac
2. Quan ly activation code/doi tac
3. Cau hinh gia, thong so AI, thong so he thong
4. Theo doi toan mang luoi bai do - tram sac
5. Phan tich tong hop, heatmap khu vuc, tong doanh thu
6. Quan ly phan quyen va audit log

## 7. Luong nghiep vu final de de viet bao cao

### Luong 1. Dat cho do xe thuong

1. User mo app
2. Tim bai do gan nhat
3. Xem so cho trong
4. Dat cho
5. Den bai do
6. Quet QR/nhan dien bien so de vao cong
7. Do xe
8. Thanh toan
9. Roi bai

### Luong 2. Dat cho EV + sac dien

1. User nhap diem den hoac chon khu vuc
2. He thong loc bai do co tru sac phu hop
3. User chon loai cong sac, cong suat, khung gio den
4. He thong dat cho EV slot + tru sac
5. User den noi, check-in
6. He thong bat dau phien do xe va phien sac
7. App hien thi pin, cong suat, chi phi tam tinh, thoi gian con lai
8. He thong gui canh bao 80%, 100%, idle fee
9. User ket thuc, thanh toan tong hop
10. Dashboard cap nhat doanh thu va trang thai tru

### Luong 3. Dieu phoi khi het tru sac

1. User chon bai do nhung tat ca tru dang ban
2. He thong hien thi thoi gian cho du kien
3. User vao queue
4. Khi co tru trong, he thong gui thong bao giu cho trong mot khoang thoi gian
5. Neu user khong xac nhan, he thong chuyen luot cho nguoi tiep theo

### Luong 4. Dieu phoi cong suat sac

1. Nhieu xe cung sac trong mot khung gio
2. He thong tinh tong tai cho phep
3. He thong phan bo cong suat cho tung tru
4. Uu tien theo muc pin thap, thoi gian roi di, goi dich vu
5. Manager nhin thay muc tai va canh bao qua nguong

## 8. Kien truc he thong de xuat cho ban final

### 8.1. Kien truc logic

- Frontend Web App cho user
- Dashboard cho manager
- Dashboard cho admin
- Backend REST API
- Real-time layer (WebSocket hoac Supabase Realtime)
- Database trung tam
- IoT gateway nhan su kien barrier/camera/cam bien/charger

### 8.2. Cac module backend chinh

- Auth & Role module
- Parking network module
- EV charging module
- Booking & reservation module
- Payment & billing module
- IoT & event processing module
- Recommendation & pricing engine
- Analytics & reporting module
- Notification module

### 8.3. Mo hinh du lieu can bo sung

Ngoai cac bang hien co, de xuat them:

- Vehicles
- EVProfiles
- ChargingStations
- ChargingConnectors
- ChargingSessions
- ChargingReservations
- ChargingQueue
- TariffRules
- SensorDevices
- DeviceEvents
- Notifications
- AuditLogs

## 9. Cac bang du lieu chinh nen co trong ban final

### 9.1. Vehicles

- id
- user_id
- vehicle_type
- plate_number
- brand
- model
- ev_supported
- battery_capacity_kwh
- preferred_connector

### 9.2. ChargingStations

- id
- parking_lot_id
- station_code
- station_type
- max_power_kw
- status
- location_note

### 9.3. ChargingConnectors

- id
- station_id
- connector_type
- current_power_kw
- status

### 9.4. ChargingReservations

- id
- user_id
- vehicle_id
- parking_lot_id
- connector_id
- reservation_start
- reservation_end
- status

### 9.5. ChargingSessions

- id
- reservation_id
- connector_id
- start_time
- end_time
- energy_kwh
- start_soc
- end_soc
- charging_cost
- idle_fee
- total_cost
- status

## 10. Huong ky thuat va tieu chuan nen dua vao bao cao

Trong nghien cuu, co the vin vao nhung huong ky thuat hop ly sau:

- EV charging can ho tro theo mo hinh smart charging/load management
- OCPP 2.0.1 la huong chuan giao tiep hop ly cho CSMS va charging station
- Tich hop quan ly charger can chu trong monitoring, security va transaction handling
- Managed charging quan trong vi no giup tranh qua tai va phan bo cong suat thong minh

## 11. Can cu research de bao ve tinh hop ly cua huong mo rong EV

Mot so diem co the dua vao khi viet thuyet minh:

- IEA Global EV Outlook 2025 cho thay ha tang sac cong cong tiep tuc tang nhanh; rieng Indonesia, Thailand, Malaysia va Viet Nam da dat hon 24.000 charger, gap 9 lan nam 2022
- Open Charge Alliance xac nhan OCPP 2.0.1 bo sung device management, security, smart charging, improved transaction handling va ho tro ISO 15118
- Cac nghien cuu ve smart car parks with EV charging cho thay bai do co the tro thanh mot he sinh thai nang luong va dich vu, khong chi la noi gui xe

## 12. Pham vi khuyen nghi de lam duoc that

De tranh de tai bi qua lon, nen chot 3 tang:

### Tang A. Bat buoc phai co

- Dat cho bai do
- Tim EV slot
- Dat cho EV slot + tru sac
- Theo doi phien sac
- Thanh toan tong hop
- Dashboard manager/admin

### Tang B. Nen co de de tai manh

- Dynamic pricing
- Queue management
- Notification 80%/100%
- ANPR/QR check-in
- Bao cao doanh thu + dien nang

### Tang C. Nang cao neu con thoi gian

- EV route planner
- Occupancy prediction
- Smart load balancing thoi gian thuc
- Goi y bai do/tru sac theo AI scoring

Khuyen nghi chot final theo A + B, con C dua vao phan "huong phat trien".

## 13. Cach map Spot Ace Park vao bo cuc HUBT Social

### Loi mo dau

- Tinh cap thiet cua bai toan do xe do thi
- Su gia tang cua xe dien va nhu cau tram sac
- Khoang trong cua cac giai phap hien co
- Ly do chon Spot Ace Park

### Chuong 1. Co so ly luan

- Khai niem smart parking
- Khai niem EV charging management
- IoT trong bai do thong minh
- AI pricing/recommendation
- QR, ANPR/OCR, real-time monitoring

### Chuong 2. Thuc trang

- Thuc trang tim cho do xe o do thi
- Thuc trang bai do chua dong bo voi tram sac
- Thuc trang nguoi dung EV gap kho khi tim cho vua do vua sac
- Han che cua cac giai phap hien co

### Chuong 3. Giai phap, trien khai

- Mo hinh tong quan Spot Ace Park final
- Use case user/manager/admin
- Danh sach tinh nang chinh
- Kien truc ky thuat
- Thiet ke CSDL
- Thiet ke UI/UX
- Luong dat cho, luong sac, luong queue, luong thanh toan
- Bao mat he thong

### Chuong 4. Ket luan, kien nghi

- Ket qua dat duoc
- Han che
- Huong phat trien

## 14. De xuat chot huong voi ban

Phuong an minh khuyen nghi de chot la:

**Spot Ace Park final = smart parking network + EV charging service platform**

Khong chi la:

- bai do co them tram sac minh hoa
- hoac app chi duong den tram sac

Ma la:

- dat cho
- do xe
- sac dien
- xep hang
- thanh toan
- dieu hanh
- phan tich

Day la huong vua co tinh hoc thuat de viet bao cao, vua co tinh san pham de sau do trien khai phan mem.

## 15. Buoc tiep theo

Sau khi chot huong nay, can lam tiep 3 viec:

1. Chot ten de tai va pham vi final
2. Chot danh sach tinh nang A/B/C
3. Viet lai ban thuyet minh Spot Ace Park theo bo cuc HUBT Social

Khi bat dau viet thuyet minh, uu tien viet Chuong 3 truoc trong nhap nham noi bo, sau do quay lai Loi mo dau, Chuong 1 va Chuong 2 de dong bo lap luan.
