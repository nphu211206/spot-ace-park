const http = require("http");
const { URL } = require("url");

const parkingLots = [
  {
    id: 1,
    name: "Vincom Center \u0110\u1ed3ng Kh\u1edfi",
    address: "72 L\u00ea Th\u00e1nh T\u00f4n, Qu\u1eadn 1, TP.HCM",
    latitude: 10.777233,
    longitude: 106.700806,
    total_spots: 50,
    available_spots: 14,
    base_price: 20000,
    current_price: 25000,
    rating: 4.8,
    description: "B\u00e3i \u0111\u1ed7 th\u00f4ng minh t\u1ea1i trung t\u00e2m th\u00e0nh ph\u1ed1.",
    amenities: "EV,VIP,Camera,24/7",
    image_url: null,
  },
  {
    id: 2,
    name: "Landmark 81 Smart Parking",
    address: "720A \u0110i\u1ec7n Bi\u00ean Ph\u1ee7, B\u00ecnh Th\u1ea1nh, TP.HCM",
    latitude: 10.794954,
    longitude: 106.721893,
    total_spots: 80,
    available_spots: 22,
    base_price: 18000,
    current_price: 22000,
    rating: 4.7,
    description: "B\u00e3i xe cao t\u1ea7ng v\u1edbi AI pricing v\u00e0 digital twin.",
    amenities: "VIP,Camera,Indoor",
    image_url: null,
  },
];

const bookings = [
  {
    id: 1001,
    user_id_int: 2,
    parking_lot_id: 1,
    parking_name: "Vincom Center \u0110\u1ed3ng Kh\u1edfi",
    address: "72 L\u00ea Th\u00e1nh T\u00f4n, Qu\u1eadn 1, TP.HCM",
    vehicle_number: "51H-12345",
    total_cost: 75000,
    status: "confirmed",
    start_time: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 100 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    spot_id: "A01",
    transaction_id: "TXN-DEMO-1001",
    duration_minutes: 120,
  },
  {
    id: 1002,
    user_id_int: 2,
    parking_lot_id: 2,
    parking_name: "Landmark 81 Smart Parking",
    address: "720A \u0110i\u1ec7n Bi\u00ean Ph\u1ee7, B\u00ecnh Th\u1ea1nh, TP.HCM",
    vehicle_number: "30A-99999",
    total_cost: 240000,
    status: "completed",
    start_time: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    spot_id: "B12",
    transaction_id: "TXN-DEMO-1002",
    duration_minutes: 360,
  },
];

const users = [
  { id: 2, full_name: "Test User", phone: "0900000000", password: "123456", role: "user" },
  { id: 1, full_name: "Admin User", phone: "admin", password: "211206", role: "admin" },
];

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  res.end(JSON.stringify(payload));
};

const collectBody = (req) =>
  new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });

const buildUserPayload = (user) => ({
  id: user.id,
  name: user.full_name,
  phone: user.phone,
  role: user.role,
});

const resolveRoleFromCode = (adminCode) => {
  const code = String(adminCode || "").trim().toUpperCase();

  if (code === "SPOT_ACE_MASTER" || code.startsWith("MASTER")) {
    return "admin";
  }

  if (code === "SPOT_ACE_MANAGER" || code.includes("MANAGER")) {
    return "manager";
  }

  return "user";
};

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    sendJson(res, 404, { message: "Not found" });
    return;
  }

  if (req.method === "OPTIONS") {
    sendJson(res, 200, { ok: true });
    return;
  }

  const parsedUrl = new URL(req.url, "http://localhost:3000");
  const { pathname, searchParams } = parsedUrl;

  if (req.method === "POST" && pathname === "/api/auth/login") {
    const body = await collectBody(req);
    const user = users.find((item) => item.phone === body.phone && item.password === body.password);

    if (!user) {
      sendJson(res, 401, { success: false, message: "Sai thông tin" });
      return;
    }

    sendJson(res, 200, { success: true, user: buildUserPayload(user) });
    return;
  }

  if (req.method === "POST" && pathname === "/api/auth/signup") {
    const body = await collectBody(req);
    const fullName = String(body.fullName || "").trim();
    const phone = String(body.phone || "").trim();
    const password = String(body.password || "").trim();

    if (!fullName || !phone || !password) {
      sendJson(res, 400, { success: false, message: "Vui lòng điền đủ họ tên, số điện thoại và mật khẩu." });
      return;
    }

    const existingUser = users.find((item) => item.phone === phone);
    if (existingUser) {
      sendJson(res, 409, { success: false, message: "Số điện thoại này đã tồn tại." });
      return;
    }

    const newUser = {
      id: Date.now(),
      full_name: fullName,
      phone,
      password,
      role: resolveRoleFromCode(body.adminCode),
    };

    users.unshift(newUser);
    sendJson(res, 201, { success: true, user: buildUserPayload(newUser) });
    return;
  }

  if (req.method === "GET" && pathname === "/api/parking-lots") {
    sendJson(res, 200, parkingLots);
    return;
  }

  if (req.method === "GET" && pathname.startsWith("/api/parking-lots/")) {
    const lotId = Number(pathname.split("/").pop());
    const lot = parkingLots.find((item) => item.id === lotId);

    if (!lot) {
      sendJson(res, 404, { message: "Not found" });
      return;
    }

    sendJson(res, 200, lot);
    return;
  }

  if (req.method === "GET" && pathname === "/api/bookings") {
    const userId = Number(searchParams.get("userId"));
    sendJson(res, 200, bookings.filter((booking) => booking.user_id_int === userId));
    return;
  }

  if (req.method === "POST" && pathname === "/api/payment/confirm") {
    const body = await collectBody(req);
    sendJson(res, 200, {
      success: true,
      transactionId: `TXN-${Date.now()}-MOCK`,
      message: `Mock payment accepted via ${String(body.method || "unknown").toUpperCase()}`,
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/bookings") {
    const body = await collectBody(req);
    const lot = parkingLots.find((item) => item.id === Number(body.lotId));

    if (lot && lot.available_spots > 0) {
      lot.available_spots -= 1;
    }

    const nextBooking = {
      id: Date.now(),
      user_id_int: Number(body.userId) || 2,
      parking_lot_id: Number(body.lotId),
      parking_name: lot?.name || "Mock Parking",
      address: lot?.address || "Mock Address",
      vehicle_number: body.vehicleNumber || "TEST-0000",
      total_cost: Number(body.totalCost) || 0,
      status: "confirmed",
      start_time: body.startTime || new Date().toISOString(),
      end_time: body.endTime || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      spot_id: body.spotId || "A01",
      transaction_id: body.transactionId || `TXN-${Date.now()}-BOOKING`,
      duration_minutes: Number(body.durationMinutes) || 120,
    };

    bookings.unshift(nextBooking);
    sendJson(res, 200, { success: true, booking: nextBooking });
    return;
  }

  sendJson(res, 404, { message: "Not found" });
});

server.listen(3000, "0.0.0.0", () => {
  console.log("Mock backend listening at http://localhost:3000");
});
