const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:8080";
const DEBUG_HOST = "http://127.0.0.1:9222";
const OUT_DIR = path.join(process.cwd(), "docs", "screenshots");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class CDPSession {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.socket = null;
    this.id = 0;
    this.pending = new Map();
    this.events = new Map();
  }

  async connect() {
    this.socket = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });

    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) {
          pending.reject(new Error(message.error.message));
        } else {
          pending.resolve(message.result);
        }
        return;
      }
      const handlers = this.events.get(message.method) || [];
      handlers.forEach((h) => h(message.params));
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async close() {
    if (!this.socket || this.socket.readyState >= 2) return;
    this.socket.close();
  }
}

async function evalInPage(page, expression) {
  const res = await page.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  return res?.result?.value;
}

async function takeScreenshot(page, filename) {
  const filePath = path.join(OUT_DIR, filename);
  const screenshot = await page.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
  });
  fs.writeFileSync(filePath, Buffer.from(screenshot.data, "base64"));
  const sizeKB = (screenshot.data.length * 0.75 / 1024).toFixed(1);
  console.log(`[CAPTURED] ${filename} (~${sizeKB} KB)`);
  return filePath;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log("Connecting to Edge CDP at " + DEBUG_HOST);
  const browserInfo = await fetch(`${DEBUG_HOST}/json/version`).then((r) => r.json());
  const pageTargets = await fetch(`${DEBUG_HOST}/json/list`).then((r) => r.json());
  let pageTarget = pageTargets.find((t) => t.type === "page");
  if (!pageTarget) {
    throw new Error("No debuggable page target found.");
  }

  const browser = new CDPSession(browserInfo.webSocketDebuggerUrl);
  await browser.connect();

  const page = new CDPSession(pageTarget.webSocketDebuggerUrl);
  await page.connect();

  await page.send("Page.enable");
  await page.send("Runtime.enable");
  await page.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await page.send("Page.bringToFront");

  console.log("Starting screenshot capture sequence...");

  // 1. Home / Landing Page
  console.log("1. Navigating to Home...");
  await page.send("Page.navigate", { url: `${BASE_URL}/` });
  await sleep(3000);
  await takeScreenshot(page, "screenshot_01_trang_chu.png");

  // 2. Auth - Login
  console.log("2. Navigating to Auth (Login)...");
  await page.send("Page.navigate", { url: `${BASE_URL}/auth` });
  await sleep(2000);
  await takeScreenshot(page, "screenshot_02_dang_nhap.png");

  // 3. Auth - Signup Tab
  console.log("3. Switching to Signup Tab...");
  await evalInPage(page, `(() => {
    const tabs = document.querySelectorAll('[role="tab"]');
    for (const t of tabs) {
      if (t.textContent.includes("Đăng ký") || t.textContent.includes("Sign Up") || t.textContent.includes("Register")) {
        t.click();
        return;
      }
    }
    if (tabs.length > 1) tabs[1].click();
  })()`);
  await sleep(1500);
  await takeScreenshot(page, "screenshot_03_dang_ky.png");

  // Set user auth
  await evalInPage(page, `
    localStorage.setItem('spot_user', JSON.stringify({
      id: 2,
      name: 'Nguyễn Phú Toàn',
      phone: '0900000000',
      role: 'user'
    }));
    true;
  `);

  // 4. Parking List
  console.log("4. Navigating to Parking List...");
  await page.send("Page.navigate", { url: `${BASE_URL}/parking` });
  await sleep(3500);
  await takeScreenshot(page, "screenshot_04_danh_sach_bai_xe.png");

  // 5. 3D Digital Twin - Overview
  console.log("5. Scrolling to 3D Canvas...");
  await evalInPage(page, `
    window.scrollTo({ top: 400, behavior: 'smooth' });
  `);
  await sleep(4000);
  await takeScreenshot(page, "screenshot_05_digital_twin_3d_toan_canh.png");

  // 6. 3D Digital Twin - Spot Selection
  console.log("6. Interacting with 3D Canvas / Selection...");
  await evalInPage(page, `(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = rect.left + rect.width * 0.5;
      const y = rect.top + rect.height * 0.45;
      canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: y, bubbles: true }));
      canvas.dispatchEvent(new MouseEvent('click', { clientX: x, clientY: y, bubbles: true }));
    }
    // Also click slot card or filter if available
    const slotBtns = document.querySelectorAll('button');
    for (const b of slotBtns) {
      if (b.textContent.includes('A-01') || b.textContent.includes('A01') || b.textContent.includes('B-02')) {
        b.click();
        break;
      }
    }
  })()`);
  await sleep(2000);
  await takeScreenshot(page, "screenshot_06_digital_twin_3d_chon_slot.png");

  // 7. Booking Page - Slot detail
  console.log("7. Navigating to Booking Page...");
  await page.send("Page.navigate", { url: `${BASE_URL}/parking/1` });
  await sleep(3000);
  await takeScreenshot(page, "screenshot_07_chi_tiet_dat_cho.png");

  // 8. Payment Gateway
  console.log("8. Scrolling to Payment Gateway...");
  await evalInPage(page, `
    window.scrollTo({ top: 600, behavior: 'smooth' });
  `);
  await sleep(2000);
  await takeScreenshot(page, "screenshot_08_cong_thanh_toan.png");

  // 9. Bookings list
  console.log("9. Navigating to Bookings List...");
  await page.send("Page.navigate", { url: `${BASE_URL}/bookings` });
  await sleep(3000);
  await takeScreenshot(page, "screenshot_09_lich_su_dat_cho.png");

  // 10. QR Ticket detail
  console.log("10. Viewing QR Ticket Detail...");
  await evalInPage(page, `
    const card = document.querySelector('[class*="border"], [class*="rounded-xl"], .card');
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  `);
  await sleep(2000);
  await takeScreenshot(page, "screenshot_10_chi_tiet_ve_qr.png");

  // 11. EV Charging
  console.log("11. Navigating to EV Charging...");
  await page.send("Page.navigate", { url: `${BASE_URL}/charging` });
  await sleep(3000);
  await takeScreenshot(page, "screenshot_11_mang_luoi_tram_sac.png");

  // 12. EV Charging session / modal
  console.log("12. Scrolling EV Charging detail...");
  await evalInPage(page, `
    window.scrollTo({ top: 380, behavior: 'smooth' });
  `);
  await sleep(2000);
  await takeScreenshot(page, "screenshot_12_dat_lich_sac_ev.png");

  // 13. Scanner
  console.log("13. Navigating to Scanner...");
  await page.send("Page.navigate", { url: `${BASE_URL}/scanner` });
  await sleep(3000);
  await takeScreenshot(page, "screenshot_13_quet_ve_scanner.png");

  // 14. Manager Dashboard
  console.log("14. Navigating to Manager Dashboard...");
  await page.send("Page.navigate", { url: `${BASE_URL}/manager` });
  await sleep(3000);
  await takeScreenshot(page, "screenshot_14_manager_dashboard.png");

  // Set admin auth
  await evalInPage(page, `
    localStorage.setItem('spot_user', JSON.stringify({
      id: 1,
      name: 'Admin User',
      phone: 'admin',
      role: 'admin'
    }));
    true;
  `);

  // 15. Admin Dashboard - Overview
  console.log("15. Navigating to Admin Dashboard...");
  await page.send("Page.navigate", { url: `${BASE_URL}/admin` });
  await sleep(4000);
  await takeScreenshot(page, "screenshot_15_admin_dashboard_tong_quan.png");

  // 16. Admin Control IoT & Jarvis
  console.log("16. Scrolling to IoT Control & Jarvis...");
  await evalInPage(page, `
    window.scrollTo({ top: 900, behavior: 'smooth' });
  `);
  await sleep(2500);
  await takeScreenshot(page, "screenshot_16_admin_control_iot_jarvis.png");

  console.log("ALL 16 SCREENSHOTS CAPTURED SUCCESSFULLY!");

  await page.close();
  await browser.close();
}

main().catch((err) => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
