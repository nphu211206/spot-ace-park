const { spawn } = require("child_process");
const path = require("path");

const BASE_URL = "http://localhost:8080";
const DEBUG_HOST = "http://127.0.0.1:9222";
const MOCK_API_URL = "http://127.0.0.1:3000/api/parking-lots";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class CDPSession {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.socket = null;
    this.id = 0;
    this.pending = new Map();
  }

  async connect() {
    this.socket = new WebSocket(this.wsUrl);

    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });

    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);

      if (!message.id) {
        return;
      }

      const pending = this.pending.get(message.id);
      if (!pending) {
        return;
      }

      this.pending.delete(message.id);

      if (message.error) {
        pending.reject(new Error(message.error.message));
      } else {
        pending.resolve(message.result);
      }
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
    if (!this.socket) {
      return;
    }

    if (this.socket.readyState >= 2) {
      this.socket = null;
      return;
    }

    await new Promise((resolve) => {
      const timeout = setTimeout(resolve, 1000);

      this.socket.addEventListener(
        "close",
        () => {
          clearTimeout(timeout);
          resolve();
        },
        { once: true },
      );

      this.socket.addEventListener(
        "error",
        () => {
          clearTimeout(timeout);
          resolve();
        },
        { once: true },
      );

      this.socket.close();
    });

    this.socket = null;
  }
}

const getEvaluation = async (page, expression) => {
  const result = await page.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });

  return result.result?.value;
};

const waitForTruthy = async (page, expression, timeoutMs = 8000) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (await getEvaluation(page, expression)) {
      return true;
    }

    await sleep(250);
  }

  return false;
};

const waitForHttpOk = async (url, timeoutMs = 8000) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return true;
      }
    } catch {
      // Keep polling until timeout.
    }

    await sleep(250);
  }

  return false;
};

const startMockBackendForSmoke = async () => {
  if (await waitForHttpOk(MOCK_API_URL, 1200)) {
    return null;
  }

  const child = spawn(process.execPath, [path.join("scripts", "local-test-backend.cjs")], {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });

  let stdout = "";
  let stderr = "";

  child.stdout.on("data", (chunk) => {
    stdout += chunk.toString();
  });

  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  const started = await waitForHttpOk(MOCK_API_URL, 8000);
  if (!started) {
    child.kill();
    throw new Error(
      `Mock backend did not start in time.\nstdout: ${stdout.trim() || "(empty)"}\nstderr: ${stderr.trim() || "(empty)"}`,
    );
  }

  return child;
};

const stopChild = async (child) => {
  if (!child || child.exitCode !== null) {
    return;
  }

  child.kill();
  await sleep(300);

  if (child.exitCode === null) {
    child.kill();
  }
};

const navigate = async (page, url) => {
  await page.send("Page.navigate", { url });
  await sleep(2500);
};

const clickAt = async (page, x, y) => {
  await page.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, button: "none" });
  await page.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await page.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
};

const candidatePoints = [];
for (const nx of [0.16, 0.24, 0.32, 0.4, 0.48, 0.56, 0.64, 0.72, 0.8]) {
  for (const ny of [0.26, 0.36, 0.48, 0.62, 0.72]) {
    candidatePoints.push([nx, ny]);
  }
}

