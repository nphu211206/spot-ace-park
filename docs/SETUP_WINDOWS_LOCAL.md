# Spot Ace Park - Chạy Trên Máy Windows Mới

## 1. Cần cài gì trước

- `Git`
- `Node.js 20 LTS` hoặc mới hơn
- Nếu `npm install` lỗi ở package native như `msnodesqlv8`, cài thêm `Visual Studio Build Tools` với workload `Desktop development with C++`, rồi chạy lại `npm install`

## 2. Clone dự án

```bash
git clone https://github.com/nphu211206/spot-ace-park.git
cd spot-ace-park
```

## 3. Cài dependencies

```bash
npm install
```

## 4. Chạy bản local để test nhanh

Mở 2 terminal.

Terminal 1:

```bash
npm run mock-api
```

Terminal 2:

```bash
npm run dev
```

Mở trình duyệt tại:

- `http://localhost:5173`

## 5. Chạy bản preview giống lúc kiểm thử browser

Mở 2 terminal.

Terminal 1:

```bash
npm run mock-api
```

Terminal 2:

```bash
npm run build
npm run preview:local
```

Mở trình duyệt tại:

- `http://localhost:8080`

## 6. Ghi chú

- Repo đã có `.env` cho luồng test local.
- `VITE_GOOGLE_MAPS_API_KEY` đang để trống, nên app sẽ dùng fallback map trong app thay vì Google Maps embed đầy đủ.
- Nếu sau này muốn dùng backend thật thay vì mock backend, cần cấu hình riêng `server.js` và database tương ứng.
