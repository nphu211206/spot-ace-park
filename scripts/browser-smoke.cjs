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
        if (!pending) {
          return;
        }

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

const waitForLoad = (page) =>
  new Promise((resolve) => {
    const timeout = setTimeout(resolve, 8000);
    const handler = () => {
      clearTimeout(timeout);
      resolve();
    };

    page.on("Page.loadEventFired", handler);
  });

const getEvaluation = async (page, expression) => {
  const result = await page.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });

  return result?.result?.value;
};

const waitForEvaluationTruthy = async (page, expression, timeoutMs = 8000) => {
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
  const loadPromise = waitForLoad(page);
  await page.send("Page.navigate", { url });
  await loadPromise;
  await sleep(1200);
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

const openSignupTab = async (page) => {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const clicked = await getEvaluation(
      page,
      `(() => {
        const tabs = document.querySelectorAll('[role="tab"]');
        const signupTab = tabs[1];
        signupTab?.click();
        return !!signupTab;
      })()`,
    );

    if (!clicked) {
      continue;
    }

    const signupFormReady = await waitForEvaluationTruthy(
      page,
      `(() => {
        const normalize = (value) =>
          String(value || '').normalize('NFD').replace(/[\\u0110\\u0111]/g, 'd').replace(/\\p{Diacritic}/gu, '').replace(/\\s+/g, ' ').trim().toUpperCase();
        const activeTab = [...document.querySelectorAll('[role="tab"]')].find((tab) => tab.getAttribute('data-state') === 'active');
        const visibleInputs = [...document.querySelectorAll('input')].filter((input) => {
          const style = window.getComputedStyle(input);
          return !input.disabled && style.display !== 'none' && style.visibility !== 'hidden';
        });
        return normalize(activeTab?.textContent).includes('DANG KY') && visibleInputs.length >= 4;
      })()`,
      3000,
    );

    if (signupFormReady) {
      return true;
    }
  }

  return false;
};

const logStep = (message) => console.log(`- ${message}`);

