const BASE_URL = "http://localhost:8080";
const DEBUG_HOST = "http://127.0.0.1:9222";

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
      if (!message.id) return;

      const pending = this.pending.get(message.id);
      if (!pending) return;

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
    if (!this.socket || this.socket.readyState >= 2) {
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
  }
}

const getEvaluation = async (page, expression) => {
  const result = await page.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });

  return result?.result?.value;
};

const waitForTruthy = async (page, expression, timeoutMs = 40000) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const result = await getEvaluation(page, expression);
    if (result) return true;
    await sleep(500);
  }

  return false;
};

const navigate = async (page, url) => {
  await page.send("Page.navigate", { url });
  await sleep(2500);
};

const main = async () => {
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

    await navigate(page, `${BASE_URL}/`);
    await getEvaluation(
      page,
      `(() => {
        localStorage.setItem('spot_user', JSON.stringify({
          id: 999,
          full_name: 'Parking Bridge QA',
          phone: '0999999999',
          role: 'customer'
        }));
        return true;
      })()`,
    );

    await navigate(page, `${BASE_URL}/parking`);

    const bridgeReady = await waitForTruthy(
      page,
      `(() => {
        const bridge = window.__spotAceParkingTwin;
        return !!bridge && Array.isArray(bridge.availableSlots) && bridge.availableSlots.length > 0;
      })()`,
      45000,
    );

    if (!bridgeReady) {
      throw new Error("Parking twin bridge did not become ready.");
    }

    const bookedSlot = await getEvaluation(
      page,
      `(() => window.__spotAceParkingTwin?.bookFirstAvailable?.() || null)()`,
    );

    if (!bookedSlot) {
      throw new Error("Parking twin bridge could not book a slot.");
    }

    await sleep(1200);
    const currentUrl = await getEvaluation(page, "location.href");

    if (!String(currentUrl).includes("/parking/") || !String(currentUrl).includes("spot=")) {
      throw new Error(`Booking route did not open correctly: ${currentUrl}`);
    }

    console.log(`${bookedSlot} -> ${currentUrl}`);
  } finally {
    await page.close();
    await browser.close();
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
