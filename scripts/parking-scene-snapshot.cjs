const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:8080";
const DEBUG_HOST = "http://127.0.0.1:9222";
const OUTPUT_PATH = path.join(process.cwd(), "logs", "parking-scene-snapshot.png");

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
      handlers.forEach((handler) => handler(message.params));
    });
  }

  send(method, params = {}) {
    const id = ++this.id;

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, handler) {
    const handlers = this.events.get(method) || [];
    handlers.push(handler);
    this.events.set(method, handlers);
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

const waitForTruthy = async (page, expression, timeoutMs = 12000) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const result = await getEvaluation(page, expression);
    if (result) {
      return true;
    }

    await sleep(250);
  }

  return false;
};

const navigate = async (page, url) => {
  await page.send("Page.navigate", { url });
  await sleep(3500);
};

const main = async () => {
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });

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
    await page.send("Emulation.setDeviceMetricsOverride", {
      width: 1600,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await page.send("Page.bringToFront");

    await navigate(page, `${BASE_URL}/parking`);
    await waitForTruthy(page, `(() => !!document.querySelector('canvas') && !!window.__spotAceParkingTwin)()`);
    await waitForTruthy(
      page,
      `(() => {
        const twin = window.__spotAceParkingTwin;
        return !!twin && Array.isArray(twin.screenPoints) && twin.screenPoints.length > 0;
      })()`,
      20000,
    );
    await sleep(1800);

    const screenshot = await page.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
    });

    fs.writeFileSync(OUTPUT_PATH, Buffer.from(screenshot.data, "base64"));
    console.log(OUTPUT_PATH);
  } finally {
    await page.close();
    await browser.close();
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