const assertChecks = (label, checks) => {
  const failures = Object.entries(checks).filter(([, value]) => typeof value === "boolean" && !value);

  if (failures.length > 0) {
    throw new Error(`${label} failed: ${failures.map(([key]) => key).join(", ")}`);
  }
};

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

  const consoleErrors = [];
  const networkIssues = [];
  const localApiResponses = [];
  const signupPhone = `09${String(Date.now()).slice(-8)}`;
  const signupPassword = "123456";

  page.on("Runtime.exceptionThrown", (params) => {
    consoleErrors.push(`Exception: ${params.exceptionDetails?.text || "Unknown error"}`);
  });

  page.on("Log.entryAdded", (params) => {
    if (params.entry.level === "error") {
      consoleErrors.push(`Console error: ${params.entry.text}`);
    }
  });

  page.on("Network.responseReceived", (params) => {
    const status = params.response?.status;
    const url = String(params.response?.url || "");

    if (url.includes("localhost:3000") || url.includes("127.0.0.1:3000")) {
      localApiResponses.push(`${status} ${url}`);
    }

    if (status >= 400) {
      networkIssues.push(`HTTP ${status}: ${url}`);
    }
  });

  try {
    await page.send("Page.enable");
    await page.send("Runtime.enable");
    await page.send("Log.enable");
    await page.send("Network.enable");
    await page.send("Page.bringToFront");

    try {
      await browser.send("Browser.grantPermissions", {
        origin: BASE_URL,
        permissions: ["geolocation"],
      });
    } catch (error) {
      logStep(`Browser.grantPermissions unavailable: ${error.message}`);
    }

    try {
      await page.send("Emulation.setGeolocationOverride", {
        latitude: 10.777233,
        longitude: 106.700806,
        accuracy: 20,
      });
    } catch (error) {
      logStep(`Emulation.setGeolocationOverride unavailable: ${error.message}`);
    }

    await navigate(page, `${BASE_URL}/`);
    await getEvaluation(page, `localStorage.removeItem('spot_user'); true;`);

    await navigate(page, `${BASE_URL}/auth`);
    const authPageCheck = await getEvaluation(
      page,
      `(() => {
        const normalize = (value) =>
          String(value || '').normalize('NFD').replace(/[\\u0110\\u0111]/g, 'd').replace(/\\p{Diacritic}/gu, '').replace(/\\s+/g, ' ').trim().toUpperCase();
        const text = normalize(document.body.innerText);
        const visibleInputs = [...document.querySelectorAll('input')].filter((input) => {
          const style = window.getComputedStyle(input);
          return !input.disabled && style.display !== 'none' && style.visibility !== 'hidden';
        });
        return {
          authTitle: text.includes('SPOT ACE PARK'),
          tabs: document.querySelectorAll('[role="tab"]').length >= 2,
          loginFields: visibleInputs.length >= 2
        };
      })()`,
    );
    logStep(`Auth page check: ${JSON.stringify(authPageCheck)}`);
    assertChecks("Auth page", authPageCheck);

    await getEvaluation(
      page,
      `localStorage.setItem('spot_user', JSON.stringify({ id: 999001, name: 'Browser Smoke User', phone: '${signupPhone}', role: 'user' })); true;`,
    );
    logStep(`Seeded authenticated user into localStorage for regression flow (${signupPhone}).`);

    await navigate(page, `${BASE_URL}/charging`);
    await waitForEvaluationTruthy(page, `(() => !!document.querySelector('.leaflet-container') || !!document.querySelector('iframe'))()`, 12000);
    const chargingCheck = await getEvaluation(
      page,
      `(() => {
        const normalize = (value) =>
          String(value || '').normalize('NFD').replace(/[\\u0110\\u0111]/g, 'd').replace(/\\p{Diacritic}/gu, '').replace(/\\s+/g, ' ').trim().toUpperCase();
        const text = normalize(document.body.innerText);
        const stationImages = [...document.querySelectorAll('button img')].slice(0, 3);
        return {
          title: text.includes('TRAM SAC'),
          canvas: !!document.querySelector('canvas'),
          photosLoaded: stationImages.length >= 3 && stationImages.every((img) => img.complete && img.naturalWidth > 0),
          mapRendered: !!document.querySelector('.leaflet-container') || !!document.querySelector('iframe'),
          routeInfo: !text.includes('CAN API KEY') && !text.includes('CHUA KICH HOAT') && (text.includes('KM') || text.includes('PHUT') || text.includes('GIO'))
        };
      })()`,
    );
    logStep(`Charging page check: ${JSON.stringify(chargingCheck)}`);
    assertChecks("Charging page", chargingCheck);

    await navigate(page, `${BASE_URL}/parking`);
    await waitForEvaluationTruthy(
      page,
      `(() => {
        const normalize = (value) =>
          String(value || '').normalize('NFD').replace(/[\\u0110\\u0111]/g, 'd').replace(/\\p{Diacritic}/gu, '').replace(/\\s+/g, ' ').trim().toUpperCase();
        const text = normalize(document.body.innerText);
        return !!document.querySelector('canvas') && text.includes('DANH SACH BAI XE');
      })()`,
      12000,
    );
    await waitForEvaluationTruthy(page, `(() => !!document.querySelector('.leaflet-container') || !!document.querySelector('iframe'))()`, 12000);
    const parkingCheck = await getEvaluation(
      page,
      `(() => {
        const normalize = (value) =>
          String(value || '').normalize('NFD').replace(/[\\u0110\\u0111]/g, 'd').replace(/\\p{Diacritic}/gu, '').replace(/\\s+/g, ' ').trim().toUpperCase();
        const text = normalize(document.body.innerText);
        const lotTitles = [...document.querySelectorAll('h4')].map((node) => normalize(node.textContent)).filter(Boolean);
        return {
          listTitle: text.includes('DANH SACH BAI XE'),
          hasLot: lotTitles.length > 0,
          has3DHint: text.includes('DANG TAI MO HINH 3D') || !!document.querySelector('canvas'),
          routeSection: text.includes('TUYEN DUONG TRONG APP') && text.includes('MO GOOGLE MAPS'),
          routeMap: !!document.querySelector('.leaflet-container') || !!document.querySelector('iframe')
        };
      })()`,
    );
    logStep(`Parking page check: ${JSON.stringify(parkingCheck)}`);
    assertChecks("Parking page", parkingCheck);

    await navigate(page, `${BASE_URL}/parking/1?spot=A11`);
    const bookingInitial = await getEvaluation(
      page,
      `(() => {
        const normalize = (value) =>
          String(value || '').normalize('NFD').replace(/[\\u0110\\u0111]/g, 'd').replace(/\\p{Diacritic}/gu, '').replace(/\\s+/g, ' ').trim().toUpperCase();
        const text = normalize(document.body.innerText);
        return {
          stepper: text.includes('BUOC NHAY') || text.includes('30 PHUT'),
          duration: text.includes('2 GIO'),
          total: text.includes('50,000D')
        };
      })()`,
    );
    logStep(`Booking page initial state: ${JSON.stringify(bookingInitial)}`);
    assertChecks("Booking page initial state", bookingInitial);

    await getEvaluation(
      page,
      `(() => {
        const normalize = (value) =>
          String(value || '').normalize('NFD').replace(/[\\u0110\\u0111]/g, 'd').replace(/\\p{Diacritic}/gu, '').replace(/\\s+/g, ' ').trim().toUpperCase();
        const hint = [...document.querySelectorAll('p')].find((node) => normalize(node.textContent).includes('BUOC NHAY 30 PHUT'));
        const container = hint?.parentElement?.parentElement;
        const buttons = container ? [...container.querySelectorAll('button')] : [];
        buttons[buttons.length - 1]?.click();
        return true;
      })()`,
    );
    await sleep(600);

    const bookingAfterPlus = await getEvaluation(
      page,
      `(() => {
        const normalize = (value) =>
          String(value || '').normalize('NFD').replace(/[\\u0110\\u0111]/g, 'd').replace(/\\p{Diacritic}/gu, '').replace(/\\s+/g, ' ').trim().toUpperCase();
        const text = normalize(document.body.innerText);
        return {
          duration: text.includes('2 GIO 30 PHUT'),
          total: text.includes('62,500D')
        };
      })()`,
    );
    logStep(`Booking page after +30 minutes: ${JSON.stringify(bookingAfterPlus)}`);
    assertChecks("Booking page after +30 minutes", bookingAfterPlus);

    const paymentInit = await getEvaluation(
      page,
      `(() => {
        const normalize = (value) =>
          String(value || '').normalize('NFD').replace(/[\\u0110\\u0111]/g, 'd').replace(/\\p{Diacritic}/gu, '').replace(/\\s+/g, ' ').trim().toUpperCase();
        const input = document.querySelector('input[placeholder="29A-123.45"]');
        if (!input) return { inputFound: false, clicked: false };
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        setter.call(input, '24A-54764');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        const payButton = [...document.querySelectorAll('button')].find((button) => normalize(button.textContent).includes('THANH TOAN NGAY'));
        payButton?.click();
        return { inputFound: true, clicked: !!payButton };
      })()`,
    );
    logStep(`Booking form submit attempt: ${JSON.stringify(paymentInit)}`);
    assertChecks("Booking form submit", paymentInit);
    await sleep(1200);

    const paymentModalCheck = await getEvaluation(
      page,
      `(() => {
        const normalize = (value) =>
          String(value || '').normalize('NFD').replace(/[\\u0110\\u0111]/g, 'd').replace(/\\p{Diacritic}/gu, '').replace(/\\s+/g, ' ').trim().toUpperCase();
        const dialogText = document.querySelector('[role="dialog"]')?.innerText || '';
        const text = normalize(dialogText);
        return {
          modal: text.includes('THANH TOAN AN TOAN'),
          amount: text.includes('62,500')
        };
      })()`,
    );
    logStep(`Payment modal check: ${JSON.stringify(paymentModalCheck)}`);
    assertChecks("Payment modal", paymentModalCheck);

    const confirmAttempt = await getEvaluation(
      page,
      `(() => {
        const normalize = (value) =>
          String(value || '').normalize('NFD').replace(/[\\u0110\\u0111]/g, 'd').replace(/\\p{Diacritic}/gu, '').replace(/\\s+/g, ' ').trim().toUpperCase();
        const confirmButton = [...document.querySelectorAll('button')].find((button) => normalize(button.textContent).includes('XAC NHAN THANH TOAN'));
        confirmButton?.click();
        return !!confirmButton;
      })()`,
    );
    logStep(`Payment confirm click: ${JSON.stringify(confirmAttempt)}`);
    if (!confirmAttempt) {
      throw new Error("Payment confirm button was not found.");
    }

    const successUiReady = await waitForEvaluationTruthy(
      page,
      `(() => {
        const normalize = (value) =>
          String(value || '').normalize('NFD').replace(/[\\u0110\\u0111]/g, 'd').replace(/\\p{Diacritic}/gu, '').replace(/\\s+/g, ' ').trim().toUpperCase();
        const dialog = document.querySelector('[role="dialog"]');
        const dialogText = normalize(dialog?.innerText || '');
        const pageText = normalize(document.body.innerText);
        const successModalVisible =
          !!dialog &&
          dialogText.includes('THANH TOAN THANH CONG') &&
          dialogText.includes('BIEN LAI DIEN TU');
        const ticketPageVisible =
          pageText.includes('VE DIEN TU') &&
          pageText.includes('A11') &&
          pageText.includes('62,500D');
        return successModalVisible || ticketPageVisible;
      })()`,
      15000,
    );
    if (!successUiReady) {
      const paymentStateDebug = await getEvaluation(
        page,
        `(() => {
          const normalize = (value) =>
            String(value || '').normalize('NFD').replace(/[\\u0110\\u0111]/g, 'd').replace(/\\p{Diacritic}/gu, '').replace(/\\s+/g, ' ').trim().toUpperCase();
          const dialog = document.querySelector('[role="dialog"]');
          return {
            url: window.location.href,
            dialogText: normalize(dialog?.innerText || '').slice(0, 500),
            pageText: normalize(document.body.innerText || '').slice(0, 900)
          };
        })()`,
      );
      logStep(`Payment success debug: ${JSON.stringify(paymentStateDebug)}`);
      throw new Error("Payment success UI did not appear as modal or ticket page.");
    }

    const paymentSuccessState = await getEvaluation(
      page,
      `(() => {
        const normalize = (value) =>
          String(value || '').normalize('NFD').replace(/[\\u0110\\u0111]/g, 'd').replace(/\\p{Diacritic}/gu, '').replace(/\\s+/g, ' ').trim().toUpperCase();
        const dialog = document.querySelector('[role="dialog"]');
        const dialogText = normalize(dialog?.innerText || '');
        const pageText = normalize(document.body.innerText);
        return {
          successModalVisible:
            !!dialog &&
            dialogText.includes('THANH TOAN THANH CONG') &&
            dialogText.includes('BIEN LAI DIEN TU'),
          ticketPageVisible:
            pageText.includes('VE DIEN TU') &&
            pageText.includes('A11') &&
            pageText.includes('62,500D')
        };
      })()`,
    );
    logStep(`Payment success UI state: ${JSON.stringify(paymentSuccessState)}`);

    await waitForEvaluationTruthy(
      page,
      `(() => {
        const normalize = (value) =>
          String(value || '').normalize('NFD').replace(/[\\u0110\\u0111]/g, 'd').replace(/\\p{Diacritic}/gu, '').replace(/\\s+/g, ' ').trim().toUpperCase();
        const text = normalize(document.body.innerText);
        return text.includes('VE DIEN TU') && text.includes('A11') && text.includes('62,500D');
      })()`,
      12000,
    );

    const paymentTicketCheck = await getEvaluation(
      page,
      `(() => {
        const normalize = (value) =>
          String(value || '').normalize('NFD').replace(/[\\u0110\\u0111]/g, 'd').replace(/\\p{Diacritic}/gu, '').replace(/\\s+/g, ' ').trim().toUpperCase();
        const text = normalize(document.body.innerText);
        return {
          ticket: text.includes('VE DIEN TU'),
          transaction: text.includes('MA GD:'),
          paidAmount: text.includes('62,500D'),
          spot: text.includes('A11')
        };
      })()`,
    );
    logStep(`Payment ticket page check: ${JSON.stringify(paymentTicketCheck)}`);
    assertChecks("Payment ticket page", paymentTicketCheck);

    await navigate(page, `${BASE_URL}/bookings`);
    await waitForEvaluationTruthy(
      page,
      `(() => {
        const text = String(document.body.innerText || '');
        return text.includes('24A-54764');
      })()`,
      12000,
    );
    const bookingsCheck = await getEvaluation(
      page,
      `(() => {
        const normalize = (value) =>
          String(value || '').normalize('NFD').replace(/[\\u0110\\u0111]/g, 'd').replace(/\\p{Diacritic}/gu, '').replace(/\\s+/g, ' ').trim().toUpperCase();
        const text = normalize(document.body.innerText);
        return {
          title: text.includes('LICH SU DAT CHO'),
          vehicle: text.includes('24A-54764'),
          price: text.includes('62,500D'),
          qrButton: text.includes('MO VE QR')
        };
      })()`,
    );
    logStep(`Bookings page check: ${JSON.stringify(bookingsCheck)}`);
    assertChecks("Bookings page", bookingsCheck);

    const qrDialogAttempt = await getEvaluation(
      page,
      `(() => {
        const normalize = (value) =>
          String(value || '').normalize('NFD').replace(/[\\u0110\\u0111]/g, 'd').replace(/\\p{Diacritic}/gu, '').replace(/\\s+/g, ' ').trim().toUpperCase();
        const qrButton = [...document.querySelectorAll('button')].find((button) => normalize(button.textContent).includes('MO VE QR'));
        qrButton?.click();
        return !!qrButton;
      })()`,
    );
    logStep(`Bookings QR button click: ${JSON.stringify(qrDialogAttempt)}`);
    if (!qrDialogAttempt) {
      throw new Error("Bookings QR button was not found.");
    }

    await sleep(800);

    const qrDialogCheck = await getEvaluation(
      page,
      `(() => {
        const normalize = (value) =>
          String(value || '').normalize('NFD').replace(/[\\u0110\\u0111]/g, 'd').replace(/\\p{Diacritic}/gu, '').replace(/\\s+/g, ' ').trim().toUpperCase();
        const dialog = document.querySelector('[role="dialog"]');
        const qrImage = dialog?.querySelector('img');
        const text = normalize(dialog?.innerText || '');
        return {
          dialogOpen: !!dialog,
          qrLoaded: !!qrImage && qrImage.complete && qrImage.naturalWidth > 0,
          vehicle: text.includes('24A-54764'),
          transaction: text.includes('TXN-')
        };
      })()`,
    );
    logStep(`Bookings QR dialog check: ${JSON.stringify(qrDialogCheck)}`);
    assertChecks("Bookings QR dialog", qrDialogCheck);

    if (consoleErrors.length > 0) {
      console.log("- Console/runtime issues detected:");
      [...new Set(consoleErrors)].forEach((entry) => console.log(`  * ${entry}`));
    } else {
      logStep("No console/runtime errors captured during smoke test.");
    }

    const requiredResponses = ["/api/payment/confirm", "/api/bookings"];
    const apiCheck = requiredResponses.reduce((summary, apiPath) => {
      summary[apiPath] = localApiResponses.some((entry) => entry.includes(apiPath));
      return summary;
    }, {});
    logStep(`Local API coverage: ${JSON.stringify(apiCheck)}`);
    assertChecks("Local API coverage", apiCheck);

    if (networkIssues.length > 0) {
      console.log("- Network issues detected:");
      [...new Set(networkIssues)].forEach((entry) => console.log(`  * ${entry}`));
      throw new Error("Network issues were detected during the browser smoke test.");
    }
  } finally {
    await page.close();
    await browser.close();
    await stopChild(mockBackend);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
