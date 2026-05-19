import { openPrintDocument, openPrintWindow } from "./printDocuments";

const QZ_SCRIPT_URLS = ["/qz-tray.js", "https://cdn.jsdelivr.net/npm/qz-tray/qz-tray.js"];
const QZ_PRINTER_KEY = "pos.qz.printerName";
const QZ_DRAWER_PIN_KEY = "pos.qz.drawerPin";
const QZ_DRAWER_PROFILE_KEY = "pos.qz.drawerProfile";
const DRAWER_KICK_BY_PIN = {
  0: "1B700019FA",
  1: "1B700119FA",
};

const DRAWER_PROFILES = {
  default: [
    "1B700019FA", // ESC p 0, 25ms on, 250ms off
    "1B700119FA", // ESC p 1, 25ms on, 250ms off
  ],
  "3nstar": [
    "1B40",       // ESC @ initialize
    "1B700032FA", // ESC p 0, 50ms on, 250ms off
    "1B700132FA", // ESC p 1, 50ms on, 250ms off
    "1B700064FA", // ESC p 0, 100ms on, 250ms off
    "1B700164FA", // ESC p 1, 100ms on, 250ms off
    "07",         // BEL fallback used by some drawers/printers
  ],
};

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      if (window.qz) resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

export const loadQzTray = async () => {
  if (typeof window === "undefined") return null;
  if (window.qz) return window.qz;

  for (const src of QZ_SCRIPT_URLS) {
    try {
      await loadScript(src);
      if (window.qz) return window.qz;
    } catch {
      // Try the next source; QZ remains optional.
    }
  }

  return null;
};

const connectQz = async (qz) => {
  if (!qz) return false;
  if (qz.websocket?.isActive?.()) return true;
  await qz.websocket.connect();
  return qz.websocket.isActive();
};

const getPrinterName = async (qz) => {
  const configuredPrinter = String(localStorage.getItem(QZ_PRINTER_KEY) || "").trim();
  if (configuredPrinter) return qz.printers.find(configuredPrinter);
  return qz.printers.getDefault();
};

export const openCashDrawerWithQz = async ({ printerName = null } = {}) => {
  const qz = await loadQzTray();
  if (!qz) throw new Error("QZ Tray no esta disponible en el navegador.");

  await connectQz(qz);
  const printer = printerName || (await getPrinterName(qz));
  const config = qz.configs.create(printer, {
    encoding: "UTF-8",
  });

  const preferredPin = String(localStorage.getItem(QZ_DRAWER_PIN_KEY) || "").trim();
  const profile = String(localStorage.getItem(QZ_DRAWER_PROFILE_KEY) || "3nstar")
    .trim()
    .toLowerCase();
  const profileCommands = DRAWER_PROFILES[profile] || DRAWER_PROFILES.default;
  const commands = preferredPin && DRAWER_KICK_BY_PIN[preferredPin]
    ? [DRAWER_KICK_BY_PIN[preferredPin]]
    : profileCommands;

  for (const data of commands) {
    await qz.print(config, [{ type: "raw", format: "hex", data }]);
  }

  return true;
};

export const installQzDebugHelpers = () => {
  if (typeof window === "undefined") return;

  window.posQzStatus = async () => {
    const qz = await loadQzTray();
    if (!qz) return { ok: false, error: "QZ Tray JS no cargo" };

    const active = Boolean(qz.websocket?.isActive?.());
    let printer = null;
    let printers = [];

    try {
      if (!active) await connectQz(qz);
      printer = await getPrinterName(qz);
      printers = await qz.printers.find();
    } catch (error) {
      return { ok: false, active, error: error.message || String(error) };
    }

    return {
      ok: true,
      active: Boolean(qz.websocket?.isActive?.()),
      printer,
      printers,
      drawerProfile: localStorage.getItem(QZ_DRAWER_PROFILE_KEY) || "3nstar",
      drawerPin: localStorage.getItem(QZ_DRAWER_PIN_KEY) || "auto",
    };
  };

  window.posOpenDrawer = async () => openCashDrawerWithQz();
};

installQzDebugHelpers();

export const printTicketWithDrawer = async ({
  title,
  html,
  width = 420,
  height = 900,
  openDrawer = true,
  fallbackToBrowser = true,
} = {}) => {
  const qz = await loadQzTray();

  if (qz) {
    try {
      await connectQz(qz);
      const printer = await getPrinterName(qz);
      const htmlConfig = qz.configs.create(printer, {
        encoding: "UTF-8",
        rasterize: true,
      });

      await qz.print(htmlConfig, [
        {
          type: "html",
          format: "plain",
          data: html,
        },
      ]);

      if (openDrawer) {
        await openCashDrawerWithQz({ printerName: printer });
      }

      return { printedWithQz: true };
    } catch (error) {
      console.warn("No se pudo imprimir con QZ Tray; usando navegador.", error);
      if (!fallbackToBrowser) throw error;
    }
  }

  const printWindow = openPrintWindow({ title, width, height });
  openPrintDocument({
    title,
    html,
    width,
    height,
    printWindow,
  });

  return { printedWithQz: false };
};
