import { openPrintDocument, openPrintWindow } from "./printDocuments";

const QZ_SCRIPT_URLS = ["/qz-tray.js", "https://cdn.jsdelivr.net/npm/qz-tray/qz-tray.js"];
const QZ_PRINTER_KEY = "pos.qz.printerName";
const DRAWER_KICK_HEX = "1B700019FA";

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
      const config = qz.configs.create(printer, {
        encoding: "UTF-8",
        rasterize: true,
      });

      const jobs = [
        {
          type: "html",
          format: "plain",
          data: html,
        },
      ];

      if (openDrawer) {
        jobs.push({
          type: "raw",
          format: "hex",
          data: DRAWER_KICK_HEX,
        });
      }

      await qz.print(config, jobs);
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