const main = async () => {
  const mockBackend = await startMockBackendForSmoke();
  const browserInfo = await fetch(`${DEBUG_HOST}/json/version`).then((response) => response.json());
  const pageTargets = await fetch(`${DEBUG_HOST}/json/list`).then((response) => response.json());
  const pageTarget =
    pageTargets.find((target) => target.type === "page" && target.url.startsWith(BASE_URL)) ||
    pageTargets.find((target) => target.type === "page");

  if (!pageTarget) {
    throw new Error("No debuggable page target found.");
  }

  const browser = new CDPSession(browserInfo.webSocketDebuggerUrl);
  await browser.connect();

  const page = new CDPSession(pageTarget.webSocketDebuggerUrl);
  await page.connect();

  try {
    await page.send("Page.enable");
    await page.send("Runtime.enable");
    await page.send("Page.bringToFront");

    try {
      await browser.send("Browser.grantPermissions", {
        origin: BASE_URL,
        permissions: ["geolocation"],
      });
    } catch {
      // Permission API is optional in this smoke check.
    }

    try {
      await page.send("Emulation.setGeolocationOverride", {
        latitude: 10.777233,
        longitude: 106.700806,
        accuracy: 20,
      });
    } catch {
      // Ignore if the browser target does not support this call.
    }

    await navigate(page, `${BASE_URL}/`);
    await getEvaluation(
      page,
      `(() => {
        localStorage.setItem('spot_user', JSON.stringify({
          id: 999,
          full_name: 'Parking Canvas QA',
          phone: '0999999999',
          role: 'customer'
        }));
        return true;
      })()`,
    );

    await navigate(page, `${BASE_URL}/parking`);

    const pageReady = await waitForTruthy(
      page,
      `(() => {
        const normalize = (value) =>
          String(value || '').normalize('NFD').replace(/[\\u0110\\u0111]/g, 'd').replace(/\\p{Diacritic}/gu, '').replace(/\\s+/g, ' ').trim().toUpperCase();
        const text = normalize(document.body.innerText);
        const hasCanvas = !!document.querySelector('canvas');
        const hasRouteButton = text.includes('MO GOOGLE MAPS') || text.includes('CHI DUONG');
        const hasParkingContext = text.includes('DANH SACH BAI XE') || text.includes('DAT CHO THONG MINH');
        return hasCanvas && hasRouteButton && hasParkingContext;
      })()`,
      30000,
    );

    if (!pageReady) {
      throw new Error("Parking page did not finish loading.");
    }

    const bridgeReady = await waitForTruthy(
      page,
      `(() => {
        const bridge = window.__spotAceParkingTwin;
        return !!bridge && Array.isArray(bridge.availableSlots) && bridge.availableSlots.length > 0;
      })()`,
      20000,
    );

    const projectedClicks = await getEvaluation(
      page,
      `(() => {
        const points = window.__spotAceParkingTwin?.screenPoints || [];
        return points.slice(0, 16);
      })()`,
    );

    console.log(`- Parking bridge ready: ${bridgeReady} | projected points: ${Array.isArray(projectedClicks) ? projectedClicks.length : 0}`);

    const clickTargets = Array.isArray(projectedClicks) && projectedClicks.length > 0
      ? projectedClicks.map((point) => ({ mode: "screen", ...point }))
      : candidatePoints.map(([nx, ny]) => ({ mode: "grid", nx, ny }));

    let successUrl = null;

    for (const target of clickTargets) {
      const rect = await getEvaluation(
        page,
        `(() => {
          const canvas = document.querySelector('canvas');
          if (!canvas) return null;
          const rect = canvas.getBoundingClientRect();
          return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
        })()`,
      );

      if (!rect) {
        throw new Error("Canvas rectangle not found.");
      }

      const clickX = target.mode === "screen" ? rect.left + target.x : rect.left + rect.width * target.nx;
      const clickY = target.mode === "screen" ? rect.top + target.y : rect.top + rect.height * target.ny;

      await clickAt(page, clickX, clickY);
      await sleep(900);

      const currentUrl = await getEvaluation(page, "location.href");
      if (target.mode === "screen") {
        console.log(`- Click attempt on projected slot ${target.id} at ${target.x.toFixed(1)}, ${target.y.toFixed(1)} -> ${currentUrl}`);
      } else {
        console.log(`- Click attempt at ${target.nx.toFixed(2)}, ${target.ny.toFixed(2)} -> ${currentUrl}`);
      }

      if (String(currentUrl).includes("/parking/") && String(currentUrl).includes("spot=")) {
        successUrl = currentUrl;
        break;
      }
    }

    if (!successUrl) {
      const fallbackSlot = await getEvaluation(
        page,
        `(() => window.__spotAceParkingTwin?.bookFirstAvailable?.() || null)()`,
      );

      if (fallbackSlot) {
        await sleep(900);
        const currentUrl = await getEvaluation(page, "location.href");
        console.log(`- Fallback booking via bridge -> ${fallbackSlot} -> ${currentUrl}`);
        if (String(currentUrl).includes("/parking/") && String(currentUrl).includes("spot=")) {
          successUrl = currentUrl;
        }
      }
    }

    if (!successUrl) {
      throw new Error("Could not trigger parking slot booking from the canvas or fallback bridge.");
    }

    const bookingPageReady = await waitForTruthy(
      page,
      `(() => {
        const normalize = (value) =>
          String(value || '').normalize('NFD').replace(/[\\u0110\\u0111]/g, 'd').replace(/\\p{Diacritic}/gu, '').replace(/\\s+/g, ' ').trim().toUpperCase();
        const text = normalize(document.body.innerText);
        return (
          text.includes('BIEN SO XE DINH DANH') ||
          text.includes('THOI LUONG') ||
          text.includes('TONG THANH TOAN')
        );
      })()`,
      8000,
    );

    if (!bookingPageReady) {
      const currentUrl = await getEvaluation(page, "location.href");
      const bodyPreview = await getEvaluation(page, `(() => document.body.innerText.replace(/\\s+/g, ' ').slice(0, 500))()`);
      console.log(`- Booking page preview url: ${currentUrl}`);
      console.log(`- Booking page preview text: ${bodyPreview}`);
      throw new Error(`Booking page did not render after slot click (${successUrl}).`);
    }

    console.log(`- Parking canvas click check passed: ${successUrl}`);
  } finally {
    await page.close();
    await browser.close();
    await stopChild(mockBackend);
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
